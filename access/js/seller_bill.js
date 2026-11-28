// Quản lý các đơn mẫu trong seller_bill.html, lưu riêng theo người bán.
// Chưa kết nối API vận chuyển, thanh toán hoặc đơn mua của khách hàng.
(function () {
    'use strict';

    function init() {
        const $ = selector => document.querySelector(selector);
        const $$ = selector => Array.from(document.querySelectorAll(selector));
        if (!$('#list') || !$('#tabs')) return;

        const normalize = value => String(value || '').toLowerCase().normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ' ').trim();
        const statuses = {
            cho_xac_nhan: { label: 'Chờ xác nhận', color: 'bg-warning-subtle text-warning-emphasis', button: 'Xác nhận' },
            cho_lay: { label: 'Chờ lấy hàng', color: 'bg-primary-subtle text-primary-emphasis', button: 'Đóng gói' },
            da_dong_goi: { label: 'Đã đóng gói', color: 'bg-info-subtle text-info-emphasis', button: 'Bàn giao' },
            dang_giao: { label: 'Đang giao', color: 'bg-primary-subtle text-primary-emphasis', button: 'Chi tiết' },
            da_giao: { label: 'Đã giao', color: 'bg-success-subtle text-success-emphasis', button: 'Chi tiết' },
            huy_cho_duyet: { label: 'Hủy chờ duyệt', color: 'bg-danger-subtle text-danger-emphasis', button: 'Xử lý' },
            tra_hang: { label: 'Trả hàng / Hoàn tiền', color: 'bg-danger-subtle text-danger-emphasis', button: 'Xử lý' },
            cho_nhan_tra: { label: 'Chờ nhận hàng trả', color: 'bg-warning-subtle text-warning-emphasis', button: 'Xử lý' },
            da_huy: { label: 'Đã hủy', color: 'bg-secondary-subtle text-secondary-emphasis', button: 'Chi tiết' },
            da_hoan: { label: 'Đã nhận hàng trả', color: 'bg-secondary-subtle text-secondary-emphasis', button: 'Chi tiết' }
        };
        const actions = {
            confirm: { from: ['cho_xac_nhan'], to: 'cho_lay', label: 'Xác nhận đơn', event: 'Shop xác nhận đơn' },
            pack: { from: ['cho_lay'], to: 'da_dong_goi', label: 'Đã đóng gói xong', event: 'Shop đóng gói' },
            ship: { from: ['da_dong_goi'], to: 'dang_giao', label: 'Bàn giao vận chuyển', event: 'Bàn giao vận chuyển' },
            deliver: { from: ['dang_giao'], to: 'da_giao', label: 'Xác nhận đã giao', event: 'Giao hàng thành công', ask: 'Xác nhận khách đã nhận được hàng?' },
            cancel: { from: ['cho_xac_nhan', 'cho_lay'], to: 'da_huy', label: 'Hủy đơn', event: 'Shop hủy đơn', danger: true, ask: 'Bạn có chắc muốn hủy đơn này?' },
            'approve-cancel': { from: ['huy_cho_duyet'], to: 'da_huy', label: 'Đồng ý hủy đơn', event: 'Shop đồng ý hủy đơn', ask: 'Đồng ý yêu cầu hủy đơn của khách?' },
            'reject-cancel': { from: ['huy_cho_duyet'], to: 'cho_lay', label: 'Từ chối hủy', event: 'Shop từ chối hủy đơn, tiếp tục chuẩn bị hàng', secondary: true, ask: 'Từ chối yêu cầu hủy và tiếp tục xử lý đơn?' },
            'approve-return': { from: ['tra_hang'], to: 'cho_nhan_tra', label: 'Chấp nhận trả hàng', event: 'Shop chấp nhận trả hàng, chờ nhận hàng trả', ask: 'Chấp nhận trả hàng? Thao tác này chưa thực hiện hoàn tiền.' },
            'reject-return': { from: ['tra_hang'], to: 'da_giao', label: 'Từ chối trả hàng', event: 'Shop từ chối yêu cầu trả hàng', secondary: true, ask: 'Bạn có chắc muốn từ chối yêu cầu trả hàng?' },
            'receive-return': { from: ['cho_nhan_tra'], to: 'da_hoan', label: 'Xác nhận đã nhận hàng trả', event: 'Shop đã nhận hàng trả, chờ xử lý hoàn tiền', ask: 'Xác nhận shop đã nhận hàng trả? Hoàn tiền cần được xử lý riêng.' }
        };
        const tabs = $$('#tabs [data-filter]');
        const state = { filter: 'all', q: '', carrier: 'all', pay: 'all', page: 1 };
        const pageSize = 10;
        let toastTimer;

        function notify(message) {
            $('#toastBody').textContent = message;
            if (window.bootstrap && window.bootstrap.Toast) {
                window.bootstrap.Toast.getOrCreateInstance($('#toast'), { delay: 3500 }).show();
            } else {
                clearTimeout(toastTimer);
                $('#toast').classList.add('show');
                toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
            }
        }

        function storageKey() {
            try {
                const raw = sessionStorage.getItem('currentSeller') || localStorage.getItem('currentSeller');
                const seller = raw ? JSON.parse(raw) : null;
                return 'novamall_seller_bill_v1_' + encodeURIComponent(seller && (seller.id || seller.account) || 'demo');
            } catch (error) {
                return 'novamall_seller_bill_v1_demo';
            }
        }

        const key = storageKey();
        function readSaved() {
            const raw = localStorage.getItem(key);
            if (!raw) return {};
            const saved = JSON.parse(raw);
            if (!saved || saved.version !== 1 || !saved.orders || typeof saved.orders !== 'object' || Array.isArray(saved.orders)) {
                throw new Error('Dữ liệu đơn hàng không hợp lệ.');
            }
            return saved.orders;
        }

        function getSection(drawer, title) {
            return Array.from(drawer.querySelectorAll('.offcanvas-body > section')).find(section =>
                normalize(section.querySelector('.sec-title').textContent) === normalize(title));
        }

        const orders = $$('#list tr[data-status]').map(row => {
            const link = row.querySelector('[data-bs-target]');
            const drawer = $(link.getAttribute('data-bs-target'));
            const shipping = getSection(drawer, 'Giao nhận');
            const trackingLabel = Array.from(shipping.querySelectorAll('dt')).find(dt => normalize(dt.textContent) === 'ma van don');
            const trackingField = trackingLabel.nextElementSibling;
            const tracking = trackingField.querySelector('.tnum');
            const payment = getSection(drawer, 'Thanh toán');
            const paymentField = Array.from(payment.querySelectorAll('.v')).find(value =>
                normalize(value.parentElement.firstElementChild.textContent) === 'trang thai');
            const order = {
                id: link.textContent.trim(), row, drawer, trackingField, paymentField,
                initialStatus: row.dataset.status,
                initialTracking: tracking ? tracking.textContent.trim() : '',
                initialTimeline: drawer.querySelector('.tl').innerHTML,
                initialPayment: row.cells[3].querySelector('.small').innerHTML,
                initialDetailPayment: paymentField.innerHTML,
                initialNote: row.cells[5].querySelector('.small').textContent,
                initialTrackingHtml: trackingField.innerHTML,
                initialNet: payment.querySelector('.sum-net .v').textContent,
                carrier: row.cells[4].querySelector('.fw-semibold').textContent.trim(),
                pay: row.dataset.pay,
                history: []
            };
            order.status = order.initialStatus;
            order.tracking = order.initialTracking;
            return order;
        });

        // Chỉ phục hồi chuỗi thao tác hợp lệ, không tin trực tiếp trạng thái đã lưu.
        function restore(order, record) {
            order.status = order.initialStatus;
            order.tracking = order.initialTracking;
            order.history = [];
            if (!record || !Array.isArray(record.history) || record.history.length > 30) return;
            let status = order.initialStatus;
            const valid = record.history.every(entry => {
                const action = entry && Object.prototype.hasOwnProperty.call(actions, entry.action) && actions[entry.action];
                if (!action || !action.from.includes(status) || typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at))) return false;
                status = action.to;
                return true;
            });
            if (!valid || status !== record.status) return;
            order.status = status;
            order.history = record.history.map(entry => ({ action: entry.action, at: entry.at }));
            if (typeof record.tracking === 'string' && /^[A-Za-z0-9-]{1,80}$/.test(record.tracking)) {
                order.tracking = record.tracking;
            }
        }

        function makeButton(label, action, className) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn ' + className;
            button.dataset.action = action;
            button.textContent = label;
            return button;
        }

        function timelineItem(timeline, title) {
            const item = document.createElement('li');
            const dot = document.createElement('span');
            dot.className = 'dot';
            const text = document.createElement('div');
            text.className = 'tt';
            text.textContent = title;
            item.append(dot, text);
            timeline.appendChild(item);
            return item;
        }

        function renderTimeline(order) {
            const timeline = order.drawer.querySelector('.tl');
            timeline.innerHTML = order.initialTimeline;
            if (!order.history.length) return;
            timeline.querySelectorAll('.cur').forEach(item => item.classList.remove('cur'));
            order.history.forEach(entry => {
                const action = actions[entry.action];
                let item = Array.from(timeline.children).find(element => {
                    const title = normalize(element.querySelector('.tt').textContent);
                    return title === normalize(action.event) || (entry.action === 'ship' && title.startsWith('ban giao cho'));
                });
                if (!item) item = timelineItem(timeline, action.event);
                item.className = action.to === 'da_huy' ? 'bad' : 'done';
                let time = item.querySelector('.tm');
                if (!time) {
                    time = document.createElement('div');
                    time.className = 'tm';
                    item.appendChild(time);
                }
                time.textContent = new Date(entry.at).toLocaleString('vi-VN');
            });
            const nextSteps = {
                cho_lay: ['Shop đóng gói', 'shop dong goi'],
                da_dong_goi: ['Bàn giao cho ' + order.carrier, 'ban giao'],
                dang_giao: ['Giao hàng thành công', 'giao hang thanh cong']
            };
            const next = nextSteps[order.status];
            if (next) {
                let item = Array.from(timeline.children).find(element =>
                    normalize(element.querySelector('.tt').textContent).startsWith(next[1]));
                if (!item) item = timelineItem(timeline, next[0]);
                item.className = 'cur';
            }
            if (['da_huy', 'da_hoan'].includes(order.status)) {
                Array.from(timeline.children).filter(item => !item.className).forEach(item => item.remove());
            }
        }

        function renderOrder(order) {
            const status = statuses[order.status];
            order.row.dataset.status = order.status;
            [order.row.cells[5].querySelector('.badge'), order.drawer.querySelector('.offcanvas-header .badge')].forEach(badge => {
                badge.textContent = status.label;
                badge.className = 'badge rounded-pill ' + status.color;
            });
            order.row.cells[6].querySelector('button').textContent = status.button;
            const latest = order.history[order.history.length - 1];
            order.row.cells[5].querySelector('.small').textContent = latest ? actions[latest.action].event : order.initialNote;

            order.trackingField.innerHTML = order.initialTrackingHtml;
            if (order.tracking) order.trackingField.textContent = order.tracking;
            order.row.cells[4].querySelector('.small').textContent = order.tracking || 'Chưa có vận đơn';
            renderTimeline(order);
            const alert = order.drawer.querySelector('.offcanvas-body > .alert');
            if (alert) alert.hidden = !['huy_cho_duyet', 'tra_hang'].includes(order.status);

            const payment = order.row.cells[3].querySelector('.small');
            payment.innerHTML = order.initialPayment;
            order.paymentField.innerHTML = order.initialDetailPayment;
            let paymentText = '';
            if (order.status === 'da_huy') paymentText = order.pay === 'cod' ? 'Không thu hộ COD' : 'Chờ hoàn tiền';
            if (order.status === 'da_hoan') paymentText = 'Chờ xử lý hoàn tiền';
            if (order.status === 'da_giao' && order.pay === 'cod') paymentText = 'Đã thu hộ COD';
            if (paymentText) {
                payment.textContent = paymentText;
                order.paymentField.textContent = paymentText;
            }
            getSection(order.drawer, 'Thanh toán').querySelector('.sum-net .v').textContent =
                ['da_huy', 'da_hoan'].includes(order.status) ? '0đ' : order.initialNet;

            const footer = order.drawer.querySelector('.offcanvas-footer');
            footer.replaceChildren();
            Object.keys(actions).forEach(name => {
                const action = actions[name];
                if (action.from.includes(order.status)) {
                    footer.appendChild(makeButton(action.label, name,
                        action.danger ? 'btn-outline-danger' : action.secondary ? 'btn-outline-secondary' : 'btn-primary'));
                }
            });
            footer.appendChild(makeButton(order.status === 'da_giao' ? 'In hóa đơn' : 'In chi tiết đơn', 'print', 'btn-outline-secondary'));
            order.search = normalize(order.row.textContent + ' ' + order.drawer.querySelector('.offcanvas-body').textContent);
        }

        function matchesTab(order, filter) {
            return filter === 'all' || filter.split(' ').includes(order.status);
        }

        function updateSelection() {
            const visible = orders.filter(order => !order.row.classList.contains('d-none'));
            const selected = visible.filter(order => order.row.querySelector('.row-chk').checked).length;
            $('#chkAll').checked = visible.length > 0 && selected === visible.length;
            $('#chkAll').indeterminate = selected > 0 && selected < visible.length;
            $('#chkAll').disabled = visible.length === 0;
        }

        function renderPagination(total) {
            const pagination = $('.pagination');
            if (!pagination) return;
            pagination.replaceChildren();
            const pages = Math.max(1, Math.ceil(total / pageSize));
            const addPage = (label, page, disabled, active) => {
                const item = document.createElement('li');
                item.className = 'page-item' + (disabled ? ' disabled' : '') + (active ? ' active' : '');
                const button = makeButton(label, '', '');
                button.className = 'page-link';
                delete button.dataset.action;
                button.dataset.page = page;
                button.disabled = disabled;
                if (active) button.setAttribute('aria-current', 'page');
                item.appendChild(button);
                pagination.appendChild(item);
            };
            addPage('Trước', state.page - 1, state.page === 1, false);
            for (let page = 1; page <= pages; page++) addPage(String(page), page, false, state.page === page);
            addPage('Sau', state.page + 1, state.page === pages, false);
        }

        function applyFilters() {
            const keywords = state.q.split(' ').filter(Boolean);
            const filtered = orders.filter(order => matchesTab(order, state.filter) &&
                keywords.every(word => order.search.includes(word)) &&
                (state.carrier === 'all' || order.carrier === state.carrier) &&
                (state.pay === 'all' || order.pay === state.pay));
            state.page = Math.max(1, Math.min(state.page, Math.ceil(filtered.length / pageSize) || 1));
            const visible = filtered.slice((state.page - 1) * pageSize, state.page * pageSize);
            orders.forEach(order => {
                const show = visible.includes(order);
                order.row.classList.toggle('d-none', !show);
                if (!show) order.row.querySelector('.row-chk').checked = false;
            });
            tabs.forEach(tab => {
                const active = tab.dataset.filter === state.filter;
                tab.classList.toggle('active', active);
                tab.setAttribute('aria-selected', String(active));
                const badge = tab.querySelector('.badge');
                badge.textContent = orders.filter(order => matchesTab(order, tab.dataset.filter)).length;
                badge.className = 'badge rounded-pill ' + (active ? 'bg-primary-subtle text-primary' :
                    tab.dataset.filter === 'cho_xac_nhan' ? 'text-bg-warning' : 'bg-body-secondary text-body-secondary');
            });
            $('#emptyRow').classList.toggle('d-none', filtered.length > 0);
            $('#countText').textContent = 'Hiển thị ' + visible.length + ' trên ' + filtered.length + ' đơn (tổng ' + orders.length + ' đơn)';
            renderPagination(filtered.length);
            updateSelection();
        }

        function reload() {
            try {
                const saved = readSaved();
                orders.forEach(order => restore(order, saved[order.id]));
            } catch (error) {
                notify('Không đọc được dữ liệu đã lưu. Đang hiển thị dữ liệu mẫu.');
                orders.forEach(order => restore(order, null));
            }
            orders.forEach(renderOrder);
            applyFilters();
        }

        function performAction(order, name) {
            if (!Object.prototype.hasOwnProperty.call(actions, name)) return;
            const action = actions[name];
            if (!action.from.includes(order.status)) return;
            if (action.ask && !window.confirm(action.ask + '\nĐơn: ' + order.id)) return;
            try {
                const saved = readSaved();
                const current = Object.assign({}, order);
                restore(current, saved[order.id]);
                if (JSON.stringify(current.history) !== JSON.stringify(order.history)) {
                    reload();
                    notify('Đơn đã thay đổi ở tab khác. Vui lòng kiểm tra lại trước khi xử lý.');
                    return;
                }
                const tracking = name === 'pack' && !order.tracking ? 'DEMO-' + order.id : order.tracking;
                saved[order.id] = {
                    status: action.to,
                    tracking,
                    history: order.history.concat({ action: name, at: new Date().toISOString() })
                };
                // Chỉ đổi giao diện sau khi lưu thành công.
                localStorage.setItem(key, JSON.stringify({ version: 1, orders: saved }));
                restore(order, saved[order.id]);
                renderOrder(order);
                applyFilters();
                notify(action.event + ' · ' + order.id + (name === 'pack' ? ' (mã vận đơn DEMO)' : ''));
            } catch (error) {
                notify('Không thể lưu thay đổi. Vui lòng kiểm tra dữ liệu và quyền lưu trữ của trình duyệt.');
            }
        }

        function printOrder(order) {
            const popup = window.open('', '_blank', 'width=900,height=700');
            if (!popup) {
                notify('Trình duyệt đã chặn cửa sổ in. Vui lòng cho phép cửa sổ bật lên và thử lại.');
                return;
            }
            popup.opener = null;
            const doc = popup.document;
            doc.documentElement.lang = 'vi';
            doc.title = 'Đơn hàng ' + order.id;
            const style = doc.createElement('style');
            style.textContent = 'body{font:14px Arial,sans-serif;color:#111;max-width:760px;margin:32px auto;padding:0 20px}h1{font-size:24px}h2{font-size:18px;margin-top:24px}.d-flex{display:flex;justify-content:space-between;gap:16px}.list-group{padding:0;list-style:none}.list-group-item{padding:12px 0;border-bottom:1px solid #ddd}.tile,.dotc{display:none}.flex-grow-1{flex:1}.fw-semibold,.sum-total{font-weight:bold}.small{font-size:12px;color:#555}.py-1{padding:5px 0}dl{display:grid;grid-template-columns:140px 1fr;gap:8px}dt,dd{margin:0}.sum-total{border-top:1px solid #aaa}@page{margin:16mm}@media print{body{margin:0;max-width:none;padding:0}section{break-inside:avoid}}';
            doc.head.appendChild(style);
            const heading = doc.createElement('h1');
            heading.textContent = order.status === 'da_giao' ? 'Hóa đơn bán hàng' : 'Chi tiết đơn hàng';
            const meta = doc.createElement('p');
            meta.textContent = order.id + ' · ' + statuses[order.status].label;
            doc.body.append(heading, meta);
            ['Sản phẩm', 'Thanh toán', 'Giao nhận'].forEach(title => {
                const section = getSection(order.drawer, title).cloneNode(true);
                const originalHeading = section.querySelector('h3');
                const newHeading = doc.createElement('h2');
                newHeading.textContent = title;
                originalHeading.replaceWith(newHeading);
                // Bản in cho khách không bao gồm phí giao dịch và doanh thu nội bộ.
                section.querySelectorAll('.mt-2').forEach(element => element.remove());
                doc.body.appendChild(doc.importNode(section, true));
            });
            const note = doc.createElement('p');
            note.className = 'small';
            note.textContent = 'Bản in từ dữ liệu mẫu NovaMall. Mã DEMO không dùng để tra cứu vận chuyển thực tế.';
            doc.body.appendChild(note);
            popup.addEventListener('afterprint', () => popup.close(), { once: true });
            popup.setTimeout(() => { popup.focus(); popup.print(); }, 250);
        }

        function syncStatusUrl() {
            const url = new URL(window.location.href);
            if (state.filter === 'all') url.searchParams.delete('status');
            else url.searchParams.set('status', state.filter.split(' ')[0]);
            window.history.replaceState(window.history.state, '', url);
        }

        $('#tabs').addEventListener('click', event => {
            const tab = event.target.closest('[data-filter]');
            if (!tab) return;
            state.filter = tab.dataset.filter;
            state.page = 1;
            applyFilters();
            syncStatusUrl();
        });
        $('#q').addEventListener('input', event => {
            state.q = normalize(event.target.value);
            state.page = 1;
            applyFilters();
        });
        [['#fCarrier', 'carrier'], ['#fPay', 'pay']].forEach(([selector, field]) => {
            $(selector).addEventListener('change', event => {
                state[field] = event.target.value;
                state.page = 1;
                applyFilters();
            });
        });
        $('#reset').addEventListener('click', () => {
            Object.assign(state, { filter: 'all', q: '', carrier: 'all', pay: 'all', page: 1 });
            $('#q').value = '';
            $('#fCarrier').value = 'all';
            $('#fPay').value = 'all';
            orders.forEach(order => { order.row.querySelector('.row-chk').checked = false; });
            applyFilters();
            syncStatusUrl();
        });
        $('#chkAll').addEventListener('change', event => {
            orders.forEach(order => {
                if (!order.row.classList.contains('d-none')) order.row.querySelector('.row-chk').checked = event.target.checked;
            });
            updateSelection();
        });
        $('#list').addEventListener('change', updateSelection);
        const pagination = $('.pagination');
        if (pagination) pagination.addEventListener('click', event => {
            const button = event.target.closest('[data-page]');
            if (!button || button.disabled) return;
            state.page = Number(button.dataset.page);
            applyFilters();
        });
        document.addEventListener('click', event => {
            const button = event.target.closest('.offcanvas-footer [data-action]');
            if (!button) return;
            const order = orders.find(item => item.drawer.contains(button));
            if (!order) return;
            if (button.dataset.action === 'print') printOrder(order);
            else performAction(order, button.dataset.action);
        });
        window.addEventListener('storage', event => {
            if (event.key === key || event.key === null) reload();
        });

        const requestedStatus = new URLSearchParams(window.location.search).get('status');
        const initialTab = tabs.find(tab => tab.dataset.filter === requestedStatus || tab.dataset.filter.split(' ').includes(requestedStatus));
        if (initialTab) state.filter = initialTab.dataset.filter;
        if (window.matchMedia) {
            const media = window.matchMedia('(prefers-color-scheme: dark)');
            const theme = () => document.documentElement.setAttribute('data-bs-theme', media.matches ? 'dark' : 'light');
            theme();
            if (media.addEventListener) media.addEventListener('change', theme);
        }
        reload();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

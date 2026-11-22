/* JavaScript tối thiểu: lọc theo tab / từ khóa, chọn tất cả, thông báo.
   Toàn bộ nội dung đơn hàng và chi tiết nằm sẵn trong index.html. */
(function () {
    'use strict';

    // Giao diện sáng/tối theo hệ thống (Bootstrap 5.3)
    if (window.matchMedia) {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        var theme = function () { document.documentElement.setAttribute('data-bs-theme', mq.matches ? 'dark' : 'light'); };
        theme();
        if (mq.addEventListener) mq.addEventListener('change', theme);
    }

    var $ = function (s) { return document.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
    var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'); };

    var rows = $$('#list tr[data-status]');
    var state = { filter: 'all', q: '', carrier: 'all', pay: 'all' };

    // Dữ liệu tìm kiếm lấy từ chính nội dung HTML của từng dòng
    rows.forEach(function (r) { r.setAttribute('data-search', norm(r.textContent)); });

    function apply() {
        var shown = 0;
        rows.forEach(function (r) {
            var okTab = state.filter === 'all' || state.filter.split(' ').indexOf(r.getAttribute('data-status')) > -1;
            var okQ = !state.q || r.getAttribute('data-search').indexOf(state.q) > -1;
            var okC = state.carrier === 'all' || r.getAttribute('data-search').indexOf(norm(state.carrier)) > -1;
            var okP = state.pay === 'all' || r.getAttribute('data-pay') === state.pay;
            var show = okTab && okQ && okC && okP;
            r.classList.toggle('d-none', !show);
            if (show) shown++;
        });
        $('#emptyRow').classList.toggle('d-none', shown > 0);
        $('#countText').textContent = 'Hiển thị ' + shown + ' trên ' + rows.length + ' đơn';
        $('#chkAll').checked = false;
    }

    // Tab trạng thái
    $('#tabs').addEventListener('click', function (e) {
        var b = e.target.closest('[data-filter]');
        if (!b) return;
        $$('#tabs .nav-link').forEach(function (x) {
            var on = x === b;
            x.classList.toggle('active', on);
            x.setAttribute('aria-selected', on);
            var n = x.querySelector('.badge');
            if (!x.hasAttribute('data-warn') && n.classList.contains('text-bg-warning')) x.setAttribute('data-warn', '1');
            if (on) { n.className = 'badge rounded-pill bg-primary-subtle text-primary'; }
            else { n.className = 'badge rounded-pill ' + (x.hasAttribute('data-warn') ? 'text-bg-warning' : 'bg-body-secondary text-body-secondary'); }
        });
        state.filter = b.getAttribute('data-filter');
        apply();
    });

    // Tìm kiếm, lọc, đặt lại
    $('#q').addEventListener('input', function (e) { state.q = norm(e.target.value.trim()); apply(); });
    $('#fCarrier').addEventListener('change', function (e) { state.carrier = e.target.value; apply(); });
    $('#fPay').addEventListener('change', function (e) { state.pay = e.target.value; apply(); });
    $('#reset').addEventListener('click', function () {
        state.q = ''; state.carrier = 'all'; state.pay = 'all';
        $('#q').value = ''; $('#fCarrier').value = 'all'; $('#fPay').value = 'all';
        apply();
    });

    // Chọn tất cả các dòng đang hiện
    $('#chkAll').addEventListener('change', function (e) {
        rows.forEach(function (r) {
            if (!r.classList.contains('d-none')) r.querySelector('.row-chk').checked = e.target.checked;
        });
    });

    // Thông báo (nút thao tác trong chi tiết đơn, mục menu chưa có)
    var toast = bootstrap.Toast.getOrCreateInstance($('#toast'), { delay: 2800 });
    document.addEventListener('click', function (e) {
        var a = e.target.closest('[data-action]');
        if (!a) return;
        $('#toastBody').textContent = a.getAttribute('data-msg') || 'Đã thực hiện';
        toast.show();
        var open = a.closest('.offcanvas.show');
        if (open && !a.closest('#sidebar')) bootstrap.Offcanvas.getOrCreateInstance(open).hide();
    });

    // Menu trái: chuyển nhanh sang tab tương ứng
    document.addEventListener('click', function (e) {
        var g = e.target.closest('[data-goto]');
        if (!g) return;
        var f = g.getAttribute('data-goto');
        var tab = $$('#tabs [data-filter]').filter(function (t) { return t.getAttribute('data-filter') === f; })[0];
        if (tab) tab.click();
        var sb = $('#sidebar');
        if (sb.classList.contains('show')) bootstrap.Offcanvas.getOrCreateInstance(sb).hide();
    });
    (function () {
        const status = new URLSearchParams(location.search).get("status");
        if (!status) return;
        const tab = document.querySelector(`#tabs [data-filter~="${status}"]`);
        if (tab) tab.click();
    })();
})();

import {
    getProductList,
    saveProductList,
    PRODUCT_STORAGE_KEY,
    isValidProductImage
} from "./product.js";
import { getShopList } from "./seller.js";

// Dùng chung dữ liệu với trang mua hàng, nhưng chỉ thao tác sản phẩm của gian hàng hiện tại.
const $ = id => document.getElementById(id);
const pageSize = 6;
const money = value => `${Number(value).toLocaleString("vi-VN")}₫`;
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);
const state = {
    seller: null, shop: null, products: [], selected: new Set(),
    filter: "all", category: "all", stock: "all", sort: "updated", page: 1,
    editingSnapshot: null, ready: false
};

function showMessage(element, message, type = "danger") {
    element.textContent = message;
    element.className = `alert alert-${type} py-2 small`;
    element.hidden = false;
}

function notify(message, type = "success") {
    showMessage($("productNotice"), message, type);
}

function getContext() {
    const raw = sessionStorage.getItem("currentSeller") || localStorage.getItem("currentSeller");
    const seller = raw ? JSON.parse(raw) : null;
    if (!seller || !seller.id) throw new Error("Vui lòng đăng nhập kênh người bán để quản lý sản phẩm.");
    if (seller.status === "BI_KHOA") throw new Error("Tài khoản người bán đã bị khóa.");
    const shops = getShopList();
    if (!Array.isArray(shops)) throw new Error("Dữ liệu gian hàng không hợp lệ.");
    const shop = shops.find(item => item && item.id && String(item.sellerId) === String(seller.id));
    if (!shop) throw new Error("Chưa tìm thấy gian hàng của bạn. Vui lòng đăng ký gian hàng trước.");
    return { seller, shop };
}

function ownsProduct(product) {
    // Nếu có sellerId, luôn ưu tiên người bán được ghi trên sản phẩm.
    return product.sellerId != null
        ? String(product.sellerId) === String(state.seller?.id)
        : String(product.shopId) === String(state.shop?.id);
}

function ownedProducts(products = state.products) {
    return products.filter(ownsProduct);
}

function readLatest() {
    const { seller, shop } = getContext();
    if (String(seller.id) !== String(state.seller.id) || String(shop.id) !== String(state.shop.id)) {
        throw new Error("Tài khoản đã thay đổi. Vui lòng tải lại trang trước khi tiếp tục.");
    }
    return getProductList();
}

function statusOf(product) {
    if (["DA_AN", "TAM_KHOA"].includes(product.status)) return "hidden";
    if (product.status === "CHO_DUYET") return "pending";
    return product.stock === 0 ? "out" : "active";
}

function filteredProducts() {
    return ownedProducts().filter(product => {
        return (state.filter === "all" || statusOf(product) === state.filter)
            && (state.category === "all" || product.category === state.category)
            && (state.stock === "all" || (state.stock === "low" ? product.stock < 10 : product.stock === 0));
    }).sort((a, b) => {
        if (state.sort === "name") return a.name.localeCompare(b.name, "vi");
        if (state.sort === "priceAsc") return a.newPrice - b.newPrice || a.id - b.id;
        if (state.sort === "priceDesc") return b.newPrice - a.newPrice || b.id - a.id;
        if (state.sort === "stockAsc") return a.stock - b.stock || a.id - b.id;
        return (Date.parse(b.updatedAt) || b.id) - (Date.parse(a.updatedAt) || a.id);
    });
}

function currentPage() {
    const products = filteredProducts();
    state.page = Math.min(state.page, Math.max(1, Math.ceil(products.length / pageSize)));
    return products.slice((state.page - 1) * pageSize, state.page * pageSize);
}

function refreshCategories() {
    const categories = new Set(["Thời trang Nữ", "Điện thoại & Tablet", "Phụ kiện Âm thanh", "Phụ kiện máy tính"]);
    if (state.shop?.category) categories.add(state.shop.category);
    ownedProducts().forEach(product => categories.add(product.category));
    const options = [...categories].sort((a, b) => a.localeCompare(b, "vi"));
    $("categoryFilter").replaceChildren(new Option("Tất cả ngành hàng", "all"),
        ...options.map(category => new Option(category, category)));
    if (state.category !== "all" && !categories.has(state.category)) state.category = "all";
    $("categoryFilter").value = state.category;
    $("productCategories").replaceChildren(...options.map(category => new Option(category, category)));
}

function renderCounts() {
    const products = ownedProducts();
    const counts = { all: products.length, active: 0, out: 0, pending: 0, hidden: 0 };
    products.forEach(product => counts[statusOf(product)]++);
    for (const [key, value] of Object.entries(counts)) {
        $(`count${key[0].toUpperCase()}${key.slice(1)}`).textContent = value;
    }
    $("inventoryWarningCount").textContent = products.filter(product => product.stock < 10).length;
    document.querySelectorAll("#statusTabs [data-filter]").forEach(tab => {
        const active = tab.dataset.filter === state.filter;
        tab.classList.toggle("active", active);
        tab.classList.toggle("text-dark", !active && tab.dataset.filter !== "out");
        tab.classList.toggle("bg-white", !active && tab.dataset.filter === "out");
        tab.classList.toggle("text-danger", !active && tab.dataset.filter === "out");
        tab.setAttribute("aria-current", active ? "page" : "false");
    });
    const lastUpdate = Math.max(0, ...products.map(product => Date.parse(product.updatedAt) || 0));
    $("productUpdatedAt").textContent = lastUpdate
        ? `Cập nhật: ${new Date(lastUpdate).toLocaleString("vi-VN")}` : "Dữ liệu lưu trên trình duyệt này";
}

function renderRow(product) {
    const id = product.id;
    const status = statusOf(product);
    const locked = product.status === "TAM_KHOA";
    const badges = {
        active: ["success", "Đang hoạt động"], out: ["danger", "Hết hàng"],
        pending: ["warning", "Chờ duyệt"], hidden: ["secondary", locked ? "Tạm khóa" : "Đã ẩn"]
    };
    const [color, label] = badges[status];
    const variants = Object.values(product.options || {}).flat()
        .filter(option => option && option.name).map(option => option.name);
    const hidden = product.status === "DA_AN";
    return `<tr${product.stock < 10 ? ' class="table-warning-soft"' : ""}>
        <td><input type="checkbox" class="form-check-input product-check" data-id="${id}"
            aria-label="Chọn ${escapeHtml(product.name)}"${state.selected.has(id) ? " checked" : ""}></td>
        <td><div class="d-flex align-items-center gap-2">
            <img class="nova-thumb object-fit-cover" src="${escapeHtml(product.image)}" alt="" loading="lazy">
            <div><div class="nova-name fw-semibold" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</div>
                <span class="nova-sku">${escapeHtml(product.sku || `SP-${id}`)}</span>
                ${product.barcode ? `<div class="small text-secondary">${escapeHtml(product.barcode)}</div>` : ""}
            </div></div></td>
        <td><div class="small">${escapeHtml(product.category)}</div>
            <div class="small text-secondary text-wrap">${escapeHtml(variants.join(", ") || "Không có biến thể")}</div></td>
        <td><div class="fw-semibold">${money(product.newPrice)}</div>
            ${product.oldPrice > product.newPrice ? `<del class="small text-secondary">${money(product.oldPrice)}</del>` : ""}</td>
        <td><span class="badge fs-6 ${product.stock < 10 ? "text-bg-warning" : "bg-light text-dark"}">${product.stock.toLocaleString("vi-VN")}</span></td>
        <td>${product.sold.toLocaleString("vi-VN")}</td>
        <td><span class="badge text-bg-${color}">${label}</span></td>
        <td class="text-end text-nowrap">
            <button type="button" class="btn btn-link" data-product-action="edit" data-id="${id}" title="Sửa sản phẩm" aria-label="Sửa sản phẩm"><i class="bi bi-pencil-square"></i></button>
            <button type="button" class="btn btn-link" data-product-action="toggle" data-id="${id}"
                title="${locked ? "Sản phẩm đang bị tạm khóa" : hidden ? "Hiện sản phẩm" : "Ẩn sản phẩm"}"
                aria-label="${hidden ? "Hiện sản phẩm" : "Ẩn sản phẩm"}"${locked ? " disabled" : ""}><i class="bi bi-eye${hidden ? "" : "-slash"}"></i></button>
            <button type="button" class="btn btn-link" data-product-action="delete" data-id="${id}" title="Xóa sản phẩm" aria-label="Xóa sản phẩm"><i class="bi bi-trash"></i></button>
        </td></tr>`;
}

function syncSelection() {
    const page = currentPage();
    const count = page.filter(product => state.selected.has(product.id)).length;
    $("checkAll").checked = page.length > 0 && count === page.length;
    $("checkAll").indeterminate = count > 0 && count < page.length;
    $("checkAll").disabled = !page.length || !state.ready;
    $("checkAllLabel").textContent = `Chọn tất cả (Trang này: ${page.length})`;
    $("selectedProductCount").textContent = `Đã chọn: ${state.selected.size}`;
    ["btnBulkUpdate", "btnBulkHide", "btnBulkPrice", "btnBulkDelete"].forEach(id => {
        $(id).disabled = !state.ready || state.selected.size === 0;
    });
}

function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const list = $("productPagination");
    list.replaceChildren();
    const add = (label, target, disabled = false) => {
        const item = document.createElement("li");
        item.className = `page-item${disabled ? " disabled" : ""}${label === String(state.page) ? " active" : ""}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "page-link";
        button.textContent = label;
        button.disabled = disabled;
        button.dataset.page = target;
        if (label === String(state.page)) button.setAttribute("aria-current", "page");
        item.append(button);
        list.append(item);
    };
    add("‹ Trước", state.page - 1, state.page === 1);
    for (let page = 1; page <= pages; page++) {
        if (page === 1 || page === pages || Math.abs(page - state.page) <= 1) add(String(page), page);
        else if (page === state.page - 2 || page === state.page + 2) add("…", page, true);
    }
    add("Sau ›", state.page + 1, state.page === pages);
}

function render() {
    refreshCategories();
    renderCounts();
    const products = filteredProducts();
    const page = currentPage();
    const pageIds = new Set(page.map(product => product.id));
    state.selected.forEach(id => { if (!pageIds.has(id)) state.selected.delete(id); });
    $("productTableBody").innerHTML = page.length ? page.map(renderRow).join("")
        : '<tr><td colspan="8" class="text-center text-secondary py-5">Không có sản phẩm phù hợp.</td></tr>';
    const start = products.length ? (state.page - 1) * pageSize + 1 : 0;
    $("productResultCount").textContent = `Hiển thị ${start} - ${products.length ? start + page.length - 1 : 0} trên tổng số ${products.length} sản phẩm`;
    $("btnAddProduct").disabled = !state.ready;
    $("btnExportProducts").disabled = !state.ready || !products.length;
    renderPagination(products.length);
    syncSelection();
}

function resetPage() {
    state.page = 1;
    state.selected.clear();
    render();
}

function commit(products, message) {
    // Chỉ cập nhật giao diện sau khi lưu thành công (ví dụ localStorage có thể đã đầy).
    saveProductList(products);
    state.products = products;
    state.selected.clear();
    render();
    notify(message);
}

function openEditor(id) {
    if (!state.ready) return;
    try {
        state.products = readLatest();
        const product = id == null ? null : ownedProducts().find(item => item.id === id);
        if (id != null && !product) throw new Error("Sản phẩm không còn tồn tại hoặc không thuộc gian hàng của bạn.");
        state.editingSnapshot = product ? JSON.stringify(product) : null;
        $("productForm").reset();
        $("productFormError").hidden = true;
        $("productSku").setCustomValidity("");
        $("productNewPrice").setCustomValidity("");
        $("productModalTitle").textContent = product ? "Sửa sản phẩm" : "Thêm sản phẩm mới";
        $("productId").value = product?.id ?? "";
        $("productName").value = product?.name ?? "";
        $("productSku").value = product ? product.sku || `SP-${product.id}` : "";
        $("productBarcode").value = product?.barcode ?? "";
        $("productCategory").value = product?.category ?? state.shop.category ?? "";
        $("productOldPrice").value = product?.oldPrice ?? "";
        $("productNewPrice").value = product && product.newPrice !== product.oldPrice ? product.newPrice : "";
        $("productStock").value = product?.stock ?? 0;
        $("productStatus").value = product?.status ?? "DANG_BAN";
        $("productStatus").disabled = product?.status === "TAM_KHOA";
        $("productImage").value = product?.image ?? "";
        $("productDescription").value = product?.description ?? "";
        bootstrap.Modal.getOrCreateInstance($("productModal")).show();
    } catch (error) {
        notify(error.message, "danger");
    }
}

function saveProduct(event) {
    event.preventDefault();
    $("productFormError").hidden = true;
    try {
        const latest = readLatest();
        const id = $("productId").value ? Number($("productId").value) : null;
        const existing = id == null ? null : latest.find(product => product.id === id && ownsProduct(product));
        if (id != null && (!existing || JSON.stringify(existing) !== state.editingSnapshot)) {
            throw new Error("Sản phẩm đã thay đổi hoặc đã bị xóa. Hãy đóng biểu mẫu và mở lại để cập nhật dữ liệu mới.");
        }
        const sku = $("productSku").value.trim();
        const duplicate = ownedProducts(latest).some(product => product.id !== id
            && String(product.sku || `SP-${product.id}`).toUpperCase() === sku.toUpperCase());
        $("productSku").setCustomValidity(duplicate ? "Mã SKU đã tồn tại trong gian hàng." : "");
        const oldPrice = Number($("productOldPrice").value);
        const newPrice = $("productNewPrice").value === "" ? oldPrice : Number($("productNewPrice").value);
        $("productNewPrice").setCustomValidity(newPrice > oldPrice ? "Giá khuyến mãi không được lớn hơn giá niêm yết." : "");
        if (!$("productForm").reportValidity()) return;
        const stock = Number($("productStock").value);
        const name = $("productName").value.trim();
        const category = $("productCategory").value.trim();
        const image = $("productImage").value.trim();
        if (!name || !sku || !category) throw new Error("Vui lòng nhập đầy đủ tên sản phẩm, mã SKU và ngành hàng.");
        if (![oldPrice, newPrice, stock].every(Number.isSafeInteger) || oldPrice <= 0 || newPrice <= 0 || stock < 0) {
            throw new Error("Giá phải là số nguyên dương; tồn kho phải là số nguyên không âm hợp lệ.");
        }
        if (!isValidProductImage(image)) throw new Error("Ảnh phải là URL http/https hoặc đường dẫn ../access/picture/ trong dự án.");
        const status = existing?.status === "TAM_KHOA" ? "TAM_KHOA" : $("productStatus").value;
        if (!["DANG_BAN", "CHO_DUYET", "DA_AN", "TAM_KHOA"].includes(status)) throw new Error("Trạng thái sản phẩm không hợp lệ.");
        const timestamp = new Date().toISOString();
        let nextId = Date.now();
        while (latest.some(product => product.id === nextId)) nextId++;
        const product = {
            ...(existing || {
                id: nextId, sellerId: state.seller.id, shopId: state.shop.id, shopName: state.shop.name,
                sold: 0, rate: 0, isFlashSale: false, createdAt: timestamp, options: {}
            }),
            name, sku, barcode: $("productBarcode").value.trim(), category,
            oldPrice, newPrice, stock, status, image,
            description: $("productDescription").value.trim(), updatedAt: timestamp
        };
        // Giữ các ảnh/video và biến thể cũ khi chỉnh sửa; ảnh bìa mới vẫn có trong thư viện.
        const images = existing?.gallery?.images || [];
        product.gallery = { ...existing?.gallery, images: [image, ...images.filter(src => src !== image)] };
        const products = existing ? latest.map(item => item.id === existing.id ? product : item) : [...latest, product];
        commit(products, existing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.");
        bootstrap.Modal.getOrCreateInstance($("productModal")).hide();
    } catch (error) {
        showMessage($("productFormError"), error.message);
    }
}

function selectedFrom(products, ids) {
    const selected = ownedProducts(products).filter(product => ids.has(product.id));
    if (!selected.length || selected.length !== ids.size) {
        throw new Error("Một số sản phẩm đã thay đổi hoặc không thuộc gian hàng. Vui lòng tải lại danh sách và chọn lại.");
    }
    return selected;
}

function updateSelected(action, ids = new Set(state.selected), value = null) {
    const latest = readLatest();
    const selected = selectedFrom(latest, ids);
    if (["hide", "show"].includes(action) && selected.some(product => product.status === "TAM_KHOA")) {
        throw new Error("Không thể đổi trạng thái sản phẩm đang bị tạm khóa.");
    }
    if (action === "price" && selected.some(product => value > product.oldPrice)) {
        throw new Error("Giá bán mới không được lớn hơn giá niêm yết của bất kỳ sản phẩm đã chọn.");
    }
    if (action === "delete" && !window.confirm(`Xóa ${selected.length} sản phẩm đã chọn? Thao tác này không thể hoàn tác.`)) return false;
    const timestamp = new Date().toISOString();
    const products = action === "delete" ? latest.filter(product => !ids.has(product.id)) : latest.map(product => {
        if (!ids.has(product.id)) return product;
        const change = action === "price" ? { newPrice: value } : action === "stock" ? { stock: value }
            : { status: action === "hide" ? "DA_AN" : "DANG_BAN" };
        // Duyệt viên giữ nguyên sản phẩm chờ duyệt; thao tác hàng loạt không thể tự duyệt.
        if (action === "show" && product.status === "CHO_DUYET") {
            return { ...product, updatedAt: timestamp };
        }
        return { ...product, ...change, updatedAt: timestamp };
    });
    commit(products, `Đã cập nhật ${selected.length} sản phẩm${action === "delete" ? " (đã xóa)" : ""}.`);
    return true;
}

function configureBulk() {
    const action = $("bulkAction").value;
    const numeric = ["price", "stock"].includes(action);
    $("bulkValueGroup").hidden = !numeric;
    $("bulkValue").required = numeric;
    $("bulkValue").min = action === "price" ? "1" : "0";
    $("bulkValue").max = String(Number.MAX_SAFE_INTEGER);
    $("bulkValueLabel").textContent = action === "price" ? "Giá bán mới (₫)" : "Tồn kho mới";
}

function openBulk(action = "hide") {
    if (!state.selected.size) return notify("Vui lòng chọn ít nhất một sản phẩm.", "warning");
    $("bulkProductForm").reset();
    $("bulkFormError").hidden = true;
    $("bulkAction").value = action;
    $("bulkSelectedCount").textContent = state.selected.size;
    configureBulk();
    $("btnApplyBulk").disabled = false;
    bootstrap.Modal.getOrCreateInstance($("bulkProductModal")).show();
}

function exportProducts() {
    // Nút này hiện chỉ mô phỏng thao tác; chưa tạo hoặc tải file thật.
    notify("Tính năng xuất dữ liệu đang được mô phỏng.", "info");
}

function bindEvents() {
    $("btnAddProduct").addEventListener("click", () => openEditor());
    $("productForm").addEventListener("submit", saveProduct);
    $("productModal").addEventListener("shown.bs.modal", () => $("productName").focus());
    $("productSku").addEventListener("input", () => $("productSku").setCustomValidity(""));
    ["productNewPrice", "productOldPrice"].forEach(id => $(id).addEventListener("input", () => $("productNewPrice").setCustomValidity("")));
    $("statusTabs").addEventListener("click", event => {
        const tab = event.target.closest("[data-filter]");
        if (!tab) return;
        event.preventDefault();
        state.filter = tab.dataset.filter;
        resetPage();
    });
    const applyFilters = () => {
        state.category = $("categoryFilter").value;
        state.stock = $("stockFilter").value;
        resetPage();
    };
    $("categoryFilter").addEventListener("change", applyFilters);
    $("stockFilter").addEventListener("change", applyFilters);
    $("productFilterForm").addEventListener("submit", event => { event.preventDefault(); applyFilters(); });
    $("productFilterForm").addEventListener("reset", () => {
        // Reset mặc định của trình duyệt chạy sau sự kiện reset.
        setTimeout(() => {
            $("productSearch").value = "";
            $("categoryFilter").value = "all";
            $("stockFilter").value = "all";
            state.category = "all"; state.stock = "all"; state.filter = "all";
            resetPage();
        }, 0);
    });
    $("productPagination").addEventListener("click", event => {
        const button = event.target.closest("button[data-page]");
        if (!button || button.disabled) return;
        state.page = Number(button.dataset.page);
        state.selected.clear();
        render();
    });
    $("checkAll").addEventListener("change", event => {
        currentPage().forEach(product => event.target.checked ? state.selected.add(product.id) : state.selected.delete(product.id));
        render();
    });
    $("productTableBody").addEventListener("change", event => {
        if (!event.target.matches(".product-check")) return;
        const id = Number(event.target.dataset.id);
        event.target.checked ? state.selected.add(id) : state.selected.delete(id);
        syncSelection();
    });
    $("productTableBody").addEventListener("click", event => {
        const button = event.target.closest("[data-product-action]");
        if (!button || button.disabled) return;
        const id = Number(button.dataset.id);
        if (button.dataset.productAction === "edit") return openEditor(id);
        try {
            const product = selectedFrom(readLatest(), new Set([id]))[0];
            updateSelected(button.dataset.productAction === "delete" ? "delete" : product.status === "DA_AN" ? "show" : "hide", new Set([id]));
        } catch (error) { notify(error.message, "danger"); }
    });
    $("btnBulkUpdate").addEventListener("click", () => openBulk());
    $("btnBulkPrice").addEventListener("click", () => openBulk("price"));
    $("btnBulkHide").addEventListener("click", () => {
        try { updateSelected("hide"); } catch (error) { notify(error.message, "danger"); }
    });
    $("btnBulkDelete").addEventListener("click", () => {
        try { updateSelected("delete"); } catch (error) { notify(error.message, "danger"); }
    });
    $("bulkAction").addEventListener("change", configureBulk);
    $("bulkProductForm").addEventListener("submit", event => {
        event.preventDefault();
        $("bulkFormError").hidden = true;
        const action = $("bulkAction").value;
        const numeric = ["price", "stock"].includes(action);
        const value = numeric ? Number($("bulkValue").value) : null;
        try {
            if (!$("bulkProductForm").reportValidity()) return;
            if (!["hide", "show", "price", "stock"].includes(action)) throw new Error("Thao tác không hợp lệ.");
            if (numeric && (!Number.isSafeInteger(value) || value < (action === "price" ? 1 : 0))) throw new Error("Vui lòng nhập số nguyên hợp lệ.");
            updateSelected(action, new Set(state.selected), value);
            bootstrap.Modal.getOrCreateInstance($("bulkProductModal")).hide();
        } catch (error) { showMessage($("bulkFormError"), error.message); }
    });
    $("btnExportProducts").addEventListener("click", exportProducts);
    window.addEventListener("storage", event => {
        if ([null, PRODUCT_STORAGE_KEY, "currentSeller", "shopList"].includes(event.key)) {
            try {
                state.products = readLatest();
                state.selected.clear();
                render();
                notify("Dữ liệu đã được cập nhật từ tab khác.", "info");
            } catch (error) {
                state.ready = false;
                state.products = [];
                render();
                notify(error.message, "danger");
            }
        }
    });
}

function init() {
    if (!$("productTableBody")) return;
    bindEvents();
    try {
        const { seller, shop } = getContext();
        state.seller = seller;
        state.shop = shop;
        state.products = getProductList();
        state.ready = true;
        const status = new URLSearchParams(window.location.search).get("status");
        if (status === "canh_bao_kho") {
            state.stock = "low";
            $("stockFilter").value = "low";
        } else if (["all", "active", "out", "pending", "hidden"].includes(status)) state.filter = status;
    } catch (error) {
        notify(error instanceof SyntaxError ? "Dữ liệu đăng nhập hoặc gian hàng không hợp lệ. Vui lòng đăng nhập lại." : error.message, "danger");
    }
    render();
}

init();

// order.js — Quản lý đơn mua của người dùng

/** Lấy user hiện tại từ localStorage */
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
        return null;
    }
}

/** Key lưu đơn hàng theo user */
function getOrderStorageKey(user) {
    if (!user) return null;
    return `orders_user_${user.id || user.account}`;
}

/** Lấy danh sách đơn hàng của user hiện tại */
export function getOrders() {
    const user = getCurrentUser();
    if (!user) return [];
    const key = getOrderStorageKey(user);
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

/** Lưu danh sách đơn hàng */
function saveOrders(orders) {
    const user = getCurrentUser();
    if (!user) return;
    const key = getOrderStorageKey(user);
    localStorage.setItem(key, JSON.stringify(orders));
}

/** Tạo đơn hàng mới từ giỏ hàng (gọi khi nhấn MUA HÀNG) */
export function saveOrder(cartItems, totalAmount) {
    const user = getCurrentUser();
    if (!user || !cartItems || cartItems.length === 0) return null;

    const orders = getOrders();
    const newOrder = {
        orderId: "NM" + Date.now(),
        date: new Date().toLocaleDateString("vi-VN", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        }),
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice || item.price,
            quantity: item.quantity,
            variant: item.variant || "",
            shopName: item.shopName || "NovaMall"
        })),
        totalAmount,
        status: "Chờ xác nhận"
    };

    orders.unshift(newOrder); // Thêm đơn mới lên đầu
    saveOrders(orders);

    // Xóa giỏ hàng sau khi đặt
    const cartKey = `cart_user_${user.id || user.account}`;
    localStorage.removeItem(cartKey);

    return newOrder;
}

/** Format tiền VND */
function formatPrice(num) {
    return Number(num).toLocaleString("vi-VN") + "đ";
}

/** Màu badge theo trạng thái */
function getStatusBadge(status) {
    const map = {
        "Chờ xác nhận": { cls: "order-status-pending", icon: "schedule" },
        "Đang giao hàng": { cls: "order-status-shipping", icon: "local_shipping" },
        "Đã giao hàng":  { cls: "order-status-delivered", icon: "check_circle" },
        "Đã hủy":        { cls: "order-status-cancelled", icon: "cancel" }
    };
    const s = map[status] || { cls: "order-status-unknown", icon: "help" };
    return `<span class="badge ${s.cls} order-status-badge">
        <span class="material-symbols-outlined">${s.icon}</span>
        ${status}
    </span>`;
}

/** Render trang đơn mua vào #order_items_wrapper */
export function renderOrderPage() {
    const wrapper = document.getElementById("order_items_wrapper");
    if (!wrapper) return;

    const user = getCurrentUser();
    if (!user) {
        wrapper.innerHTML = `
            <div class="order-empty-state text-center">
                <div class="order-empty-icon mb-3">
                    <span class="material-symbols-outlined order-empty-symbol">receipt_long</span>
                </div>
                <h5 class="text-muted mb-3">Vui lòng đăng nhập để xem đơn hàng</h5>
                <a href="/html/login.html" class="btn order-login-btn px-5">Đăng nhập</a>
            </div>`;
        return;
    }

    const orders = getOrders();

    if (orders.length === 0) {
        wrapper.innerHTML = `
            <div class="order-empty-state text-center">
                <div class="order-empty-icon mb-3">
                    <span class="material-symbols-outlined order-empty-symbol">shopping_bag</span>
                </div>
                <h5 class="text-muted mb-2">Chưa có đơn hàng nào</h5>
                <p class="text-muted small mb-4">Hãy khám phá hàng nghìn sản phẩm hấp dẫn!</p>
                <a href="/html/catalog_product.html" class="btn order-shop-btn px-5">Mua sắm ngay</a>
            </div>`;
        return;
    }

    wrapper.innerHTML = orders.map(order => `
        <div class="order-card mb-4">
            <div class="order-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="order-card-meta">
                    <span class="material-symbols-outlined order-receipt-icon me-1">receipt_long</span>
                    <span class="order-id fw-semibold">Đơn hàng #${order.orderId}</span>
                    <span class="order-date text-muted small ms-3">${order.date}</span>
                </div>
                ${getStatusBadge(order.status)}
            </div>
            <div class="order-card-body">
                ${order.items.map(item => `
                    <div class="order-item d-flex align-items-center gap-3">
                        <img src="${item.image}" alt="${item.name}" class="order-item-img">
                        <div class="order-item-details flex-grow-1">
                            <div class="order-item-name">${item.name}</div>
                            ${item.variant ? `<div class="order-item-variant text-muted small">Phân loại: ${item.variant}</div>` : ""}
                            <div class="order-item-shop text-muted small">
                                <span class="material-symbols-outlined order-shop-icon">store</span>
                                ${item.shopName}
                            </div>
                        </div>
                        <div class="order-item-amount text-end">
                            <div class="order-item-price">${formatPrice(item.price)}</div>
                            <div class="order-item-qty text-muted small">x${item.quantity}</div>
                        </div>
                    </div>
                `).join("")}
            </div>
            <div class="order-card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span class="order-item-count text-muted small">${order.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
                <div class="order-total-row">
                    <span class="text-muted me-2">Thành tiền:</span>
                    <span class="order-total">${formatPrice(order.totalAmount)}</span>
                </div>
            </div>
        </div>
    `).join("");
}

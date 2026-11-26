// ==========================================================================
// CART.JS - QUẢN LÝ GIỎ HÀNG PHÂN BIỆT THEO TỪNG TÀI KHOẢN NGƯỜI DÙNG
// ==========================================================================

/**
 * Lấy thông tin tài khoản người dùng đang đăng nhập
 */
export function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("currentUser"));
    } catch (e) {
        console.error("Lỗi đọc currentUser:", e);
        return null;
    }
}

/**
 * Lấy key lưu trữ giỏ hàng trong localStorage dựa theo tài khoản đang đăng nhập
 * - Người dùng đăng nhập: "cart_user_{id}" hoặc "cart_user_{account}"
 * - Chưa đăng nhập: null (bắt buộc phải đăng nhập)
 */
export function getCartStorageKey() {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.id || currentUser.account)) {
        const userIdentifier = currentUser.id || currentUser.account;
        return `cart_user_${userIdentifier}`;
    }
    return null;
}

/**
 * Lấy danh sách sản phẩm trong giỏ hàng của tài khoản hiện tại
 */
export function getCart() {
    const key = getCartStorageKey();
    if (!key) return [];
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        console.error("Lỗi đọc giỏ hàng:", e);
        return [];
    }
}

/**
 * Lưu danh sách sản phẩm vào giỏ hàng của tài khoản hiện tại
 */
export function saveCart(cart) {
    const key = getCartStorageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(cart));
    updateHeaderCartCount();
}

/**
 * Cập nhật số lượng sản phẩm trên icon Giỏ hàng ở Header
 */
export function updateHeaderCartCount() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        document.querySelectorAll(".navbar__cart-count").forEach(badge => {
            badge.textContent = 0;
            badge.style.display = "none";
        });
        return;
    }

    const cart = getCart();
    const totalCount = cart.reduce((total, item) => total + (Number(item.quantity) || 1), 0);

    const countBadges = document.querySelectorAll(".navbar__cart-count");
    countBadges.forEach(badge => {
        badge.textContent = totalCount;
        badge.style.display = totalCount > 0 ? "inline-block" : "none";
    });
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {Object} newItem - Thông tin sản phẩm cần thêm
 * @returns {boolean} - true nếu thêm thành công, false nếu chưa đăng nhập hoặc lỗi
 */
export function addToCart(newItem) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        if (confirm("Bạn cần đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng!\nBạn có muốn chuyển đến trang Đăng nhập ngay bây giờ?")) {
            window.location.href = "login.html";
        }
        return false;
    }

    const cart = getCart();

    // Tìm xem sản phẩm đã có trong giỏ chưa (cùng productId, cùng màu sắc, cùng loại)
    const existingIndex = cart.findIndex(item => 
        item.productId === newItem.productId &&
        (item.color || "") === (newItem.color || "") &&
        (item.type || "") === (newItem.type || "")
    );

    if (existingIndex > -1) {
        // Đã có: tăng số lượng
        cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + (Number(newItem.quantity) || 1);
        if (newItem.image) {
            cart[existingIndex].image = newItem.image; // Cập nhật ảnh nếu có
        }
    } else {
        // Chưa có: thêm mới
        cart.push({
            ...newItem,
            quantity: Number(newItem.quantity) || 1,
            selected: true // Mặc định chọn để tính tiền
        });
    }

    saveCart(cart);
    return true;
}

/**
 * Xóa một sản phẩm khỏi giỏ hàng
 */
export function removeFromCart(index) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
    }
}

/**
 * Cập nhật số lượng của một sản phẩm
 */
export function updateQuantity(index, newQty) {
    const cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart[index].quantity = Math.max(1, Number(newQty) || 1);
        saveCart(cart);
    }
}

/**
 * Hiển thị thông báo Toast nhanh khi thêm vào giỏ hàng thành công
 */
export function showAddToCartSuccessToast(productName, quantity) {
    let toast = document.getElementById("add_cart_toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "add_cart_toast";
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            background: #ffffff;
            color: #1e293b;
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            border-left: 5px solid #22c55e;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: inherit;
            font-size: 14px;
            transition: all 0.3s ease;
            transform: translateX(120%);
        `;
        document.body.appendChild(toast);
    }

    toast.innerHTML = `
        <span class="material-symbols-outlined" style="color: #22c55e; font-size: 26px;">check_circle</span>
        <div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Thêm vào giỏ hàng thành công!</div>
            <div style="color: #64748b; font-size: 13px;">Đã thêm ${quantity}x <strong>${productName}</strong></div>
        </div>
    `;

    toast.style.transform = "translateX(0)";
    setTimeout(() => {
        toast.style.transform = "translateX(120%)";
    }, 2500);
}

// ==========================================================================
// RENDER TRANG GIỎ HÀNG (DÀNH CHO cart.html)
// ==========================================================================

function toggleCartStructure(hasItems) {
    const headerRow = document.getElementById("cart_header_row");
    const voucherSec = document.getElementById("cart_voucher_section");
    const checkoutBar = document.getElementById("cart_checkout_bar");

    const displayStyle = hasItems ? "" : "none";
    if (headerRow) headerRow.style.display = displayStyle;
    if (voucherSec) voucherSec.style.display = displayStyle;
    if (checkoutBar) checkoutBar.style.display = displayStyle;
}

export function renderCartPage() {
    const container = document.getElementById("cart_items_wrapper");
    if (!container) return;

    const currentUser = getCurrentUser();

    // Nếu chưa đăng nhập: yêu cầu đăng nhập để xem giỏ hàng
    if (!currentUser) {
        toggleCartStructure(false);
        container.innerHTML = `
            <div class="cart-box cart-empty-card py-5 text-center">
                <div class="empty-cart-icon-wrapper mb-3">
                    <span class="material-symbols-outlined empty-cart-icon">account_circle</span>
                </div>
                <h4 class="fw-bold text-dark mb-2">Bạn chưa đăng nhập</h4>
                <p class="text-secondary small mb-4">Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn nhé!</p>
                <a href="login.html" class="btn btn-empty-shopping">
                    <span class="material-symbols-outlined">login</span>
                    ĐĂNG NHẬP NGAY
                </a>
            </div>
        `;
        updateCartTotalSummary(0, 0, 0);
        return;
    }

    const cart = getCart();

    // Kiểm tra nếu giỏ hàng trống
    if (!cart.length) {
        toggleCartStructure(false);
        container.innerHTML = `
            <div class="cart-box cart-empty-card py-5 text-center">
                <div class="empty-cart-icon-wrapper mb-3">
                    <span class="material-symbols-outlined empty-cart-icon">shopping_cart_off</span>
                </div>
                <h4 class="fw-bold text-dark mb-2">Giỏ hàng của bạn còn trống</h4>
                <p class="text-secondary small mb-4">Hãy lướt NovaMall để khám phá hàng ngàn sản phẩm ưu đãi hấp dẫn ngay nhé!</p>
                <a href="index.html" class="btn btn-empty-shopping">
                    <span class="material-symbols-outlined">storefront</span>
                    MUA SẮM NGAY
                </a>
            </div>
        `;
        updateCartTotalSummary(0, 0, 0);
        return;
    }

    // Có sản phẩm: Hiển thị lại cấu trúc thanh tiêu đề, voucher và thanh toán
    toggleCartStructure(true);

    // Nhóm sản phẩm theo gian hàng (shopId / shopName)
    const groupedShops = {};
    cart.forEach((item, index) => {
        const sId = item.shopId || "default";
        const sName = item.shopName || "NovaMall Store";
        if (!groupedShops[sId]) {
            groupedShops[sId] = { name: sName, items: [] };
        }
        groupedShops[sId].items.push({ ...item, originalIndex: index });
    });

    // Render từng khối gian hàng
    container.innerHTML = Object.keys(groupedShops).map(sId => {
        const shop = groupedShops[sId];
        return `
            <section class="cart-box mb-3">
                <div class="d-flex align-items-center gap-2 px-3 pt-3 pb-1 border-bottom">
                    <span class="badge cart-badge-mall">Mall</span>
                    <strong class="cart-shop-name">${shop.name}</strong>
                    <span class="material-symbols-outlined cart-verified text-primary" style="font-size: 18px;">verified</span>
                    <a href="#" class="cart-link small ms-auto text-decoration-none text-secondary">Xem Shop ›</a>
                </div>

                ${shop.items.map(item => `
                    <div class="row align-items-center g-2 px-3 py-3 border-bottom cart-item-row" data-index="${item.originalIndex}">
                        <div class="col-12 col-md-5 d-flex align-items-center gap-3">
                            <input class="form-check-input mt-0 flex-shrink-0 item-checkbox" type="checkbox" 
                                   ${item.selected !== false ? "checked" : ""} data-index="${item.originalIndex}">
                            <div class="cart-thumb cart-thumb-phone flex-shrink-0" style="width: 90px; height: 90px;">
                                <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">
                            </div>
                            <div class="d-flex flex-column align-items-start gap-1 min-w-0">
                                <a href="CT_product.html?id=${item.productId}" class="cart-name mb-0 text-dark text-decoration-none fw-medium" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                     ${item.name}
                                </a>
                                <span class="text-secondary small">
                                    Phân loại: ${item.color || "Tiêu chuẩn"}${item.type ? `, ${item.type}` : ""}
                                </span>
                            </div>
                        </div>

                        <div class="col-4 col-md-2 text-md-center cart-price">
                            ${item.oldPrice > item.price ? `<del class="d-block text-muted small">${item.oldPrice.toLocaleString("vi-VN")}₫</del>` : ""}
                            <span class="fw-bold text-danger">${item.price.toLocaleString("vi-VN")}₫</span>
                        </div>

                        <div class="col-4 col-md-2 d-flex justify-content-md-center">
                            <div class="input-group input-group-sm cart-qty" style="max-width: 110px;">
                                <button class="btn btn-outline-secondary btn-qty-minus" data-index="${item.originalIndex}">−</button>
                                <input type="text" class="form-control text-center input-qty" value="${item.quantity}" data-index="${item.originalIndex}">
                                <button class="btn btn-outline-secondary btn-qty-plus" data-index="${item.originalIndex}">+</button>
                            </div>
                        </div>

                        <div class="col-4 col-md-2 text-md-center cart-total fw-bold text-dark">
                            ${(item.price * item.quantity).toLocaleString("vi-VN")}₫
                        </div>

                        <div class="col-12 col-md-1 text-md-center cart-actions">
                            <button type="button" class="btn-delete-item" data-index="${item.originalIndex}" title="Xóa sản phẩm khỏi giỏ">
                                <span class="material-symbols-outlined delete-icon">delete</span>
                                <span class="delete-label">Xóa</span>
                            </button>
                        </div>
                    </div>
                `).join("")}
            </section>
        `;
    }).join("");

    bindCartEvents();
    calculateCartTotal();
}

/**
 * Gán sự kiện click xóa, tăng giảm số lượng, checkbox
 */
function bindCartEvents() {
    // Nút xóa
    document.querySelectorAll(".btn-delete-item").forEach(btn => {
        btn.addEventListener("click", function() {
            const index = Number(this.dataset.index);
            if (confirm("Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng?")) {
                removeFromCart(index);
                renderCartPage();
            }
        });
    });

    // Nút giảm số lượng
    document.querySelectorAll(".btn-qty-minus").forEach(btn => {
        btn.addEventListener("click", function() {
            const index = Number(this.dataset.index);
            const cart = getCart();
            if (cart[index]) {
                const currentQty = Number(cart[index].quantity) || 1;
                if (currentQty > 1) {
                    updateQuantity(index, currentQty - 1);
                    renderCartPage();
                } else if (confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ?")) {
                    removeFromCart(index);
                    renderCartPage();
                }
            }
        });
    });

    // Nút tăng số lượng
    document.querySelectorAll(".btn-qty-plus").forEach(btn => {
        btn.addEventListener("click", function() {
            const index = Number(this.dataset.index);
            const cart = getCart();
            if (cart[index]) {
                updateQuantity(index, (Number(cart[index].quantity) || 1) + 1);
                renderCartPage();
            }
        });
    });

    // Nhập số lượng trực tiếp
    document.querySelectorAll(".input-qty").forEach(input => {
        input.addEventListener("change", function() {
            const index = Number(this.dataset.index);
            const val = Math.max(1, parseInt(this.value) || 1);
            updateQuantity(index, val);
            renderCartPage();
        });
    });

    // Checkbox từng sản phẩm
    document.querySelectorAll(".item-checkbox").forEach(chk => {
        chk.addEventListener("change", function() {
            const index = Number(this.dataset.index);
            const cart = getCart();
            if (cart[index]) {
                cart[index].selected = this.checked;
                saveCart(cart);
                calculateCartTotal();
            }
        });
    });

    // Checkbox Chọn tất cả (dưới thanh thanh toán)
    const selectAllBottom = document.getElementById("all-bottom");
    if (selectAllBottom) {
        selectAllBottom.addEventListener("change", function() {
            const checked = this.checked;
            const cart = getCart();
            cart.forEach(item => item.selected = checked);
            saveCart(cart);
            renderCartPage();
        });
    }
}

/**
 * Tính toán tổng tiền thanh toán dựa trên các sản phẩm được tích chọn
 */
function calculateCartTotal() {
    const cart = getCart();
    let totalSum = 0;
    let selectedCount = 0;
    let totalSave = 0;

    cart.forEach(item => {
        if (item.selected !== false) {
            const qty = Number(item.quantity) || 1;
            totalSum += (item.price * qty);
            selectedCount += qty;
            if (item.oldPrice > item.price) {
                totalSave += ((item.oldPrice - item.price) * qty);
            }
        }
    });

    updateCartTotalSummary(totalSum, selectedCount, totalSave);
}

function updateCartTotalSummary(totalSum, selectedCount, totalSave) {
    const sumEl = document.querySelector(".cart-sum");
    const countTextEl = document.querySelector(".cart-checkout .small");
    const saveEl = document.querySelector(".cart-save");
    const selectAllLabel = document.querySelector('label[for="all-bottom"]');

    if (sumEl) sumEl.textContent = `${totalSum.toLocaleString("vi-VN")}₫`;
    if (countTextEl) countTextEl.textContent = `Tổng thanh toán (${selectedCount} sản phẩm):`;
    if (saveEl) {
        saveEl.textContent = totalSave > 0 ? `Tiết kiệm ${totalSave.toLocaleString("vi-VN")}₫` : "";
    }
    if (selectAllLabel) {
        const cart = getCart();
        selectAllLabel.textContent = `Chọn tất cả (${cart.length})`;
    }
}

// Tự động cập nhật số lượng trên header khi file cart.js được nạp
document.addEventListener("DOMContentLoaded", () => {
    updateHeaderCartCount();
    if (document.getElementById("cart_items_wrapper")) {
        renderCartPage();
    }
});

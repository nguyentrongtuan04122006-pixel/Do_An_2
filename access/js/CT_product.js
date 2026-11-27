import { productList, escapeProductHtml } from "../js/product.js";
import { getShopList } from "./seller.js";
import { addToCart, showAddToCartSuccessToast } from "./cart.js";

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));
const product = productList.find(item => item.id === productId);

const mainImg = document.getElementById("main_image");
const mainVideo = document.getElementById("main_video");
const thumbs = document.getElementById("gallery_thumbs");
function showMedia(type, src) {
    if (type === "video") {
        mainImg.style.display = "none";
        mainVideo.style.display = "block";
        mainVideo.src = src;
    } else {
        mainVideo.pause();
        mainVideo.style.display = "none";
        mainImg.style.display = "block";
        mainImg.src = src;
    }
}

function renderGallery() {
    const images = product.gallery?.images?.length ? product.gallery.images : [product.image];
    const video = product.gallery?.video;

    thumbs.innerHTML =
        (video ? `
        <div class="product_gallery-item" data-type="video" data-src="${escapeProductHtml(video)}">
            <video src="${escapeProductHtml(video)}" muted preload="metadata"></video>
        </div>` : "") +
        images.map(src => `
        <div class="product_gallery-item" data-type="image" data-src="${escapeProductHtml(src)}">
            <img src="${escapeProductHtml(src)}" alt="">
        </div>`).join("");

    thumbs.addEventListener("click", e => {
        const item = e.target.closest(".product_gallery-item");
        if (!item) return;
        thumbs.querySelectorAll(".product_gallery-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        showMedia(item.dataset.type, item.dataset.src);
    });

    // Mặc định: ảnh đầu tiên
    const firstImage = thumbs.querySelector('[data-type="image"]');
    firstImage.classList.add("active");
    showMedia("image", images[0]);
}

/* ================= BÊN PHẢI: THÔNG TIN ================= */
function renderStars(rating) {
    return [1, 2, 3, 4, 5].map(star => {
        let cls = "empty";
        if (rating >= star) cls = "full";
        else if (rating > star - 1) cls = `partial rating-0-${Math.round((rating % 1) * 10)}`;
        return `<span class="material-symbols-outlined body__rating-review ${cls}">star</span>`;
    }).join("");
}

function renderInfo() {
    document.querySelector(".product_content-name").textContent = product.name;
    document.querySelector(".product_rating-point").textContent = product.rate;
    document.querySelector(".body__rating-stars").innerHTML = renderStars(product.rate);

    const sold = product.sold >= 1000 ? (product.sold / 1000).toFixed(1) + "k" : product.sold;
    document.querySelector(".product_rating-saled").textContent = `Đã bán ${sold}`;

    // Giữ lại icon + text trong khối giá
    document.querySelector(".product_content-price").innerHTML = `
        ${product.newPrice.toLocaleString("vi-VN")}đ
        <span class="material-symbols-outlined">local_activity</span>
        <span class="product_content-text">Giá sau Voucher</span>`;
}

/* ================= TUỲ CHỌN ================= */
function renderOption() {
    const colorContainer = document.querySelector('[data-group="color"]');
    const typeContainer = document.querySelector('[data-group="type"]');
    const colors = product.options?.color ?? [];
    const types = product.options?.type ?? [];

    colorContainer.closest(".option_row").style.display = colors.length ? "" : "none";
    typeContainer.closest(".option_row").style.display = types.length ? "" : "none";

    colorContainer.innerHTML = colors.map(c => `
        <button type="button" class="option_item ${c.disabled ? "disabled" : ""}"
                data-value="${escapeProductHtml(c.value)}" data-image="${escapeProductHtml(c.image || product.image)}" ${c.disabled ? "disabled" : ""}>
            <img src="${escapeProductHtml(c.image || product.image)}" alt=""><span>${escapeProductHtml(c.name)}</span>
        </button>`).join("");

    typeContainer.innerHTML = types.map(t => `
        <button type="button" class="option_item ${t.disabled ? "disabled" : ""}"
                data-value="${escapeProductHtml(t.value)}" ${t.disabled ? "disabled" : ""}>
            <span>${escapeProductHtml(t.name)}</span>
        </button>`).join("");

    document.querySelectorAll(".option_list").forEach(list => {
        list.addEventListener("click", e => {
            const btn = e.target.closest(".option_item");
            if (!btn || btn.disabled) return;
            list.querySelectorAll(".option_item").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}

/* ================= SỐ LƯỢNG ================= */
function initQty() {
    const input = document.getElementById("qty_input");
    document.getElementById("qty_minus").addEventListener("click", () => {
        input.value = Math.max(1, (Number(input.value) || 1) - 1);
    });
    document.getElementById("qty_plus").addEventListener("click", () => {
        input.value = (Number(input.value) || 1) + 1;
    });
}

/* ================= 1. THÔNG TIN GIAN HÀNG (KÊNH NGƯỜI BÁN) ================= */
function getActiveShop() {
    // 1. Lấy danh sách gian hàng từ Kênh Người Bán (localStorage qua seller.js)
    const registeredShops = getShopList();

    // 2. Tìm gian hàng theo mã chủ sở hữu; tên gian hàng không xác định quyền sở hữu.
    let matched = registeredShops.find(s => 
        (product.shopId && String(s.id) === String(product.shopId)) ||
        (product.sellerId && String(s.sellerId) === String(product.sellerId))
    );

    // 4. Nếu tìm thấy Shop từ Kênh Người Bán: Sử dụng dữ liệu thực tế do Seller tạo
    if (matched) {
        let warehouseCity = "TP. Hồ Chí Minh";
        if (matched.warehouse) {
            warehouseCity = matched.warehouse.city || matched.warehouse.ward || matched.warehouse.address || "TP. Hồ Chí Minh";
        }

        return {
            id: matched.id,
            name: matched.name || "Gian Hàng Người Bán",
            avatar: matched.avatar || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=120&q=80",
            badge: "Shop Người Bán",
            online: "Online vừa xong",
            rating: matched.rating || 4.9,
            reviewCount: matched.reviewCount || "1.5k",
            responseRate: "99%",
            responseTime: "trong vài phút",
            productCount: productList.filter(p => p.shopId === matched.id || p.shopName === matched.name).length || 1,
            joined: matched.createdAt ? "Mới tham gia" : "1 năm trước",
            followers: matched.followers || "5.2k",
            warehouseCity: warehouseCity,
            carriers: matched.carriers || ["NovaExpress", "Giao Hàng Nhanh", "Viettel Post"]
        };
    }

    // 5. Nếu chưa có Người Bán nào đăng ký: Dùng dữ liệu mặc định của sản phẩm
    const defaultShop = product.shopInfo || {};
    return {
        id: product.shopId || 1,
        name: defaultShop.name || product.shopName || "NovaMall Official Store",
        avatar: defaultShop.avatar || "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&q=80",
        badge: defaultShop.badge || "Chính Hãng",
        online: defaultShop.online || "Online 2 phút trước",
        rating: defaultShop.rating || 4.9,
        reviewCount: defaultShop.reviewCount || "28.6k",
        responseRate: defaultShop.responseRate || "99%",
        responseTime: defaultShop.responseTime || "trong vài phút",
        productCount: defaultShop.productCount || 156,
        joined: defaultShop.joined || "2 năm trước",
        followers: defaultShop.followers || "128.5k",
        warehouseCity: "TP. Hồ Chí Minh",
        carriers: ["NovaExpress", "Giao Hàng Nhanh", "Viettel Post"]
    };
}

function renderShopInfo() {
    const shop = getActiveShop();

    const avatarEl = document.getElementById("shop_avatar");
    const nameEl = document.getElementById("shop_name");
    const badgeEl = document.getElementById("shop_badge");
    const onlineEl = document.getElementById("shop_online");
    const ratingEl = document.getElementById("shop_rating");
    const resRateEl = document.getElementById("shop_response_rate");
    const prodCountEl = document.getElementById("shop_product_count");
    const resTimeEl = document.getElementById("shop_response_time");
    const joinedEl = document.getElementById("shop_joined");
    const followersEl = document.getElementById("shop_followers");

    if (avatarEl) avatarEl.src = shop.avatar;
    if (nameEl) nameEl.textContent = shop.name;
    if (badgeEl) badgeEl.textContent = shop.badge;
    if (onlineEl) onlineEl.textContent = shop.online;
    if (ratingEl) ratingEl.innerHTML = `${shop.rating} <small class="text-secondary">(${shop.reviewCount} Đánh giá)</small>`;
    if (resRateEl) resRateEl.textContent = shop.responseRate;
    if (prodCountEl) prodCountEl.textContent = shop.productCount;
    if (resTimeEl) resTimeEl.textContent = shop.responseTime;
    if (joinedEl) joinedEl.textContent = shop.joined;
    if (followersEl) followersEl.textContent = shop.followers;

    // Nút Xem Shop
    const btnViewShop = document.querySelector(".btn_view_shop");
    if (btnViewShop) {
        btnViewShop.onclick = () => {
            alert(`Bạn đang xem thông tin gian hàng: ${shop.name} (Kênh Người Bán NovaMall)`);
        };
    }
}

/* ================= 2. CHI TIẾT & MÔ TẢ SẢN PHẨM ================= */
function renderDescription() {
    const shop = getActiveShop();

    // Đồng bộ thông số kỹ thuật với thông tin Người Bán (Kho gửi hàng, danh mục)
    let specs = product.specs ? [...product.specs] : [
        { label: "Danh Mục", value: `NovaMall > ${product.category || "Thiết bị số & Công nghệ"}` },
        { label: "Thương hiệu", value: "Chính Hãng" },
        { label: "Bảo hành", value: "12 tháng chính hãng" },
        { label: "Kho hàng", value: `${product.stock || 100} sản phẩm có sẵn` },
        { label: "Gửi từ", value: shop.warehouseCity || "TP. Hồ Chí Minh" }
    ];

    // Cập nhật lại mục "Gửi từ" theo kho của Shop thực tế
    const sentFromIndex = specs.findIndex(s => s.label === "Gửi từ");
    if (sentFromIndex !== -1) {
        specs[sentFromIndex].value = shop.warehouseCity;
    } else {
        specs.push({ label: "Gửi từ", value: shop.warehouseCity });
    }

    const specsContainer = document.getElementById("product_specs_table");
    if (specsContainer) {
        specsContainer.innerHTML = specs.map(s => `
            <div class="spec_row">
                <span class="spec_label">${escapeProductHtml(s.label)}</span>
                <span class="spec_value">${escapeProductHtml(s.value)}</span>
            </div>
        `).join("");
    }

    const descContainer = document.getElementById("product_desc_content");
    if (descContainer) {
        if (product.description) {
            descContainer.textContent = product.description;
            descContainer.style.whiteSpace = "pre-line";
            return;
        }
        descContainer.innerHTML = `
            <h3>Mô tả sản phẩm ${escapeProductHtml(product.name)}</h3>
            <p>Sản phẩm chính hãng chất lượng cao, phân phối bởi <strong>${escapeProductHtml(shop.name)}</strong> tại hệ thống NovaMall. Cam kết bảo hành chính hãng 12 tháng, đổi trả 1-1 trong vòng 30 ngày nếu phát sinh lỗi từ nhà sản xuất.</p>
            <ul>
                <li>Thiết kế hiện đại, bền đẹp và tối ưu trải nghiệm người dùng.</li>
                <li>Được kiểm định chất lượng nghiêm ngặt trước khi xuất xưởng.</li>
                <li>Đóng gói chắc chắn, giao hàng hỏa tốc và hỗ trợ kỹ thuật 24/7.</li>
            </ul>
        `;
    }
}

/* ================= 3. ĐÁNH GIÁ SẢN PHẨM ================= */
function renderReviews() {
    const reviews = product.reviews && product.reviews.length ? product.reviews : [
        {
            id: 1,
            author: "khach_hang_hai_long",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&q=80",
            rating: 5,
            date: "2024-11-20 14:30",
            variant: "Phân loại tiêu chuẩn",
            comment: "Sản phẩm đóng gói rất cẩn thận, đúng như mô tả. Giao hàng nhanh, dùng thử thấy rất ưng ý. Cho shop 5 sao chất lượng!",
            images: [product.image],
            likes: 12
        },
        {
            id: 2,
            author: "minh_anh_review",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
            rating: 5,
            date: "2024-11-15 09:20",
            variant: "Phân loại tiêu chuẩn",
            comment: "Hàng chuẩn chính hãng, dùng rất mượt mà. Đóng gói hộp chắc chắn có tem niêm phong. Sẽ tiếp tục ủng hộ shop lần sau.",
            images: [],
            likes: 6
        }
    ];

    // Điểm số và sao tổng quan
    const bigScoreEl = document.getElementById("review_big_score");
    const starsBoxEl = document.getElementById("review_score_stars");
    if (bigScoreEl) bigScoreEl.textContent = (product.rate || 5.0).toFixed(1);
    if (starsBoxEl) starsBoxEl.innerHTML = renderStars(product.rate || 5.0);

    // Cập nhật số lượng đếm trên các nút lọc
    const countAllEl = document.getElementById("count_all");
    const count5El = document.getElementById("count_5");
    const count4El = document.getElementById("count_4");
    const countMediaEl = document.getElementById("count_media");

    const count5 = reviews.filter(r => r.rating === 5).length;
    const count4 = reviews.filter(r => r.rating === 4).length;
    const countMedia = reviews.filter(r => r.images && r.images.length > 0).length;

    if (countAllEl) countAllEl.textContent = reviews.length;
    if (count5El) count5El.textContent = count5;
    if (count4El) count4El.textContent = count4;
    if (countMediaEl) countMediaEl.textContent = countMedia;

    // Hàm render danh sách nhận xét theo bộ lọc
    const listEl = document.getElementById("reviews_list");

    function displayReviews(filteredList) {
        if (!listEl) return;
        if (!filteredList.length) {
            listEl.innerHTML = `<p class="py-4 text-center text-secondary" style="font-size: 1.35rem;">Chưa có đánh giá nào phù hợp với bộ lọc này.</p>`;
            return;
        }

        listEl.innerHTML = filteredList.map(r => `
            <div class="review_item">
                <img src="${escapeProductHtml(r.avatar)}" alt="${escapeProductHtml(r.author)}" class="review_avatar">
                <div class="review_body">
                    <div class="review_author">${escapeProductHtml(r.author)}</div>
                    <div class="review_item_stars">
                        ${renderStars(r.rating)}
                    </div>
                    <div class="review_meta">${escapeProductHtml(r.date)} | ${escapeProductHtml(r.variant)}</div>
                    <div class="review_comment">${escapeProductHtml(r.comment)}</div>
                    ${r.images && r.images.length ? `
                        <div class="review_media_list">
                            ${r.images.map(img => `<img src="${escapeProductHtml(img)}" alt="feedback" class="review_media_thumb">`).join("")}
                        </div>
                    ` : ""}
                    <div class="review_actions">
                        <button type="button" class="btn_like_review" onclick="this.classList.toggle('liked')">
                            <span class="material-symbols-outlined fs-6">thumb_up</span>
                            <span>Hữu ích (${r.likes || 0})</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join("");
    }

    // Hiển thị ban đầu: Tất cả
    displayReviews(reviews);

    // Bắt sự kiện lọc
    const filterTags = document.querySelectorAll(".review_filter_tags .filter_tag");
    filterTags.forEach(tag => {
        tag.addEventListener("click", function () {
            filterTags.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const filterType = this.getAttribute("data-filter");
            let filtered = reviews;

            if (filterType === "5") {
                filtered = reviews.filter(r => r.rating === 5);
            } else if (filterType === "4") {
                filtered = reviews.filter(r => r.rating === 4);
            } else if (filterType === "3") {
                filtered = reviews.filter(r => r.rating === 3);
            } else if (filterType === "media") {
                filtered = reviews.filter(r => r.images && r.images.length > 0);
            }

            displayReviews(filtered);
        });
    });
}

/* ================= 4. THAO TÁC GIỎ HÀNG (THÊM / MUA NGAY) ================= */
function initCartActions() {
    const btnAddCart = document.getElementById("btn_add-cart");
    const btnBuyNow = document.getElementById("btn_buy-now");

    function getSelectedProductItem() {
        const qtyInput = document.getElementById("qty_input");
        const qty = Math.max(1, parseInt(qtyInput ? qtyInput.value : 1) || 1);

        // Lấy màu sắc đang chọn
        const activeColorBtn = document.querySelector('[data-group="color"] .option_item.active');
        const selectedColorName = activeColorBtn ? activeColorBtn.querySelector("span").textContent.trim() : (product.options?.color?.[0]?.name || "Tiêu chuẩn");
        const selectedColorImg = activeColorBtn ? (activeColorBtn.dataset.image || activeColorBtn.querySelector("img")?.src) : product.image;

        // Lấy phân loại đang chọn
        const activeTypeBtn = document.querySelector('[data-group="type"] .option_item.active');
        const selectedTypeName = activeTypeBtn ? activeTypeBtn.querySelector("span").textContent.trim() : (product.options?.type?.[0]?.name || "");

        const shop = getActiveShop();

        return {
            productId: product.id,
            name: product.name,
            image: selectedColorImg || product.image,
            price: product.newPrice,
            oldPrice: product.oldPrice || product.newPrice,
            quantity: qty,
            color: selectedColorName,
            type: selectedTypeName,
            shopId: shop.id,
            shopName: shop.name
        };
    }

    if (btnAddCart) {
        btnAddCart.addEventListener("click", () => {
            const item = getSelectedProductItem();
            const added = addToCart(item);
            if (added) {
                showAddToCartSuccessToast(item.name, item.quantity);
            }
        });
    }

    if (btnBuyNow) {
        btnBuyNow.addEventListener("click", () => {
            const item = getSelectedProductItem();
            const added = addToCart(item);
            if (added) {
                window.location.href = "cart.html";
            }
        });
    }
}

/* ================= CHẠY ================= */
if (product) {
    renderGallery();
    renderInfo();
    renderOption();
    initQty();
    renderShopInfo();
    renderDescription();
    renderReviews();
    initCartActions();
} else {
    const details = document.querySelector(".product_detail");
    if (details) details.innerHTML = '<p class="py-4 text-center" role="status">Sản phẩm không tồn tại, đã ngừng bán hoặc đã hết hàng. <a href="index.html">Tiếp tục mua sắm</a></p>';
    document.querySelectorAll(".shop_profile_section, .product_desc_section, .product_reviews_section")
        .forEach(section => { section.hidden = true; });
}

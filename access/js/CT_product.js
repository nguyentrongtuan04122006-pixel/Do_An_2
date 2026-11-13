import { productList } from "../js/product.js";
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
    const images = product.gallery?.images ?? [product.image];
    const video = product.gallery?.video;

    thumbs.innerHTML =
        (video ? `
        <div class="product_gallery-item" data-type="video" data-src="${video}">
            <video src="${video}" muted preload="metadata"></video>
        </div>` : "") +
        images.map(src => `
        <div class="product_gallery-item" data-type="image" data-src="${src}">
            <img src="${src}" alt="">
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
                data-value="${c.value}" data-image="${c.image}" ${c.disabled ? "disabled" : ""}>
            <img src="${c.image}" alt=""><span>${c.name}</span>
        </button>`).join("");

    typeContainer.innerHTML = types.map(t => `
        <button type="button" class="option_item ${t.disabled ? "disabled" : ""}"
                data-value="${t.value}" ${t.disabled ? "disabled" : ""}>
            <span>${t.name}</span>
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

/* ================= CHẠY ================= */
if (product) {
    renderGallery();
    renderInfo();
    renderOption();
    initQty();
} else {
    document.querySelector(".product_detail").innerHTML = "<p>Không tìm thấy sản phẩm.</p>";
}
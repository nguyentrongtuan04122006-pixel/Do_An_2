// ==========================================================================
// SEARCH.JS - XỬ LÝ TÌM KIẾM SẢN PHẨM TOÀN SÀN & GỢI Ý TÌM KIẾM
// ==========================================================================

import { productList } from "./product.js";

/**
 * Loại bỏ dấu tiếng Việt để tìm kiếm không dấu chính xác
 */
export function removeVietnameseTones(str) {
    if (!str) return "";
    str = String(str);
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str.toLowerCase().trim();
}

/**
 * Điều hướng hoặc thực hiện tìm kiếm
 */
export function executeSearch(keyword) {
    const term = (keyword || "").trim();
    if (!term) return;

    const isCatalog = window.location.pathname.includes("catalog_product.html");
    if (isCatalog) {
        // Cập nhật URL và chạy lọc ngay trên trang danh mục
        const url = new URL(window.location);
        url.searchParams.set("search", term);
        window.history.pushState({}, "", url);

        if (typeof window.applyCatalogSearch === "function") {
            window.applyCatalogSearch(term);
        } else {
            window.location.search = `?search=${encodeURIComponent(term)}`;
        }
    } else {
        // Chuyển hướng sang catalog_product.html kèm query search
        const isHtmlDir = window.location.pathname.includes("/html/");
        const target = isHtmlDir
            ? `catalog_product.html?search=${encodeURIComponent(term)}`
            : `html/catalog_product.html?search=${encodeURIComponent(term)}`;
        window.location.href = target;
    }
}

/**
 * Khởi tạo chức năng thanh tìm kiếm trên Header
 */
export function initSearch() {
    const searchInput = document.querySelector(".navbar__search-input-text");
    const searchBtn = document.querySelector(".navbar__search-icon");
    const searchWrapper = document.querySelector(".navbar__search-input");

    if (!searchInput) return;

    // 1. Đồng bộ từ khóa từ URL vào ô tìm kiếm nếu có
    const currentParams = new URLSearchParams(window.location.search);
    const searchFromUrl = currentParams.get("search");
    if (searchFromUrl) {
        searchInput.value = searchFromUrl;
    }

    // 2. Tạo dropdown gợi ý tìm kiếm (Autocomplete Suggestions)
    let suggestionsBox = document.getElementById("search_suggestions");
    if (!suggestionsBox && searchWrapper) {
        suggestionsBox = document.createElement("div");
        suggestionsBox.id = "search_suggestions";
        suggestionsBox.className = "navbar__search-suggestions";
        suggestionsBox.style.display = "none";
        searchWrapper.appendChild(suggestionsBox);
    }

    // 3. Sự kiện gõ tìm kiếm và hiển thị gợi ý
    let debounceTimer = null;
    searchInput.addEventListener("input", function () {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        if (!query) {
            if (suggestionsBox) suggestionsBox.style.display = "none";
            return;
        }

        debounceTimer = setTimeout(() => {
            renderSuggestions(query, suggestionsBox);
        }, 200);
    });

    // 4. Sự kiện nhấn Enter
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            if (suggestionsBox) suggestionsBox.style.display = "none";
            executeSearch(this.value);
        }
    });

    // 5. Sự kiện bấm icon kính lúp
    if (searchBtn) {
        searchBtn.onclick = function (e) {
            e.stopPropagation();
            if (suggestionsBox) suggestionsBox.style.display = "none";
            executeSearch(searchInput.value);
        };
    }

    // 6. Sự kiện bấm các từ khóa Xu Hướng (Trending links)
    document.querySelectorAll(".navbar__trend-link").forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const trendText = this.textContent.trim();
            searchInput.value = trendText;
            executeSearch(trendText);
        });
    });

    // 7. Click ra ngoài thì ẩn dropdown gợi ý
    document.addEventListener("click", function (e) {
        if (suggestionsBox && !searchWrapper.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });

    // Đóng khi nhấn phím Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && suggestionsBox) {
            suggestionsBox.style.display = "none";
        }
    });
}

/**
 * Hàm kiểm tra sản phẩm có khớp với từ khóa tìm kiếm hay không
 * - Ưu tiên tìm trong TÊN SẢN PHẨM.
 * - Chỉ tìm theo danh mục khi từ khóa có từ 3 ký tự trở lên (tránh gõ "d" lại khớp "Điện thoại")
 */
export function matchProduct(p, query) {
    const cleanQ = removeVietnameseTones(query);
    if (!cleanQ) return false;

    const cleanName = removeVietnameseTones(p.name || "");
    if (cleanName.includes(cleanQ)) return true;

    // Chỉ tìm theo danh mục khi từ khóa đủ dài (>= 3 ký tự)
    if (cleanQ.length >= 3) {
        const cleanCat = removeVietnameseTones(p.category || "");
        if (cleanCat.includes(cleanQ)) return true;
    }

    return false;
}

/**
 * Hiển thị dropdown gợi ý kết quả khi gõ
 */
function renderSuggestions(query, container) {
    if (!container) return;

    const matches = productList.filter(p => matchProduct(p, query)).slice(0, 5); // Tối đa 5 gợi ý

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="search-suggestion-header">
                Không có kết quả khớp với "${query}"
            </div>
            <a href="javascript:void(0)" class="search-suggestion-footer search-for-all">
                Tìm kiếm với Google / Xem tất cả sản phẩm ›
            </a>
        `;
        container.style.display = "block";

        const footerLink = container.querySelector(".search-for-all");
        if (footerLink) {
            footerLink.onclick = () => {
                container.style.display = "none";
                executeSearch(query);
            };
        }
        return;
    }

    const isHtmlDir = window.location.pathname.includes("/html/");
    const productDetailPrefix = isHtmlDir ? "CT_product.html?id=" : "html/CT_product.html?id=";

    container.innerHTML = `
        <div class="search-suggestion-header">
            Gợi ý sản phẩm cho "${query}" (${matches.length})
        </div>
        ${matches.map(p => `
            <a href="${productDetailPrefix}${p.id}" class="search-suggestion-item">
                <img src="${p.image}" alt="${p.name}" class="search-suggestion-thumb">
                <div class="search-suggestion-info">
                    <p class="search-suggestion-name">${p.name}</p>
                    <p class="search-suggestion-price">${p.newPrice.toLocaleString("vi-VN")}₫</p>
                </div>
            </a>
        `).join("")}
        <a href="javascript:void(0)" class="search-suggestion-footer search-view-all">
            Xem tất cả kết quả cho "${query}" ›
        </a>
    `;

    container.style.display = "block";

    const viewAllBtn = container.querySelector(".search-view-all");
    if (viewAllBtn) {
        viewAllBtn.onclick = () => {
            container.style.display = "none";
            executeSearch(query);
        };
    }
}

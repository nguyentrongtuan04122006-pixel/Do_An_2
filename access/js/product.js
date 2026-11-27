const defaultProductList = [
    {
        id: 1,
        shopId: 1795656372087,
        sellerId: 1795656372086,
        shopName: "Local Store",
        category: "Điện thoại & Tablet",
        stock: 100,
        status: "DANG_BAN",
        name: "Iphone 16 Pro 256GB Titan Tự nhiên",
        image: "../access/picture/Gemini_Generated_Image_iphone16.png",
        oldPrice: 35990000,
        newPrice: 28490000,
        rate: 4.7,
        sold: 3800,
        isFlashSale: true,
        gallery:{
            video:"../access/video/iphone_vd.mp4",
            images:[
                "../access/picture/iphone/iphone.webp",
                "../access/picture/iphone/iphone18.webp",
                "../access/picture/iphone/camera.webp",
            ]
        },
        options :{
            color:[
                {
                    name:"Đỏ Burgundy",
                    value:"do",
                    image:"../access/picture/iphone/iphone_do.webp"
                },
                {
                    name:"Băng Thanh",
                    value:"xanh",
                    image:"../access/picture/iphone/iphone_xanh.webp"
                },{
                    name:"Bạc",
                    value:"bac",
                    image:"../access/picture/iphone/iphone_bac.webp"
                },{
                    name:"Đen",
                    value:"den",
                    image:"../access/picture/iphone/iphone_den.webp"
                },
            ]
        }
    },
    {
        id: 2,
        shopId: 1795656372087,
        sellerId: 1795656372086,
        shopName: "Local Store",
        category: "Phụ kiện máy tính",
        stock: 100,
        status: "DANG_BAN",
        name: "Chuột chơi game VXE ATK A9 | A9 SE | A9 UltraMax | A9 Ultimate | A9 Air Wireless hỗ trợ 8000Hz - QMTECH STORE",
        image: "../access/picture/atk_a9/atk_a9.jpg",
        oldPrice: 699000,
        newPrice: 544720,
        rate: 4.9,
        sold: 1000,
        isFlashSale: true,
        gallery: {
            video: "../access/video/atk-a9.mp4",
            images: [
                "../access/picture/atk_a9/atk_a9-1.webp",
                "../access/picture/atk_a9/atk_a9-2.webp",
                "../access/picture/atk_a9/atk_a9-3.webp"
            ]
        },
        options: {
            color: [
                {
                    name: "Đen",
                    value: "den",
                    image: "../access/picture/atk_a9/atk_a9-den.webp"
                },
                {
                    name: "Trắng",
                    value: "trang",
                    image: "../access/picture/atk_a9/atk_a9-trang.webp"
                },
                {
                    name: "Petal Pink",
                    value: "petal-pink",
                    image: "../access/picture/atk_a9/atk_a9-hong.webp",
                    disabled: true
                }
            ],
            type: [
                { name: "A9 SE", value: "se" },
                { name: "A9 Base 2.0", value: "base-2-0", disabled: true },
                { name: "A9 Plus", value: "plus" }
            ]
        },
    },
    {
        id: 3,
        shopId: 1795656372087,
        sellerId: 1795656372086,
        shopName: "Local Store",
        category: "Phụ kiện máy tính",
        stock: 100,
        status: "DANG_BAN",
        name: "Bàn Phím Gaming Rapid Trigger ATK RS7 Air Esports / LAYOUT 75 % / Phím Rappid Trigger / Hàng NEWSEAL",
        image: "../access/picture/rick_rs7.jpg",
        oldPrice: 2990000,
        newPrice: 1890000,
        rate: 5.0,
        sold: 2000,
        isFlashSale: true,
        gallery: {
            video: "../access/video/rs7.mp4",
            images: [
                "../access/picture/atk_rs7/rs7_den.webp",
                "../access/picture/atk_rs7/rs7_do.webp",
                "../access/picture/atk_rs7/rs7_hong.webp",
                "../access/picture/atk_rs7/rs7_vang.webp",
                "../access/picture/atk_rs7/rs7_xanh.webp",
                "../access/picture/atk_rs7/rs7+pk.webp",
                "../access/picture/atk_rs7/rs7_switch.webp",
            ]
        },
        options: {
            color: [
                {
                    name: "Đen",
                    value: "den",
                    image:  "../access/picture/atk_rs7/rs7_den.webp",
                },
                {
                    name: "Hồng",
                    value: "hong",
                    image: "../access/picture/atk_rs7/rs7_hong.webp",
                },
                {
                    name: "Xanh",
                    value: "xanh",
                    image: "../access/picture/atk_rs7/rs7_xanh.webp",
                    
                },
                  {
                    name: "Vàng",
                    value: "vang",
                    image: "../access/picture/atk_rs7/rs7_vang.webp",
                },
                  {
                    name: "Đỏ",
                    value: "do",
                    image: "../access/picture/atk_rs7/rs7_do.webp",
                },
    
            ],
        },
    },

];

export const PRODUCT_STORAGE_KEY = "productList";

// Dùng chung dữ liệu giữa kênh người bán và các trang mua sắm.
function isValidProductAsset(value, folder) {
    if (typeof value !== "string" || !value.trim() || /[\u0000-\u001f\u007f]/.test(value)) return false;
    try {
        const url = new URL(value, "https://novamall.invalid/html/");
        if (/^https?:\/\//i.test(value)) {
            return (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname;
        }
        return value.startsWith(`../access/${folder}/`) &&
            url.origin === "https://novamall.invalid" && url.pathname.startsWith(`/access/${folder}/`);
    } catch {
        return false;
    }
}

export function isValidProductImage(value) {
    return isValidProductAsset(value, "picture");
}

export function escapeProductHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[character]));
}

function validateProductList(products) {
    if (!Array.isArray(products)) {
        throw new Error("Dữ liệu sản phẩm không hợp lệ: danh sách phải là một mảng.");
    }
    const ids = new Set();
    const validOwnerId = value => (typeof value === "string" && value.trim() !== "") ||
        (Number.isSafeInteger(value) && value > 0);
    const statuses = ["DANG_BAN", "CHO_DUYET", "DA_AN", "TAM_KHOA"];
    products.forEach((product, index) => {
        const invalid = () => {
            throw new Error(`Dữ liệu sản phẩm thứ ${index + 1} không hợp lệ. Vui lòng kiểm tra dữ liệu đã lưu.`);
        };
        if (!product || typeof product !== "object" || Array.isArray(product) ||
            !Number.isSafeInteger(product.id) || product.id <= 0 || ids.has(product.id) ||
            !validOwnerId(product.sellerId) || !validOwnerId(product.shopId) ||
            !["name", "category", "image"].every(key => typeof product[key] === "string" && product[key].trim()) ||
            !isValidProductImage(product.image) || !statuses.includes(product.status) ||
            !["oldPrice", "newPrice", "stock", "sold"].every(key => Number.isSafeInteger(product[key]) && product[key] >= 0) ||
            product.newPrice > product.oldPrice) invalid();
        if (product.rate !== undefined && (!Number.isFinite(product.rate) || product.rate < 0 || product.rate > 5)) invalid();
        for (const key of ["sku", "barcode", "description", "shopName"]) {
            if (product[key] !== undefined && typeof product[key] !== "string") invalid();
        }
        if (product.gallery !== undefined) {
            if (!product.gallery || typeof product.gallery !== "object" || Array.isArray(product.gallery) ||
                (product.gallery.images !== undefined && (!Array.isArray(product.gallery.images) ||
                    !product.gallery.images.every(isValidProductImage))) ||
                (product.gallery.video !== undefined && !isValidProductAsset(product.gallery.video, "video"))) invalid();
        }
        if (product.options !== undefined) {
            if (!product.options || typeof product.options !== "object" || Array.isArray(product.options)) invalid();
            for (const key of ["color", "type"]) {
                const options = product.options[key];
                if (options !== undefined && (!Array.isArray(options) || options.some(option =>
                    !option || typeof option.name !== "string" || typeof option.value !== "string" ||
                    (option.image !== undefined && !isValidProductImage(option.image))))) invalid();
            }
        }
        ids.add(product.id);
    });
    return products;
}

export function getProductList() {
    let raw;
    try {
        raw = localStorage.getItem(PRODUCT_STORAGE_KEY);
    } catch {
        throw new Error("Không thể đọc bộ nhớ sản phẩm. Vui lòng cho phép trình duyệt lưu dữ liệu.");
    }
    if (raw === null) return JSON.parse(JSON.stringify(defaultProductList));
    let products;
    try {
        products = JSON.parse(raw);
    } catch {
        throw new Error("Dữ liệu sản phẩm đã lưu bị lỗi định dạng JSON. Chưa có dữ liệu nào bị ghi đè.");
    }
    return validateProductList(products);
}

export function saveProductList(products) {
    validateProductList(products);
    try {
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
    } catch {
        throw new Error("Không thể lưu sản phẩm. Bộ nhớ trình duyệt có thể đã đầy hoặc bị chặn.");
    }
}

// Các trang người mua chỉ nhận sản phẩm đang bán và còn hàng.
export const productList = (() => {
    try {
        return getProductList();
    } catch (error) {
        console.warn(error.message);
        return JSON.parse(JSON.stringify(defaultProductList));
    }
})().filter(product => product.status === "DANG_BAN" && product.stock > 0);


function renderProduct(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container)
        return;
    container.innerHTML = productList.map(function (product) {
        return ` <div class="col-xl-2 col-md-4 col-6">
        <a href="../html/CT_product.html?id=${product.id}" class="product_link">
        <div class="body__flashsale-product"
             style="border: 1px solid #ddd;
                    background-color: #fff;
                    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);">

            <div class="flashsale__product-img">
                <img src="${escapeProductHtml(product.image)}" alt="${escapeProductHtml(product.name)}">
            </div>
            <!-- Đánh giá sản phẩm -->
            <div class="body__product-rating">
                <div class="body__rating-stars">
                   ${[1, 2, 3, 4, 5].map(function (star) {
            const rating = product.rate;
            let starClass = "";

            if (rating >= star) {
                // Sao đầy
                starClass = "full";
            } else if (rating > star - 1) {
                // Sao một phần
                const decimal = Math.round((rating % 1) * 10);

                starClass = `partial rating-0-${decimal}`;
            } else {
                // Sao rỗng
                starClass = "empty";
            }
            return `
                   <span class="material-symbols-outlined body__rating-review ${starClass}">
                   star
                  </span>
                  `;
        }).join("")}
                </div>
                <div class="body__rating-number">
                    (${product.rate})
                </div>

                <div class="body__rating-saled">
                    Đã bán ${product.sold >= 1000
                ? (product.sold / 1000).toFixed(1) + "k"
                : product.sold
            }
                </div>
            </div>
            <!-- Tên sản phẩm -->
            <p class="flashsale__product-name">
                ${escapeProductHtml(product.name)}
            </p>
            <!-- Giá sản phẩm -->
            <div class="flashsale__product-footer">
                <div class="flashsale__product-footer--price">
                    <p class="flashsale__product-price">
                        ${product.newPrice.toLocaleString("vi-VN")}đ
                    </p>

                    <p class="flashsale__product-oldprice">
                        ${product.oldPrice.toLocaleString("vi-VN")}đ
                    </p>
                </div>
                <!-- Nút thêm vào giỏ hàng -->
                <span class="flashsale__product-footer--addcart material-symbols-outlined">
                    add_shopping_cart
                </span>
            </div>
            <!-- Phần trăm giảm giá -->
            <div class="flashsale__product-sale">
                ${product.oldPrice > 0
                ? "-" + Math.round(
                    (1 - product.newPrice / product.oldPrice) * 100
                ) + "%"
                : "0%"
            }
            </div>
        </div>
        </a>
    </div>`
    }).join("");
}


function renderCatalog(containerId, productList) {
    const container = document.getElementById(containerId);
    if (!container)
        return;
    container.innerHTML = productList.map(function (product) {
        return ` <div class="col-xl-3 col-md-3 col-6">
        <div class="body__flashsale-product"
             style="border: 1px solid #ddd;
                    background-color: #fff;
                    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);">

            <div class="flashsale__product-img">
                <img src="${escapeProductHtml(product.image)}" alt="${escapeProductHtml(product.name)}">
            </div>
            <!-- Đánh giá sản phẩm -->
            <div class="body__product-rating">
                <div class="body__rating-stars">
                   ${[1, 2, 3, 4, 5].map(function (star) {
            const rating = product.rate;
            let starClass = "";

            if (rating >= star) {
                // Sao đầy
                starClass = "full";
            } else if (rating > star - 1) {
                // Sao một phần
                const decimal = Math.round((rating % 1) * 10);

                starClass = `partial rating-0-${decimal}`;
            } else {
                // Sao rỗng
                starClass = "empty";
            }

            return `
                   <span class="material-symbols-outlined body__rating-review ${starClass}">
                   star
                  </span>
                  `;
        }).join("")}
                </div>
                <div class="body__rating-number">
                    (${product.rate})
                </div>

                <div class="body__rating-saled">
                    Đã bán ${product.sold >= 1000
                ? (product.sold / 1000).toFixed(1) + "k"
                : product.sold
            }
                </div>
            </div>
            <!-- Tên sản phẩm -->
            <p class="flashsale__product-name">
                ${escapeProductHtml(product.name)}
            </p>
            <!-- Giá sản phẩm -->
            <div class="flashsale__product-footer">
                <div class="flashsale__product-footer--price">
                    <p class="flashsale__product-price">
                        ${product.newPrice.toLocaleString("vi-VN")}đ
                    </p>

                    <p class="flashsale__product-oldprice">
                        ${product.oldPrice.toLocaleString("vi-VN")}đ
                    </p>
                </div>
                <!-- Nút thêm vào giỏ hàng -->
                <span class="flashsale__product-footer--addcart material-symbols-outlined">
                    add_shopping_cart
                </span>
            </div>
            <!-- Phần trăm giảm giá -->
            <div class="flashsale__product-sale">
                ${product.oldPrice > 0
                ? "-" + Math.round(
                    (1 - product.newPrice / product.oldPrice) * 100
                ) + "%"
                : "0%"
            }
            </div>
        </div>
    </div>`
    }).join("");
}
export { renderProduct, renderCatalog };

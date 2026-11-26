export const productList = [
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

]


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
                <img src="${product.image}" alt="${product.name}">
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
                ${product.name}
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
                <img src="${product.image}" alt="${product.name}">
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
                ${product.name}
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
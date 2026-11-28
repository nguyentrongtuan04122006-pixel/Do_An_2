
import { getProductList, saveProductList, isValidProductImage } from "./product.js";
import { getShopList } from "./seller.js";

// Lưu thông tin người bán và sản phẩm
let seller;
let shop;
let products = [];

// Lấy phần tử HTML theo ID
const $ = id => document.getElementById(id);


// TẠO MÃ SKU
function createSku(id) {
    return "SKU" + id;
}


// TẠO MỘT DÒNG PHÂN LOẠI
function createVariantRow(group, option = {}) {
    const row = document.createElement("div");
    row.className = "variant-row row g-2 align-items-end";
    row.dataset.variantRow = "true";

    row.innerHTML = `
        <div class="${group === "color" ? "col" : "col-10"}">
            <label class="form-label small">
                ${group === "color" ? "Tên màu" : "Tên phiên bản"}
            </label>
            <input type="text" class="form-control variant-name"
                value="${option.name || ""}" required>
        </div>

        ${group === "color" ? `
            <div class="col-5">
                <label class="form-label small">Ảnh màu</label>
                <input type="text" class="form-control variant-image"
                    value="${option.image || ""}">
            </div>
        ` : ""}

        <div class="col-auto">
            <button type="button" class="btn btn-danger btn-sm"
                data-remove-variant="true">Xóa</button>
        </div>
    `;

    return row;
}


// HIỂN THỊ CÁC PHÂN LOẠI
function renderVariantInputs(options = {}) {
    ["color", "type"].forEach(group => {
        const container = document.querySelector(
            `[data-variant-group="${group}"]`
        );

        container.innerHTML = "";

        (options[group] || []).forEach(option => {
            container.append(createVariantRow(group, option));
        });
    });
}


// LẤY DANH SÁCH PHÂN LOẠI
function collectVariantOptions() {
    const options = {};

    ["color", "type"].forEach(group => {
        const rows = document.querySelectorAll(
            `[data-variant-group="${group}"] .variant-row`
        );

        const list = [];

        rows.forEach(row => {
            const name = row.querySelector(".variant-name").value.trim();

            if (!name) return;

            const option = {
                name: name,
                value: name.toLowerCase().replace(/\s+/g, "-")
            };

            if (group === "color") {
                const image = row.querySelector(".variant-image").value.trim();

                if (image) option.image = image;
            }

            list.push(option);
        });

        if (list.length > 0) {
            options[group] = list;
        }
    });

    return options;
}


// HIỂN THỊ THÔNG BÁO
function notify(message, type = "success") {
    const notice = $("productNotice");

    notice.textContent = message;
    notice.className = `alert alert-${type} py-2 small`;
    notice.hidden = false;
}


// LẤY THÔNG TIN NGƯỜI BÁN
function getSellerContext() {
    const data = sessionStorage.getItem("currentSeller")
        || localStorage.getItem("currentSeller");

    if (!data) {
        throw new Error("Vui lòng đăng nhập.");
    }

    const currentSeller = JSON.parse(data);

    const currentShop = getShopList().find(
        item => item.sellerId == currentSeller.id
    );

    if (!currentShop) {
        throw new Error("Không tìm thấy gian hàng.");
    }

    return {
        seller: currentSeller,
        shop: currentShop
    };
}


// KIỂM TRA SẢN PHẨM CỦA NGƯỜI BÁN
function isMyProduct(product) {
    return product.sellerId == seller.id;
}


// LẤY SẢN PHẨM CỦA GIAN HÀNG
function getMyProducts() {
    return products.filter(isMyProduct);
}


// HIỂN THỊ DANH SÁCH SẢN PHẨM
function renderProducts() {
    const myProducts = getMyProducts();

    $("productTableBody").innerHTML = myProducts.map(product => `
        <tr>
            <td>
                <img src="${product.image}" width="50">
                <div>${product.name}</div>
                <small>${product.sku}</small>
            </td>

            <td>${product.category}</td>

            <td>${Number(product.newPrice).toLocaleString("vi-VN")}đ</td>

            <td>${product.stock}</td>

            <td>${product.status === "DA_AN" ? "Ngừng hoạt động" : "Đang hoạt động"}</td>

            <td>
    <button class="btn btn-sm btn-primary"
        data-action="edit" data-id="${product.id}">
        Sửa
    </button>

    ${product.status === "DA_AN"
            ? `<button class="btn btn-sm btn-success"
            data-action="activate" data-id="${product.id}">
            Bán lại
           </button>`
            : `<button class="btn btn-sm btn-danger"
            data-action="deactivate" data-id="${product.id}">
            Ngừng bán
           </button>`
        }
</td>
        </tr>
    `).join("");

    if (myProducts.length === 0) {
        $("productTableBody").innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    Chưa có sản phẩm.
                </td>
            </tr>
        `;
    }
}


// LƯU SẢN PHẨM
function saveProducts(list, message) {
    saveProductList(list);

    products = list;

    renderProducts();
    notify(message);
}


// MỞ FORM THÊM HOẶC SỬA
function openProductForm(id = null) {
    const product = products.find(item => item.id === id);

    $("productForm").reset();

    $("productId").value = product ? product.id : "";
    $("productName").value = product ? product.name : "";
    $("productCategory").value = product ? product.category : "";
    $("productOldPrice").value = product ? product.oldPrice : "";
    $("productNewPrice").value = product ? product.newPrice : "";
    $("productStock").value = product ? product.stock : "";
    $("productImage").value = product ? product.image : "";
    $("productDescription").value = product ? product.description || "" : "";

    $("productModalTitle").textContent = product
        ? "Sửa sản phẩm"
        : "Thêm sản phẩm";

    renderVariantInputs(product ? product.options || {} : {});

    bootstrap.Modal.getOrCreateInstance($("productModal")).show();
}


// THÊM HOẶC CẬP NHẬT SẢN PHẨM
function submitProduct(event) {
    event.preventDefault();

    const id = $("productId").value
        ? Number($("productId").value)
        : null;

    const oldPrice = Number($("productOldPrice").value);
    const newPrice = $("productNewPrice").value
        ? Number($("productNewPrice").value)
        : oldPrice;

    const stock = Number($("productStock").value);
    const image = $("productImage").value.trim();

    const name = $("productName").value.trim();
    const category = $("productCategory").value;

    if (!name || !category) {
        return notify("Vui lòng nhập đầy đủ thông tin.", "danger");
    }

    if (oldPrice <= 0 || newPrice <= 0 || newPrice > oldPrice || stock < 0) {
        return notify("Giá hoặc số lượng không hợp lệ.", "danger");
    }

    if (!isValidProductImage(image)) {
        return notify("Đường dẫn ảnh không hợp lệ.", "danger");
    }

    const oldProduct = products.find(item => item.id === id);

    const newId = id || (
        products.length > 0
            ? Math.max(...products.map(item => item.id)) + 1
            : 1
    );

    const product = {
        ...oldProduct,
        id: newId,
        sellerId: seller.id,
        shopId: shop.id,
        shopName: shop.name,
        sku: oldProduct ? oldProduct.sku : createSku(newId),
        name,
        category,
        oldPrice,
        newPrice,
        stock,
        image,
        description: $("productDescription").value,
        options: collectVariantOptions(),
        status: oldProduct ? oldProduct.status : "DANG_BAN",
        sold: oldProduct ? oldProduct.sold : 0,
        rate: oldProduct ? oldProduct.rate : 0,
        isFlashSale: oldProduct ? oldProduct.isFlashSale : false
    };

    let newList;

    if (id) {
        newList = products.map(item =>
            item.id === id ? product : item
        );
    } else {
        newList = [...products, product];
    }

    saveProducts(
        newList,
        id ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm."
    );

    bootstrap.Modal.getOrCreateInstance($("productModal")).hide();
}


// NGỪNG BÁN SẢN PHẨM
function deactivateProduct(id) {
     const newList = products.map(item =>
        item.id === id && isMyProduct(item)
            ? { ...item, status: "DA_AN" }
            : item
    );
    saveProducts(newList, "Đã ngừng bán sản phẩm.");
}


// KÍCH HOẠT LẠI SẢN PHẨM
function activateProduct(id) {
    const newList = products.map(item =>
        item.id === id && isMyProduct(item)
            ? { ...item, status: "DANG_BAN" }
            : item
    );

    saveProducts(newList, "Đã mở bán lại sản phẩm.");
}


// KHỞI ĐỘNG TRANG
function init() {
    try {
        const data = getSellerContext();

        seller = data.seller;
        shop = data.shop;

        products = getProductList();

        $("btnAddProduct").disabled = false;

    } catch (error) {
        notify(error.message, "danger");
        $("btnAddProduct").disabled = true;
    }

    $("btnAddProduct").addEventListener("click", () => {
        openProductForm();
    });

    $("productForm").addEventListener("submit", submitProduct);

    // Thêm và xóa phân loại
    $("productForm").addEventListener("click", event => {
        const addButton = event.target.closest("[data-add-variant]");

        if (addButton) {
            const group = addButton.dataset.addVariant;

            document.querySelector(
                `[data-variant-group="${group}"]`
            ).append(createVariantRow(group));

        }

        const removeButton = event.target.closest("[data-remove-variant]");

        if (removeButton) {
            removeButton.closest(".variant-row").remove();
        }
    });

    // Các nút sửa, ngừng bán, kích hoạt
    $("productTableBody").addEventListener("click", event => {
        const button = event.target.closest("[data-action]");

        if (!button) return;

        const id = Number(button.dataset.id);

        if (button.dataset.action === "edit") {
            openProductForm(id);
        }

        if (button.dataset.action === "deactivate") {
            deactivateProduct(id);
        }

        if (button.dataset.action === "activate") {
            activateProduct(id);
        }
    });

    renderProducts();
}

init();

import {
    getSellerList,
    saveSellerList,
    getShopList,
    saveShopList
} from "./seller.js";

function sellerRegsiter() {
    // thông tin tk
    const sdt = document.getElementById('phone');
    const email = document.getElementById('email');
    const pw = document.getElementById('pw');
    const repw = document.getElementById('pw2');
    // thông tin shop
    const name_shop = document.getElementById('shop');
    const product = document.getElementById('cat');
    const name = document.getElementById('name');
    const cccd = document.getElementById('cccd');
    //  địa chỉ kho
    const name_warehouse = document.getElementById('w1');
    const name_manager = document.getElementById('w2');
    const sdt_warehouse = document.getElementById('w3');
    const wh_city = document.getElementById('p');
    const wh_px = document.getElementById('w');
    const wh_h = document.getElementById('s');
    //  tb lỗi
    const phoneError = document.querySelector(".error_phone");
    const emailError = document.querySelector(".error_email");
    const pwError = document.querySelector(".error_pw");
    const pw2Error = document.querySelector(".error_pw2");
    const phoneError2 = document.querySelector(".error_phone2");
    const shopError = document.querySelector(".error_name-shop");
    const nameError = document.querySelector(".error_name");
    const cccdError = document.querySelector(".error_cccd");
    const categoryError = document.querySelector(".error_category");
    const warehouseError = document.querySelector(".error_warehouse");
    const managerError = document.querySelector(".error_manager");
    const cityError = document.querySelector(".error_city");
    const wardError = document.querySelector(".error_ward");
    const addressError = document.querySelector(".error_address");
    const carrierError = document.querySelector(".error_carrier");
    // điều khoản
    const agree = document.getElementById('agree_terms');
    const dki = document.getElementById('btn_register')
    function check_Validate() {
        if (!agree.checked) {
            alert("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật!");
            return false;
        }

        // Kiểm tra số điện thoại
        const phoneRegex = /^(03|05|07|08|09)[0-9]{8}$/;

        if (!phoneRegex.test(sdt.value.trim())) {
            sdt.classList.add("input-error");
            phoneError.textContent = "Số điện thoại không hợp lệ!";
            return false;
        }
        phoneError.textContent = "";
        sdt.classList.remove("input-error");

        // Kiểm tra số điện thoại kho
        if (!phoneRegex.test(sdt_warehouse.value.trim())) {
            sdt_warehouse.classList.add("input-error");
            phoneError2.textContent = "Số điện thoại không hợp lệ!";
            return false;
        }
        phoneError2.textContent = "";
        sdt_warehouse.classList.remove("input-error");

        // Kiểm tra email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email.value.trim())) {
            email.classList.add("input-error");
            emailError.textContent = "Email không hợp lệ!";
            return false;
        }
        emailError.textContent = "";
        email.classList.remove("input-error");

        // Kiểm tra mật khẩu
        if (pw.value === "") {
            pw.classList.add("input-error");
            pwError.textContent = "Vui lòng nhập mật khẩu!";
            return false;
        }

        if (pw.value.length < 8) {
            pw.classList.add("input-error");
            pwError.textContent = "Mật khẩu phải có ít nhất 8 ký tự!";
            return false;
        }
        pwError.textContent = "";
        pw.classList.remove("input-error");

        // Kiểm tra xác nhận mật khẩu
        if (repw.value === "") {
            repw.classList.add("input-error");
            pw2Error.textContent = "Vui lòng xác nhận mật khẩu!";
            return false;
        }

        if (pw.value !== repw.value) {
            repw.classList.add("input-error");
            pw2Error.textContent = "Mật khẩu xác nhận không khớp!";
            return false;
        }
        pw2Error.textContent = "";
        repw.classList.remove("input-error");

        // Kiểm tra tên gian hàng
        if (name_shop.value.trim() === "") {
            name_shop.classList.add("input-error");
            shopError.textContent = "Vui lòng nhập tên gian hàng!";
            return false;
        }
        shopError.textContent = "";
        name_shop.classList.remove("input-error");

        // Kiểm tra ngành hàng
        if (product.value === "") {
            product.classList.add("input-error");
            categoryError.textContent = "Vui lòng chọn ngành hàng!";
            return false;
        }
        categoryError.textContent = "";
        product.classList.remove("input-error");

        // Kiểm tra họ tên
        if (name.value.trim() === "") {
            name.classList.add("input-error");
            nameError.textContent = "Vui lòng nhập họ tên!";
            return false;
        }
        nameError.textContent = "";
        name.classList.remove("input-error");

        // Kiểm tra CCCD
        if (!/^[0-9]{12}$/.test(cccd.value.trim())) {
            cccd.classList.add("input-error");
            cccdError.textContent = "CCCD phải gồm 12 chữ số!";
            return false;
        }
        cccdError.textContent = "";
        cccd.classList.remove("input-error");

        // Kiểm tra tên kho
        if (name_warehouse.value.trim() === "") {
            name_warehouse.classList.add("input-error");
            warehouseError.textContent = "Vui lòng nhập tên kho!";
            return false;
        }
        warehouseError.textContent = "";
        name_warehouse.classList.remove("input-error");

        // Kiểm tra người liên hệ
        if (name_manager.value.trim() === "") {
            name_manager.classList.add("input-error");
            managerError.textContent = "Vui lòng nhập người liên hệ!";
            return false;
        }
        managerError.textContent = "";
        name_manager.classList.remove("input-error");

        // Kiểm tra tỉnh/thành phố
        if (wh_city.value === "") {
            wh_city.classList.add("input-error");
            cityError.textContent = "Vui lòng chọn tỉnh/thành phố!";
            return false;
        }
        cityError.textContent = "";
        wh_city.classList.remove("input-error");

        // Kiểm tra phường/xã
        if (wh_px.value === "") {
            wh_px.classList.add("input-error");
            wardError.textContent = "Vui lòng chọn phường/xã!";
            return false;
        }
        wardError.textContent = "";
        wh_px.classList.remove("input-error");

        // Kiểm tra địa chỉ chi tiết
        if (wh_h.value.trim() === "") {
            wh_h.classList.add("input-error");
            addressError.textContent = "Vui lòng nhập địa chỉ chi tiết!";
            return false;
        }
        addressError.textContent = "";
        wh_h.classList.remove("input-error");

        // Kiểm tra đơn vị vận chuyển
        const carriers = document.querySelectorAll(
            ".carrier input[type='checkbox']:checked"
        );

        if (carriers.length === 0) {
            carrierError.textContent = "Vui lòng chọn ít nhất một đơn vị vận chuyển!";
            return false;
        }
        carrierError.textContent = "";

        return true;
    }
    dki.addEventListener("click", function () {
        if (!check_Validate()) {
            return;
        }
        const sellerId = Date.now();

        const newSeller = {
            id: sellerId,
            phone: sdt.value.trim(),
            email: email.value.trim(),
            password: pw.value,
            role: "NGUOI_BAN",
            status: "HOAT_DONG"
        };
        const shopId = sellerId + 1;

        const carriers = document.querySelectorAll(
            ".carrier input[type='checkbox']:checked"
        );

        const carrierList = Array.from(carriers).map(item => {
            return item.closest(".carrier").querySelector("b").textContent.trim();
        });

        const newShop = {
            id: shopId,
            sellerId: sellerId,

            name: name_shop.value.trim(),
            category: product.value,
            ownerName: name.value.trim(),
            cccd: cccd.value.trim(),

            warehouse: {
                name: name_warehouse.value.trim(),
                manager: name_manager.value.trim(),
                phone: sdt_warehouse.value.trim(),
                city: wh_city.value,
                ward: wh_px.value,
                address: wh_h.value.trim()
            },

            carriers: carrierList
        };
        // Lấy danh sách hiện tại
        const sellerList = getSellerList();
        const shopList = getShopList();

        // Thêm tài khoản và gian hàng vào danh sách
        sellerList.push(newSeller);
        shopList.push(newShop);

        // Lưu vào localStorage
        saveSellerList(sellerList);
        saveShopList(shopList);

        alert("Đăng ký Người Bán thành công!");
        window.location.href="./seller_login.html"
    })
}
sellerRegsiter();
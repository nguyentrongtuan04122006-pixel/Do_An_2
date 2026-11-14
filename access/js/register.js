import { getUserList, saveUserList } from "./customer.js";
function showError(id, message) {
    document.querySelector(`#${id}_error`).textContent = message;
}
function register() {

    // Lấy form đăng ký
    const registerForm = document.querySelector(".register__form");

    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Lấy dữ liệu
        const fullname = document.querySelector("#fullname").value.trim();
        const account = document.querySelector("#account").value.trim();
        const password = document.querySelector("#password").value;
        const repassword = document.querySelector("#repassword").value;

        // Xóa lỗi cũ
        document.querySelectorAll(".register__error").forEach(label => {
            label.textContent = "";
        });

        // Kiểm tra họ tên
        if (!fullname) {
            showError("fullname", "Vui lòng nhập họ và tên!");
            return;
        }

        // Kiểm tra tài khoản
        if (!account) {
            showError("account", "Vui lòng nhập số điện thoại hoặc email!");
            return;
        }
        // Kiểm tra định dạng số điện thoại
        const phoneRegex = /^(0[0-9]{9})$/;

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!phoneRegex.test(account) && !emailRegex.test(account)) {
            showError("account", "Vui lòng nhập số điện thoại hoặc email hợp lệ!");
            return;
        }

        // Kiểm tra mật khẩu
        if (!password) {
            showError("password", "Vui lòng nhập mật khẩu!");
            return;
        }

        if (password.length < 8) {
            showError("password", "Mật khẩu phải có ít nhất 8 ký tự!");
            return;
        }

        // Kiểm tra xác nhận mật khẩu
        if (!repassword) {
            showError("repassword", "Vui lòng xác nhận mật khẩu!");
            return;
        }

        if (password !== repassword) {
            showError("repassword", "Mật khẩu xác nhận không khớp!");
            return;
        }

        // Lấy danh sách tài khoản
        const userList = getUserList();

        // Kiểm tra tài khoản đã tồn tại
        const existingUser = userList.find(user => user.account === account);

        if (existingUser) {
            showError("account", "Tài khoản đã tồn tại!");
            return;
        }

        // Tạo tài khoản mới
        const newUser = {
            id: userList.length > 0
                ? Math.max(...userList.map(user => user.id)) + 1
                : 1,
            fullname: fullname,
            account: account,
            password: password,
            role: "NGUOI_MUA",
            status: "HOAT_DONG"
        };

        // Lưu tài khoản
        userList.push(newUser);
        saveUserList(userList);

        registerForm.reset();
        window.location.href = "./login.html";
    })
}
register();
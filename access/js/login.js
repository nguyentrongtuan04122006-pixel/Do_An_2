
import { getUserList } from "./customer.js";

// Hiển thị lỗi
function showError(id, message) {
    document.querySelector(`#${id}_error`).textContent = message;
}

// Hàm đăng nhập
function login() {
    const loginForm = document.querySelector(".login__form");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Lấy dữ liệu
        const account = document.querySelector("#account").value.trim();
        const password = document.querySelector("#password").value;

        // Xóa lỗi cũ
        document.querySelectorAll(".login__error").forEach(label => {
            label.textContent = "";
        });

        // Kiểm tra dữ liệu
        if (!account) {
            showError("account", "Vui lòng nhập số điện thoại hoặc email!");
            return;
        }

        if (!password) {
            showError("password", "Vui lòng nhập mật khẩu!");
            return;
        }

        // Lấy danh sách tài khoản
        const userList = getUserList();

        // Tìm tài khoản
        const user = userList.find(item => item.account === account);

        if (!user) {
            showError("account", "Tài khoản không tồn tại!");
            return;
        }

        // Kiểm tra trạng thái
        if (user.status === "BI_KHOA") {
            showError("account", "Tài khoản của bạn đã bị khóa!");
            return;
        }

        // Kiểm tra mật khẩu
        if (user.password !== password) {
            showError("password", "Mật khẩu không chính xác!");
            return;
        }

        // Lưu người dùng đang đăng nhập
        const currentUser = {
            id: user.id,
            fullname: user.fullname,
            account: user.account,
            role: user.role,
            status: user.status
        };

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Chuyển về trang chủ
        window.location.href = "./index.html";
    });
}

// Gọi hàm đăng nhập
login();

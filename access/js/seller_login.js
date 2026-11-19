// ========================================================
// JAVASCRIPT XỬ LÝ ĐĂNG NHẬP KÊNH NGƯỜI BÁN NOVAMALL
// ========================================================

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("sellerLoginForm");
  const accountInput = document.getElementById("sellerAccount");
  const passwordInput = document.getElementById("sellerPassword");
  const accountError = document.getElementById("accountError");
  const passwordError = document.getElementById("passwordError");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const togglePasswordIcon = document.getElementById("togglePasswordIcon");
  const smsLoginBtn = document.getElementById("smsLoginBtn");
  const forgotPwBtn = document.getElementById("forgotPwBtn");

  // 1. Ẩn / Hiện Mật khẩu
  if (togglePasswordBtn && passwordInput && togglePasswordIcon) {
    togglePasswordBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordIcon.textContent = "visibility_off";
      } else {
        passwordInput.type = "password";
        togglePasswordIcon.textContent = "visibility";
      }
    });
  }

  // 2. Xóa lỗi khi người dùng gõ
  if (accountInput) {
    accountInput.addEventListener("input", function () {
      accountError.style.display = "none";
      const box = accountInput.closest(".seller-input-box") || accountInput.closest(".seller-input-wrapper");
      if (box) box.classList.remove("seller-input-box--error", "seller-input-wrapper--error");
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      passwordError.style.display = "none";
      const box = passwordInput.closest(".seller-input-box") || passwordInput.closest(".seller-input-wrapper");
      if (box) box.classList.remove("seller-input-box--error", "seller-input-wrapper--error");
    });
  }

  // 3. Xử lý Submit Đăng Nhập
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const accountValue = accountInput.value.trim();
      const passwordValue = passwordInput.value.trim();
      let isValid = true;

      // Validate Tài khoản
      if (!accountValue) {
        accountError.textContent = "Vui lòng nhập Email, Số điện thoại hoặc Tên shop.";
        accountError.style.display = "block";
        const box = accountInput.closest(".seller-input-box") || accountInput.closest(".seller-input-wrapper");
        if (box) box.classList.add("seller-input-box--error");
        isValid = false;
      }

      // Validate Mật khẩu
      if (!passwordValue) {
        passwordError.textContent = "Vui lòng nhập mật khẩu gian hàng.";
        passwordError.style.display = "block";
        const box = passwordInput.closest(".seller-input-box") || passwordInput.closest(".seller-input-wrapper");
        if (box) box.classList.add("seller-input-box--error");
        isValid = false;
      } else if (passwordValue.length < 6) {
        passwordError.textContent = "Mật khẩu phải từ 6 ký tự trở lên.";
        passwordError.style.display = "block";
        const box = passwordInput.closest(".seller-input-box") || passwordInput.closest(".seller-input-wrapper");
        if (box) box.classList.add("seller-input-box--error");
        isValid = false;
      }

      if (isValid) {
        // Lưu thông tin gian hàng đang hoạt động vào localStorage
        const sellerInfo = {
          shopName: "NovaTech Official",
          account: accountValue,
          role: "seller",
          isLoggedIn: true,
          loginAt: new Date().toISOString()
        };
        localStorage.setItem("currentSeller", JSON.stringify(sellerInfo));

        // Nút hiển thị trạng thái đang xử lý
        const submitBtn = loginForm.querySelector(".seller-btn-submit");
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>Đang đăng nhập...</span>
        `;
        submitBtn.disabled = true;

        // Chuyển hướng vào trang chủ Kênh Người Bán sau 600ms
        setTimeout(() => {
          window.location.href = "../html/seller_home.html";
        }, 600);
      }
    });
  }

  // 4. Đăng nhập mã SMS
  if (smsLoginBtn) {
    smsLoginBtn.addEventListener("click", function () {
      const phone = prompt("Nhập số điện thoại đã đăng ký gian hàng:");
      if (phone && phone.trim()) {
        alert("Mã xác thực OTP gồm 6 chữ số đã được gửi tới số điện thoại " + phone.trim() + "!");
        const otp = prompt("Nhập mã OTP 6 số để đăng nhập:");
        if (otp && otp.trim().length === 6) {
          alert("Xác thực OTP thành công! Đang chuyển hướng vào Kênh Người Bán...");
          window.location.href = "../html/seller_home.html";
        } else if (otp) {
          alert("Mã OTP không hợp lệ, vui lòng thử lại.");
        }
      }
    });
  }

  // 5. Quên mật khẩu
  if (forgotPwBtn) {
    forgotPwBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const contact = prompt("Vui lòng nhập Email hoặc SĐT đăng ký để nhận liên kết đặt lại mật khẩu:");
      if (contact && contact.trim()) {
        alert("Hướng dẫn khôi phục mật khẩu đã được gửi tới: " + contact.trim());
      }
    });
  }
});

import { getSellerList, getShopList } from "./seller.js";
document.addEventListener("DOMContentLoaded", function () {
  const accountInput = document.getElementById("sellerAccount");
  const passwordInput = document.getElementById("sellerPassword");
  const accountError = document.getElementById("accountError");
  const passwordError = document.getElementById("passwordError");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const togglePasswordIcon = document.getElementById("togglePasswordIcon");
  const forgotPwBtn = document.getElementById("forgotPwBtn");
  const loginForm = document.getElementById("sellerLoginForm");


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
  const userList = getSellerList();
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    console.log("Đã chạy submit!");
    accountError.textContent = "";
    passwordError.textContent = "";
    const seller = userList.find(user => user.email === accountInput.value.trim()
      || user.phone === accountInput.value.trim());
    if (!seller) {
      accountError.textContent = "Tài khoản không tồn tại";
      return
    }
    if (seller.password !== passwordInput.value.trim()) {
      passwordError.textContent = "Mật khẩu không chính xác";
      return
    }
    const { password, ...sellerInfo } = seller;
    const shop = (getShopList() || []).find(s => s.sellerId === seller.id);
    sellerInfo.shopName = shop ? shop.name : "";
    console.log("sellerInfo:", sellerInfo);
    localStorage.setItem("currentSeller", JSON.stringify(sellerInfo));
    window.location.href = "./seller_home.html";
  })
});

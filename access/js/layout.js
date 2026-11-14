(function () {
    // Địa chỉ của chính file layout.js này, dùng làm mốc để tìm components
    const scriptUrl = document.currentScript.src;
    const headerUrl = new URL("../../html/components/header.html", scriptUrl);
    const footerUrl = new URL("../../html/components/footer.html", scriptUrl);
 
    async function loadPart(selector, url) {
        const target = document.querySelector(selector);
        if (!target) return;
 
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Không tải được " + url + " (" + res.status + ")");
        }
        target.innerHTML = await res.text();
    }
 
    async function loadLayout() {
        try {
            await Promise.all([
                loadPart("#header", headerUrl),
                loadPart("#footer", footerUrl)
            ]);
            checkLogin();
 
            // Khởi tạo các chức năng sau khi header/footer đã vào trang
            if (typeof show_closeSearch === "function") show_closeSearch();
            if (typeof show_Menu === "function") show_Menu();
            if (typeof Count_time === "function") Count_time();
        } catch (error) {
            console.error("Lỗi tải giao diện:", error);
        }
    }
 
    loadLayout();
})();


function checkLogin() {
   const userAuth = document.querySelector("#user_auth");
    const userName = document.querySelector("#user_name");
    const login = document.querySelector(".navbar__user-login");
    const register = document.querySelector(".navbar__user-resgister");
    const logout = document.querySelector("#logout_btn");

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!userAuth || !userName) return;

    if (currentUser) {
        // Đã đăng nhập
        login.style.display = "none";
        register.style.display = "none";

        userName.textContent = `Xin chào, ${currentUser.fullname}`;
    } else {
        // Chưa đăng nhập
        userName.textContent = "";
        logout.style.display = "none";
    }

    logout.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "/html/index.html";
    });
}

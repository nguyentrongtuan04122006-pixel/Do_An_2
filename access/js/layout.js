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
            initLogin();
            userMobile();
            if (typeof window.initHomeFeatures === "function") {
                window.initHomeFeatures();
            }
        } catch (error) {
            console.error("Lỗi tải giao diện:", error);
        }
    }

    loadLayout();
})();

let dropdownBound = false;

function initLogin() {
    const userLink = document.querySelector(".navbar__user-link");
    const userIcon = userLink?.querySelector(".material-symbols-outlined");
    const userAuth = document.querySelector("#user_auth");
    const userName = document.querySelector("#user_name");
    const userNameMobile = document.querySelector("#user_name_mobile");
    const login = document.querySelector(".navbar__user-login");
    const register = document.querySelector(".navbar__user-resgister");
    const logout = document.querySelector("#logout_btn");

    if (!userLink || !userName || !userAuth) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (currentUser) {
        const text = `Xin chào ${currentUser.fullname.trim().split(" ").pop()}`;
        userName.textContent = text;                          // desktop
        if (userNameMobile) userNameMobile.textContent = text; // mobile (trên header)
        if (userIcon) userIcon.style.display = "none";
        login.style.display = "none";
        register.style.display = "none";
        logout.style.display = "";
    } else {
        userName.textContent = "";
        if (userNameMobile) userNameMobile.textContent = "";
        if (userIcon) userIcon.style.display = "";
        login.style.display = "inline-block";
        register.style.display = "inline-block";
        logout.style.display = "none";
    }

   logout.onclick = function () {
        localStorage.removeItem("currentUser");
        window.location.href = "/html/index.html";
    };


document.onclick = function (e) {
    console.log("Click document:", e.target);

    if (
        !userLink.contains(e.target) &&
        !userAuth.contains(e.target)
    ) {
        userAuth.classList.remove("show");
        console.log("Đã đóng dropdown");
    }
};
}
function userMobile() {
     const userLink = document.querySelector(".navbar__user-link");
    const userAuth = document.querySelector(".navbar__user-auth");

    if (!userLink || !userAuth) return;

    userLink.addEventListener("click", function (e) {
        e.stopPropagation();
        userAuth.classList.toggle("show");
    });

    // Bấm ra ngoài thì đóng
    document.addEventListener("click", function (e) {
        if (!userLink.contains(e.target) && !userAuth.contains(e.target)) {
            userAuth.classList.remove("show");
        }
    });
}
userMobile();
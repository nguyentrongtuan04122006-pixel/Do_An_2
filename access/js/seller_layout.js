(function () {
    // Lấy đường dẫn file JS để làm mốc tìm component
    const scriptUrl = document.currentScript.src;

    const headerUrl = new URL("../../html/components/seller_header.html", scriptUrl);
    const sidebarUrl = new URL("../../html/components/seller_sidebar.html", scriptUrl);

    // Tải component HTML vào phần tử theo selector
    async function loadComponent(selector, url) {
        const element = document.querySelector(selector);

        if (!element) {
            console.error(`Không tìm thấy phần tử: ${selector}`);
            return false;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${url}`);
            }

            element.innerHTML = await response.text();
            return true;
        } catch (error) {
            console.error("Lỗi tải component:", error);
            return false;
        }
    }

    // Khởi tạo layout
    async function initLayout() {
        const results = await Promise.all([
            loadComponent("#sellerHeader", headerUrl),
            loadComponent("#sellerSidebar", sidebarUrl)
        ]);

        if (results[1]) {
            initSidebar();
        }
    }

    // Xử lý Sidebar
    function initSidebar() {
        const menuBtn = document.querySelector("#sellerMenuToggle");
        const sidebar = document.querySelector(".seller-sidebar");
        const overlay = document.querySelector(".seller-sidebar-overlay");

        if (!menuBtn || !sidebar || !overlay) {
            console.error("Không tìm thấy nút menu, sidebar hoặc overlay.");
            return;
        }

        // ================= MENU ACTIVE =================
        const curStatus = new URLSearchParams(window.location.search).get("status");

        sidebar.querySelectorAll(".seller-sidebar__link").forEach(link => {
            const href = link.getAttribute("href");

            // Bỏ qua liên kết rỗng hoặc #
            if (!href || href === "#" || href.startsWith("javascript:")) {
                link.classList.remove("active");
                return;
            }

            const linkUrl = new URL(href, window.location.href);
            const linkStatus = linkUrl.searchParams.get("status");
            const samePage = linkUrl.pathname === window.location.pathname;

            link.classList.toggle("active", samePage && linkStatus === curStatus);
        });

        // ================= MỞ / ĐÓNG SIDEBAR (mobile) =================
        function openSidebar() {
            sidebar.classList.add("show");
            overlay.classList.add("show");
            document.body.classList.add("sidebar-open");
            menuBtn.setAttribute("aria-expanded", "true");
        }

        function closeSidebar() {
            sidebar.classList.remove("show");
            overlay.classList.remove("show");
            document.body.classList.remove("sidebar-open");
            menuBtn.setAttribute("aria-expanded", "false");
        }

        menuBtn.addEventListener("click", function () {
            sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
        });

        // Click lớp nền để đóng
        overlay.addEventListener("click", closeSidebar);

        // Click liên kết trong sidebar thì đóng
        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeSidebar);
        });

        // Nhấn ESC để đóng
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeSidebar();
        });
    }

    initLayout();
})();
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
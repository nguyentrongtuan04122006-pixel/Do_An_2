function Show_boloc(){
     const bodyLeft = document.querySelector(".body_left");
    const filterBtn = document.querySelector(".sort_btn-check");
    if (!bodyLeft || !filterBtn) return;

    // Tạo popup 1 lần, dùng cloneNode để giữ nguyên sự kiện/trạng thái tốt hơn innerHTML
    const overlay = document.createElement("div");
    overlay.className = "filter_overlay";
    overlay.innerHTML = `
        <div class="filter_popup">
            <div class="filter_popup-header">
                <span>BỘ LỌC TÌM KIẾM</span>
                <button class="filter_close" aria-label="Đóng">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="filter_popup-content"></div>
        </div>`;
    const content = overlay.querySelector(".filter_popup-content");
    const clone = bodyLeft.cloneNode(true);
    clone.classList.remove("body_left");      // tránh dính CSS ẩn/hiện của sidebar
    clone.classList.add("filter_clone");
    clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id")); // tránh trùng id
    content.appendChild(clone);
    document.body.appendChild(overlay);

    const open  = () => overlay.classList.add("show");
    const close = () => overlay.classList.remove("show");

    filterBtn.addEventListener("click", open);
    overlay.querySelector(".filter_close").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    // Nếu mở popup rồi kéo rộng lên PC thì tự đóng
    window.matchMedia("(min-width: 1025px)").addEventListener("change", e => {
        if (e.matches) close();
    });
}
Show_boloc();
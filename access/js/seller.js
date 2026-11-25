
// Lấy danh sách tài khoản Người Bán
export function getSellerList() {
    return JSON.parse(localStorage.getItem("sellerList")) || [];
}

// Lưu danh sách tài khoản Người Bán
export function saveSellerList(sellerList) {
    localStorage.setItem("sellerList", JSON.stringify(sellerList));
}

// Lấy danh sách gian hàng
export function getShopList() {
    return JSON.parse(localStorage.getItem("shopList")) || [];
}

// Lưu danh sách gian hàng
export function saveShopList(shopList) {
    localStorage.setItem("shopList", JSON.stringify(shopList));
}

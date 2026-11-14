
// Lấy danh sách tài khoản đã lưu
export function getUserList() {
    return JSON.parse(localStorage.getItem("userList")) || [];
}

// Lưu danh sách tài khoản
export function saveUserList(userList) {
    localStorage.setItem("userList", JSON.stringify(userList));
}

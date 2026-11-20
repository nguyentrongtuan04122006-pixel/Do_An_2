// ========================================================
// JAVASCRIPT XỬ LÝ TRANG CHỦ KÊNH NGƯỜI BÁN NOVAMALL
// ========================================================

function initSellerDashboard() {
  // 1. Chuyển đổi Menu Sidebar Active
  const sidebarLinks = document.querySelectorAll(".seller-sidebar__link");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (this.getAttribute("href") === "#") {
        e.preventDefault();
      }

      sidebarLinks.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // 2. Dữ liệu phân tích bán hàng
  const kpiDataSets = {
    today: {
      revenue: "148.650.000₫",
      revenueTrend: "+18.4% so với hôm qua",
      orders: "186 đơn",
      ordersTrend: "+12.5% so với hôm qua",
      conversion: "4.32%",
      conversionTrend: "+0.6% so với hôm qua",
      traffic: "8.420 lượt",
      trafficTrend: "+25.1% so với hôm qua",
    },

    yesterday: {
      revenue: "125.500.000₫",
      revenueTrend: "-5.2% so với hôm trước",
      orders: "165 đơn",
      ordersTrend: "-3.1% so với hôm trước",
      conversion: "4.15%",
      conversionTrend: "-0.2% so với hôm trước",
      traffic: "6.730 lượt",
      trafficTrend: "-4.5% so với hôm trước",
    },

    days7: {
      revenue: "942.300.000₫",
      revenueTrend: "+22.8% so với tuần trước",
      orders: "1.240 đơn",
      ordersTrend: "+18.3% so với tuần trước",
      conversion: "4.45%",
      conversionTrend: "+0.8% so với tuần trước",
      traffic: "54.800 lượt",
      trafficTrend: "+31.2% so với tuần trước",
    },

    days30: {
      revenue: "3.850.000.000₫",
      revenueTrend: "+35.6% so với tháng trước",
      orders: "5.180 đơn",
      ordersTrend: "+28.4% so với tháng trước",
      conversion: "4.60%",
      conversionTrend: "+1.2% so với tháng trước",
      traffic: "215.000 lượt",
      trafficTrend: "+42.5% so với tháng trước",
    },
  };

  // 3. Lấy các phần tử KPI
  const filterTabs = document.querySelectorAll(".seller-filter-tab");

  const kpiElements = {
    revenue: document.getElementById("kpiRevenue"),
    revenueTrend: document.getElementById("kpiRevenueTrend"),
    orders: document.getElementById("kpiOrders"),
    ordersTrend: document.getElementById("kpiOrdersTrend"),
    conversion: document.getElementById("kpiConversion"),
    conversionTrend: document.getElementById("kpiConversionTrend"),
    traffic: document.getElementById("kpiTraffic"),
    trafficTrend: document.getElementById("kpiTrafficTrend"),
  };

  // 4. Cập nhật dữ liệu KPI
  function updateKPI(period) {
    const data = kpiDataSets[period];

    if (!data) return;

    Object.keys(kpiElements).forEach((key) => {
      const element = kpiElements[key];

      if (!element) return;

      if (key.includes("Trend")) {
        element.textContent = `↗ ${data[key]}`;
      } else {
        element.textContent = data[key];
      }
    });
  }

  // 5. Xử lý chuyển tab thời gian
  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      filterTabs.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");

      updateKPI(this.dataset.period);
    });
  });
}

// Khởi chạy khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", initSellerDashboard);

function initSellerSidebar() {
    const menuToggle = document.querySelector("#sellerMenuToggle");
    const sidebar = document.querySelector("#sellerSidebar");

    if (!menuToggle || !sidebar) return;

    // Tạo lớp nền phía sau sidebar
    const overlay = document.createElement("div");
    overlay.className = "seller-sidebar-overlay";
    document.body.appendChild(overlay);

    // Mở sidebar
    function openSidebar() {
        sidebar.classList.add("show");
        overlay.classList.add("show");

        document.body.classList.add("sidebar-open");

        menuToggle.setAttribute("aria-expanded", "true");
    }

    // Đóng sidebar
    function closeSidebar() {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");

        document.body.classList.remove("sidebar-open");

        menuToggle.setAttribute("aria-expanded", "false");
    }

    // Bấm nút menu
    menuToggle.addEventListener("click", function () {
        const isOpen = sidebar.classList.contains("show");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    // Bấm ra ngoài sidebar
    overlay.addEventListener("click", closeSidebar);

    // Nhấn phím Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });

    // Chọn mục trong sidebar thì đóng lại trên mobile
    sidebar.querySelectorAll(".seller-sidebar__link").forEach(link => {
        link.addEventListener("click", function () {
            if (window.innerWidth < 992) {
                closeSidebar();
            }
        });
    });

    // Khi chuyển sang desktop thì reset trạng thái
    window.addEventListener("resize", function () {
        if (window.innerWidth >= 992) {
            closeSidebar();
        }
    });
}

// Khởi tạo
document.addEventListener("DOMContentLoaded", function () {
    initSellerSidebar();
});
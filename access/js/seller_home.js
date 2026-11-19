// ========================================================
// JAVASCRIPT XỬ LÝ TRANG CHỦ KÊNH NGƯỜI BÁN NOVAMALL
// ========================================================

document.addEventListener("DOMContentLoaded", function () {
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

  // 3. Dữ liệu cho các tab thời gian Phân Tích Bán Hàng
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
      pointsToday: [
        { x: 40, y: 190 },   // 00:00
        { x: 140, y: 180 },  // 03:00
        { x: 240, y: 170 },  // 06:00
        { x: 360, y: 140 },  // 09:00
        { x: 480, y: 130 },  // 12:00
        { x: 600, y: 110 },  // 15:30 (Hiện tại)
        { x: 720, y: 95 }    // Đỉnh tại 15:30
      ]
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
      pointsToday: [
        { x: 40, y: 195 },
        { x: 140, y: 185 },
        { x: 240, y: 180 },
        { x: 360, y: 155 },
        { x: 480, y: 145 },
        { x: 600, y: 130 },
        { x: 720, y: 120 }
      ]
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
      pointsToday: [
        { x: 40, y: 185 },
        { x: 140, y: 165 },
        { x: 240, y: 150 },
        { x: 360, y: 125 },
        { x: 480, y: 110 },
        { x: 600, y: 90 },
        { x: 720, y: 70 }
      ]
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
      pointsToday: [
        { x: 40, y: 190 },
        { x: 140, y: 160 },
        { x: 240, y: 140 },
        { x: 360, y: 110 },
        { x: 480, y: 95 },
        { x: 600, y: 80 },
        { x: 720, y: 60 }
      ]
    }
  };

  const filterTabs = document.querySelectorAll(".seller-filter-tab");
  const kpiRevenue = document.getElementById("kpiRevenue");
  const kpiRevenueTrend = document.getElementById("kpiRevenueTrend");
  const kpiOrders = document.getElementById("kpiOrders");
  const kpiOrdersTrend = document.getElementById("kpiOrdersTrend");
  const kpiConversion = document.getElementById("kpiConversion");
  const kpiConversionTrend = document.getElementById("kpiConversionTrend");
  const kpiTraffic = document.getElementById("kpiTraffic");
  const kpiTrafficTrend = document.getElementById("kpiTrafficTrend");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      filterTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const period = this.getAttribute("data-period");
      const data = kpiDataSets[period];
      if (data) {
        if (kpiRevenue) kpiRevenue.textContent = data.revenue;
        if (kpiRevenueTrend) kpiRevenueTrend.innerHTML = `↗ ${data.revenueTrend}`;
        if (kpiOrders) kpiOrders.textContent = data.orders;
        if (kpiOrdersTrend) kpiOrdersTrend.innerHTML = `↗ ${data.ordersTrend}`;
        if (kpiConversion) kpiConversion.textContent = data.conversion;
        if (kpiConversionTrend) kpiConversionTrend.innerHTML = `↗ ${data.conversionTrend}`;
        if (kpiTraffic) kpiTraffic.textContent = data.traffic;
        if (kpiTrafficTrend) kpiTrafficTrend.innerHTML = `↗ ${data.trafficTrend}`;
      }
    });
  });
});

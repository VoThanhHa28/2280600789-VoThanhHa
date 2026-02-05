const STORAGE_KEY = "students";
const THEME_KEY = "theme";

// Lấy dữ liệu từ localStorage
let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ===== DARK/LIGHT MODE TOGGLE =====
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    document.body.classList.toggle("light-mode", savedTheme === "light");
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const isLightMode = document.body.classList.contains("light-mode");
    const newTheme = isLightMode ? "dark" : "light";
    
    document.body.classList.toggle("light-mode", newTheme === "light");
    localStorage.setItem(THEME_KEY, newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector(".theme-icon");
    if (themeIcon) {
        themeIcon.textContent = theme === "light" ? "🌙" : "☀️";
    }
}

// Khởi tạo theme ngay khi script load (trước DOMContentLoaded để tránh flash)
const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
if (document.body) {
    document.body.classList.toggle("light-mode", savedTheme === "light");
}

// ===== 02. HIỂN THỊ DANH SÁCH - Render bảng từ mảng JS =====
// listToRender: mảng sinh viên cần hiển thị (mặc định là toàn bộ students)
function renderStudentList(listToRender) {
    const tbody = document.getElementById("student-list-tbody");
    if (!tbody) return;

    const list = listToRender !== undefined ? listToRender : students;
    tbody.innerHTML = "";

    if (list.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="5" style="text-align: center; padding: 30px; color: #999;">Chưa có sinh viên nào</td>';
        tbody.appendChild(tr);
        return;
    }

    list.forEach(function (student, index) {
        const tr = document.createElement("tr");
        tr.innerHTML =
            "<td>" +
            (index + 1) +
            "</td>" +
            "<td>" +
            student.id +
            "</td>" +
            "<td>" +
            student.name +
            "</td>" +
            "<td>" +
            student.email +
            "</td>" +
            "<td>" +
            student.className +
            "</td>";
        tbody.appendChild(tr);
    });
}

// ===== 04. TÌM KIẾM - Tìm theo mã / tên / lớp =====
function filterStudentsBySearch(keyword) {
    const k = (keyword || "").trim().toLowerCase();
    if (!k) return students;
    return students.filter(function (s) {
        return (
            (s.id && s.id.toLowerCase().includes(k)) ||
            (s.name && s.name.toLowerCase().includes(k)) ||
            (s.className && s.className.toLowerCase().includes(k))
        );
    });
}

function runSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;
    const keyword = searchInput.value.trim();
    const filtered = filterStudentsBySearch(keyword);
    renderStudentList(filtered);
}

// Render lần đầu khi load trang
document.addEventListener("DOMContentLoaded", function () {
    // Khởi tạo theme và cập nhật icon
    initTheme();

    renderStudentList();

    // Gắn sự kiện tìm kiếm: nút "Tìm kiếm" và phím Enter
    var searchBtn = document.getElementById("search-btn");
    var searchInput = document.getElementById("search-input");
    if (searchBtn) searchBtn.addEventListener("click", runSearch);
    if (searchInput) {
        searchInput.addEventListener("keyup", function (e) {
            if (e.key === "Enter") runSearch();
        });
        searchInput.addEventListener("input", function () {
            runSearch();
        });
    }

    // Gắn sự kiện toggle theme
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
});

const form = document.querySelector(".form");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const inputs = form.querySelectorAll(".input");

    const student = {
        id: inputs[0].value.trim(),
        name: inputs[1].value.trim(),
        email: inputs[2].value.trim(),
        className: inputs[3].value.trim(),
        phone: inputs[4].value.trim(),
    };

    // ===== 1. KHÔNG ĐƯỢC TRỐNG =====
    for (let key in student) {
        if (!student[key]) {
            alert("Không được để trống bất kỳ trường nào!");
            return;
        }
    }

    // ===== 2. VALIDATE TÊN =====
    // Chỉ chữ + khoảng trắng, ít nhất 2 từ
    const nameRegex = /^[A-Za-zÀ-ỹ]+(\s[A-Za-zÀ-ỹ]+)+$/;
    if (!nameRegex.test(student.name)) {
        alert("Họ tên không hợp lệ (phải có ít nhất 2 từ, không chứa số/ký tự đặc biệt)");
        return;
    }

    // ===== 3. VALIDATE EMAIL =====
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
        alert("Email không hợp lệ!");
        return;
    }

    // ===== 4. VALIDATE SỐ ĐIỆN THOẠI =====
    // Bắt đầu bằng 0, đủ 10 số
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(student.phone)) {
        alert("Số điện thoại không hợp lệ (bắt đầu bằng 0, đủ 10 số)");
        return;
    }

    // ===== 5. CHECK TRÙNG MÃ SV =====
    const isDuplicate = students.some(s => s.id === student.id);
    if (isDuplicate) {
        alert("Mã sinh viên đã tồn tại!");
        return;
    }

    // ===== ADD =====
    students.push(student);

    // ===== LƯU localStorage =====
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));

    alert("Thêm sinh viên thành công!");
    form.reset();

    // Cập nhật lại bảng danh sách (giữ kết quả tìm kiếm nếu đang có)
    runSearch();
});

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

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(isLoading) {
    let loader = document.getElementById("loading");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loading";
        loader.textContent = "Loading...";
        loader.style.position = "fixed";
        loader.style.top = "10px";
        loader.style.right = "10px";
        loader.style.padding = "10px 20px";
        loader.style.background = "#000";
        loader.style.color = "#fff";
        loader.style.display = "none";
        document.body.appendChild(loader);
    }
    loader.style.display = isLoading ? "block" : "none";
}

const form = document.querySelector(".form");
const tableBody = document.querySelector(".table tbody");

// Hàm render bảng realtime
function renderTable() {
    tableBody.innerHTML = "";
    students.forEach((s, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.className}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Gọi lần đầu render bảng
renderTable();

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

    // ===== Validate =====
    // Loading state bật
    showLoading(true);

    // Validate
    for (let key in student) {
        if (!student[key]) {
            showToast("Không được để trống!", "error");
            showLoading(false);
            return;
        }
    }

    const nameRegex = /^[A-Za-zÀ-ỹ]+(\s[A-Za-zÀ-ỹ]+)+$/;
    if (!nameRegex.test(student.name)) {
        alert("Họ tên không hợp lệ!");
        showToast("Họ tên không hợp lệ!", "error");
        showLoading(false);
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
        showToast("Email không hợp lệ!", "error");
        showLoading(false);
        return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(student.phone)) {
        showToast("Số điện thoại không hợp lệ!", "error");
        showLoading(false);
        return;
    }

    const isDuplicate = students.some(s => s.id === student.id);
    if (isDuplicate) {
        showToast("Mã sinh viên đã tồn tại!", "error");
        showLoading(false);
        return;
    }

    // Thêm sinh viên + localStorage
    students.push(student);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));

    // Render bảng
    renderStudentList();
    showToast("Thêm sinh viên thành công!", "success");

    form.reset();
    showLoading(false);
});
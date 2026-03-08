
const STORAGE_KEY = "students"; 
const THEME_KEY = "theme";

// Lấy dữ liệu từ localStorage

let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ===== DARK/LIGHT MODE TOGGLE =======
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
    document.body.classList.toggle("light-mode", savedTheme === "light");
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const isLightMode = document.body.classList.contains("light-mode");
    const newTheme = isLightMode ? "dark" : "light";
    
    document.body.classList.toggle("light-mode", newTheme === "dark");
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
        tr.innerHTML = '<td colspan="6" style="text-align: center; padding: 30px; color: #999;">Chưa có sinh viên nào</td>';
        tbody.appendChild(tr);
        return;
    }

    list.forEach(function (student, index) {
        const score = student.score != null && student.score !== "" ? Number(student.score) : "";
        const scoreDisplay = score === "" ? "—" : score;
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
            "</td>" +
            "<td>" +
            scoreDisplay +
            "</td>";
        tbody.appendChild(tr);
    });
}

// ===== LỌC THEO LỚP / ĐIỂM =====
function filterByClassAndScore(list, classValue, scoreMin, scoreMax) {
    let result = list;
    if (classValue && classValue.trim() !== "") {
        result = result.filter(function (s) {
            return s.className && s.className.trim() === classValue.trim();
        });
    }
    if (scoreMin !== "" && scoreMin != null && !isNaN(Number(scoreMin))) {
        const min = Number(scoreMin);
        result = result.filter(function (s) {
            const sc = s.score != null && s.score !== "" ? Number(s.score) : null;
            return sc != null && sc >= min;
        });
    }
    if (scoreMax !== "" && scoreMax != null && !isNaN(Number(scoreMax))) {
        const max = Number(scoreMax);
        result = result.filter(function (s) {
            const sc = s.score != null && s.score !== "" ? Number(s.score) : null;
            return sc != null && sc <= max;
        });
    }
    return result;
}

// ===== SẮP XẾP THEO TÊN / ĐIỂM (TĂNG / GIẢM) =====
function sortStudents(list, sortValue) {
    if (!sortValue || !list || list.length === 0) return list.slice();
    const arr = list.slice();
    switch (sortValue) {
        case "name-asc":
            arr.sort(function (a, b) {
                return (a.name || "").localeCompare(b.name || "", "vi");
            });
            break;
        case "name-desc":
            arr.sort(function (a, b) {
                return (b.name || "").localeCompare(a.name || "", "vi");
            });
            break;
        case "score-asc":
            arr.sort(function (a, b) {
                const sa = a.score != null && a.score !== "" ? Number(a.score) : -1;
                const sb = b.score != null && b.score !== "" ? Number(b.score) : -1;
                return sa - sb;
            });
            break;
        case "score-desc":
            arr.sort(function (a, b) {
                const sa = a.score != null && a.score !== "" ? Number(a.score) : -1;
                const sb = b.score != null && b.score !== "" ? Number(b.score) : -1;
                return sb - sa;
            });
            break;
        default:
            break;
    }
    return arr;
}

// Áp dụng tìm kiếm + lọc + sắp xếp và render
function applyFilterAndSort() {
    const searchInput = document.getElementById("search-input");
    const keyword = searchInput ? searchInput.value.trim() : "";
    let list = keyword ? filterStudentsBySearch(keyword) : students.slice();

    const filterClass = document.getElementById("filter-class");
    const filterScoreMin = document.getElementById("filter-score-min");
    const filterScoreMax = document.getElementById("filter-score-max");
    const sortBy = document.getElementById("sort-by");

    const classVal = filterClass ? filterClass.value : "";
    const scoreMin = filterScoreMin ? filterScoreMin.value : "";
    const scoreMax = filterScoreMax ? filterScoreMax.value : "";
    const sortVal = sortBy ? sortBy.value : "";

    list = filterByClassAndScore(list, classVal, scoreMin, scoreMax);
    list = sortStudents(list, sortVal);
    renderStudentList(list);
}

// Cập nhật dropdown "Lớp" từ danh sách sinh viên
function refreshFilterClassOptions() {
    const select = document.getElementById("filter-class");
    if (!select) return;
    const currentValue = select.value;
    const classes = [];
    students.forEach(function (s) {
        if (s.className && s.className.trim() && classes.indexOf(s.className.trim()) === -1) {
            classes.push(s.className.trim());
        }
    });
    classes.sort();
    select.innerHTML = '<option value="">Tất cả lớp</option>';
    classes.forEach(function (c) {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
    select.value = currentValue || "";
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
    applyFilterAndSort();
}

// Render lần đầu khi load trang
document.addEventListener("DOMContentLoaded", function () {
    // Khởi tạo theme và cập nhật icon
    initTheme();

    refreshFilterClassOptions();
    renderStudentList();

    // Lọc + sắp xếp
    const applyBtn = document.getElementById("apply-filter-sort");
    if (applyBtn) applyBtn.addEventListener("click", applyFilterAndSort);
    const filterClass = document.getElementById("filter-class");
    const sortBy = document.getElementById("sort-by");
    if (filterClass) filterClass.addEventListener("change", applyFilterAndSort);
    if (sortBy) sortBy.addEventListener("change", applyFilterAndSort);

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
const tableBody = document.querySelector(".table tbody");

// Hàm render bảng realtime (nếu dùng ở chỗ khác)
function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    students.forEach((s, index) => {
        const scoreDisplay = s.score != null && s.score !== "" ? s.score : "—";
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.className}</td>
            <td>${scoreDisplay}</td>
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
        score: inputs[4].value.trim() !== "" ? inputs[4].value.trim() : null,
        phone: inputs[5].value.trim(),
    };

    // ===== Validate =====
    if (!student.id || !student.name || !student.email || !student.className || !student.phone) {
        alert("Không được để trống (trừ Điểm có thể để trống)!");
        return;
    }
    if (student.score != null && student.score !== "") {
        const scoreNum = Number(student.score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 10) {
            alert("Điểm phải từ 0 đến 10!");
            return;
        }
    }

    const nameRegex = /^[A-Za-zÀ-ỹ]+(\s[A-Za-zÀ-ỹ]+)+$/;
    if (!nameRegex.test(student.name)) {
        alert("Họ tên không hợp lệ!");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
        alert("Email không hợp lệ!");
        return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(student.phone)) {
        alert("Số điện thoại không hợp lệ!");
        return;
    }

    const isDuplicate = students.some(s => s.id === student.id);
    if (isDuplicate) {
        alert("Mã sinh viên đã tồn tại!");
        return;
    }

    // ===== Thêm sinh viên =====
    students.push(student);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));

    // ===== Render bảng + cập nhật dropdown lớp =====
    refreshFilterClassOptions();
    renderStudentList();

    form.reset();
});
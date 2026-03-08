const STORAGE_KEY = "students";
const THEME_KEY = "theme"; //Thêm comment de conflict

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

// ===== RESET: Xóa tìm kiếm + lọc + sắp xếp, hiển thị full danh sách =====
function resetFiltersAndSearch() {
    var searchInput = document.getElementById("search-input");
    var filterClass = document.getElementById("filter-class");
    var filterScoreMin = document.getElementById("filter-score-min");
    var filterScoreMax = document.getElementById("filter-score-max");
    var sortBy = document.getElementById("sort-by");
    if (searchInput) searchInput.value = "";
    if (filterClass) filterClass.value = "";
    if (filterScoreMin) filterScoreMin.value = "";
    if (filterScoreMax) filterScoreMax.value = "";
    if (sortBy) sortBy.value = "";
    renderStudentList(students);
}

// ===== KEYBOARD SHORTCUTS =====
// Ctrl+K: focus ô tìm kiếm | Ctrl+Shift+R: reset | Ctrl+Shift+T: toggle theme
function setupKeyboardShortcuts() {
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key === "k") {
            e.preventDefault();
            var searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
            e.preventDefault();
            resetFiltersAndSearch();
        }
        if (e.ctrlKey && e.shiftKey && e.key === "T") {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Render lần đầu khi load trang
document.addEventListener("DOMContentLoaded", function () {
    // Khởi tạo theme và cập nhật icon
    initTheme();

    refreshFilterClassOptions();
    renderStudentList();
    setupKeyboardShortcuts();

    // Reset bộ lọc & tìm kiếm
    var resetBtn = document.getElementById("reset-filter-btn");
    if (resetBtn) resetBtn.addEventListener("click", resetFiltersAndSearch);

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
        score: inputs[4].value.trim() !== "" ? inputs[4].value.trim() : null,
        phone: inputs[5].value.trim(),
    };

    // ===== Validate =====
    for (let key in student) {
        if (!student[key]) {
            alert("Không được để trống!");
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

    // ===== Render bảng cơ bản =====
    renderStudentList(); // chỉ render cơ bản, không toast, không realtime fancy

    form.reset();
    showLoading(false);
});
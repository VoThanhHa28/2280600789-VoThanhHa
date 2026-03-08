const STORAGE_KEY = "students";
const THEME_KEY = "theme"; //Thêm comment de conflict

// Lấy dữ liệu từ localStorage

let students = [];

try {
    students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
} catch (error) {
    console.warn("LocalStorage corrupted, resetting students data");
    students = [];
}

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

    // Import / Export
    const importFileInput = document.getElementById("import-json-input");
    if (importFileInput) {
        importFileInput.addEventListener("change", function () {
            const file = this.files && this.files[0];
            if (file) {
                importFromJsonFile(file);
                this.value = "";
            }
        });
    }
    const exportBtn = document.getElementById("export-json-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportToJsonWithTimestamp);
    }
});

// ===== VALIDATE STUDENT (dùng cho form + import) =====
function validateStudent(student, checkDuplicate = true) {
    if (!student || typeof student !== "object") return { valid: false, error: "Dữ liệu không hợp lệ" };
    const id = (student.id != null && student.id !== undefined) ? String(student.id).trim() : "";
    const name = (student.name != null && student.name !== undefined) ? String(student.name).trim() : "";
    const email = (student.email != null && student.email !== undefined) ? String(student.email).trim() : "";
    const className = (student.className != null && student.className !== undefined) ? String(student.className).trim() : "";
    const phone = (student.phone != null && student.phone !== undefined) ? String(student.phone).trim() : "";
    const score = (student.score != null && student.score !== "") ? String(student.score).trim() : null;

    if (!id) return { valid: false, error: "Mã sinh viên không được trống" };
    if (!name) return { valid: false, error: "Họ tên không được trống" };
    if (!email) return { valid: false, error: "Email không được trống" };
    if (!className) return { valid: false, error: "Lớp không được trống" };
    if (!phone) return { valid: false, error: "Số điện thoại không được trống" };

    const nameRegex = /^[A-Za-zÀ-ỹ]+(\s[A-Za-zÀ-ỹ]+)+$/;
    if (!nameRegex.test(name)) return { valid: false, error: "Họ tên không hợp lệ" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { valid: false, error: "Email không hợp lệ" };
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phone)) return { valid: false, error: "Số điện thoại không hợp lệ" };
    if (checkDuplicate && students.some(function (s) { return s.id === id; })) {
        return { valid: false, error: "Mã sinh viên đã tồn tại: " + id };
    }
    return {
        valid: true,
        data: { id: id, name: name, email: email, className: className, score: score || null, phone: phone }
    };
}

// ===== IMPORT JSON - Chỉ thêm dòng hợp lệ =====
function importFromJsonFile(file) {
    if (!file || file.type !== "application/json") {
        showToast("Vui lòng chọn file JSON.", "error");
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const raw = e.target.result;
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : (parsed.students ? parsed.students : [parsed]);
            let added = 0, skipped = 0;
            list.forEach(function (item) {
                const result = validateStudent(item, true);
                if (result.valid) {
                    students.push(result.data);
                    added++;
                } else {
                    skipped++;
                }
            });
            if (added > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
                refreshFilterClassOptions();
                renderStudentList();
            }
            if (added > 0 && skipped === 0) {
                showToast("Đã import " + added + " sinh viên.", "success");
            } else if (added > 0 && skipped > 0) {
                showToast("Đã import " + added + " hợp lệ, bỏ qua " + skipped + " dòng không hợp lệ.", "success");
            } else if (skipped > 0) {
                showToast("Không có dòng nào hợp lệ. Đã bỏ qua " + skipped + " dòng.", "error");
            } else {
                showToast("File không chứa dữ liệu sinh viên hợp lệ.", "error");
            }
        } catch (err) {
            showToast("File JSON không hợp lệ: " + (err.message || "Lỗi đọc file"), "error");
        }
    };
    reader.readAsText(file, "UTF-8");
}

// ===== EXPORT JSON - File có timestamp trong tên =====
function exportToJsonWithTimestamp() {
    const now = new Date();
    const pad = function (n) { return n < 10 ? "0" + n : n; };
    const timestamp =
        now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) +
        "_" + pad(now.getHours()) + "-" + pad(now.getMinutes()) + "-" + pad(now.getSeconds());
    const filename = "students_" + timestamp + ".json";
    const payload = { exportedAt: now.toISOString(), students: students };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Đã xuất file " + filename, "success");
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("aria-atomic", "true");
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
    const result = validateStudent(student, true);
    if (!result.valid) {
        showToast(result.error, "error");
        showLoading(false);
        return;
    }
    students.push(result.data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    renderStudentList();
    refreshFilterClassOptions();
    form.reset();
    showLoading(false);
});
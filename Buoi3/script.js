const STORAGE_KEY = "students";

// Lấy dữ liệu từ localStorage
let students = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// ===== 02. HIỂN THỊ DANH SÁCH - Render bảng từ mảng JS =====
function renderStudentList() {
    const tbody = document.getElementById("student-list-tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (students.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="5" style="text-align: center; padding: 30px; color: #999;">Chưa có sinh viên nào</td>';
        tbody.appendChild(tr);
        return;
    }

    students.forEach(function (student, index) {
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

// Render lần đầu khi load trang
document.addEventListener("DOMContentLoaded", function () {
    renderStudentList();
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

    // Cập nhật lại bảng danh sách
    renderStudentList();
});

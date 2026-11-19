
let students = JSON.parse(
  localStorage.getItem("students")
) || [];

let editingId = null;

function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
}

function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.add("hidden");
  });

  document.getElementById(page).classList.remove("hidden");

  document.querySelectorAll(".sidebar a").forEach(link => {
    link.classList.remove("active");
  });

  const link = [...document.querySelectorAll(".sidebar a")]
    .find(a => a.getAttribute("onclick") === `showPage('${page}')`);

  if (link) link.classList.add("active");

  updateDashboard();
  renderStudents();
  renderAttendance();
  renderGrades();
}

function openForm(id = null) {
  editingId = id;
  document.getElementById("formTitle").textContent =
    id ? "Edit Student" : "Add Student";

  const student = students.find(s => s.id === id);

  document.getElementById("name").value = student?.name || "";
  document.getElementById("email").value = student?.email || "";
  document.getElementById("course").value = student?.course || "";
  document.getElementById("marks").value = student?.marks ?? "";

  document.getElementById("studentModal").classList.remove("hidden");
}

function closeForm() {
  document.getElementById("studentModal").classList.add("hidden");
}

function saveStudent() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();
  const marksInput = document.getElementById("marks").value;
  const marks = Number(marksInput);

  if (!name || !email || !course || marksInput === "" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Number.isFinite(marks) || marks < 0 || marks > 100) {
    alert("Enter valid student details and marks from 0 to 100.");
    return;
  }

  if (editingId !== null) {
    students = students.map(s =>
      s.id === editingId
        ? {...s, name, email, course, marks}
        : s
    );
  } else {
    students.push({
      id: Date.now(),
      name,
      email,
      course,
      marks,
      attendance: true
    });
  }

  saveData();
  closeForm();
  updateDashboard();
  renderStudents();
  renderAttendance();
  renderGrades();
}

function renderStudents() {
  const search = document.getElementById("search")
    ?.value.toLowerCase() || "";

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search) ||
    s.email.toLowerCase().includes(search) ||
    s.course.toLowerCase().includes(search)
  );

  document.getElementById("studentList").innerHTML =
    filtered.map(s => `
      <tr>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.email)}</td>
        <td>${escapeHTML(s.course)}</td>
        <td>${s.marks}%</td>
        <td>
          <button class="edit" onclick="openForm(${s.id})">Edit</button>
          <button class="delete" onclick="deleteStudent(${s.id})">Delete</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5">No students found.</td></tr>`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function deleteStudent(id) {
  if (confirm("Delete this student?")) {
    students = students.filter(s => s.id !== id);
    saveData();
    updateDashboard();
    renderStudents();
    renderAttendance();
    renderGrades();
  }
}

function updateDashboard() {
  document.getElementById("totalStudents").textContent =
    students.length;

  document.getElementById("presentCount").textContent =
    students.filter(s => s.attendance).length;

  const average = students.length
    ? students.reduce((sum, s) => sum + s.marks, 0) / students.length
    : 0;

  document.getElementById("averageGrade").textContent =
    average.toFixed(1) + "%";

  document.getElementById("recentStudents").innerHTML =
    students.slice(-5).reverse().map(s => `
      <div class="student-card">
        <strong>${escapeHTML(s.name)}</strong>
        <span> — ${escapeHTML(s.course)}</span>
      </div>
    `).join("") || "No students added yet.";
}

function renderAttendance() {
  document.getElementById("attendanceList").innerHTML =
    students.map(s => `
      <div class="student-card">
        <strong>${escapeHTML(s.name)}</strong>
        <button class="${s.attendance ? "present" : "absent"}"
          onclick="toggleAttendance(${s.id})">
          ${s.attendance ? "Present" : "Absent"}
        </button>
      </div>
    `).join("") || "No students available.";
}

function toggleAttendance(id) {
  students = students.map(s =>
    s.id === id ? {...s, attendance: !s.attendance} : s
  );

  saveData();
  renderAttendance();
  updateDashboard();
}

function renderGrades() {
  document.getElementById("gradeList").innerHTML =
    students.map(s => `
      <div class="student-card">
        <strong>${escapeHTML(s.name)}</strong>
        <span> — ${s.marks}% (${s.marks >= 40 ? "Pass" : "Fail"})</span>
      </div>
    `).join("") || "No grades available.";
}

updateDashboard();
renderStudents();
renderAttendance();
renderGrades();

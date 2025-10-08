$(document).ready(function () {
  $("#data-table").DataTable();

  // Sidebar
  const currentPath = window.location.pathname;

  document.querySelectorAll("#sidebar .nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Sidebar Toggle
  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
    });
  }

  // ================================
  // COLLEGE PAGE
  // ================================

  // ================================
  // REGISTER
  // ================================

  // register college code restriction
  $("#collegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // register college name restriction
  $("#collegeName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  $("#registerCollegeModal").on("shown.bs.modal", function () {
    const nameField = $("#collegeName");
    if (!nameField.val().startsWith("College of ")) {
      nameField.val("College of ");
    }
  });

  $("#registerCollegeForm").submit(function (e) {
    const code = $("#collegeCode").val().trim().toUpperCase();
    const name = $("#collegeName").val().trim();

    if (!code || !name) {
      e.preventDefault();
      alert("Please fill in both College Code and College Name.");
    }
  });

  // ================================
  // EDIT
  // ================================

  $(".btn-edit").click(function (e) {
    e.preventDefault();

    const row = $(this).closest("tr");
    const collegeCode = row.find("td:eq(0)").text().trim();
    const collegeName = row.find("td:eq(1)").text().trim();

    $("#originalCollegeCode").val(collegeCode);
    $("#editCollegeCode").val(collegeCode);
    $("#editCollegeName").val(collegeName);

    $("#editCollegeModal").modal("show");
  });

  // edit college code restriction
  $("#editCollegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // edit college name restriction
  $("#editCollegeName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  $("#editForm").submit(function (e) {
    const code = $("#editCollegeCode").val().trim();
    const name = $("#editCollegeName").val().trim();

    if (!code || !name) {
      e.preventDefault();
      alert("Please fill in both College Code and College Name.");
    }
  });

  // ================================
  // DELETE
  // ================================

  $(".btn-delete").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const code = row.find("td:eq(0)").text().trim();

    $("#deleteCollegeCode").val(code);
    $("#deleteCollegeModal").modal("show");
  });

  $("#confirmDeleteBtn").click(function () {
    const code = $("#deleteCollegeCode").val();

    if (!code) {
      alert("No college selected for deletion.");
      return;
    }

    $("#deleteCollegeForm").submit();
  });

  // ================================
  // PROGRAM PAGE
  // ================================

  // ================================
  // REGISTER
  // ================================

  // program code restriction
  $("#programCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // program name restriction
  $("#programName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  $("#registerProgramModal").on("shown.bs.modal", function () {
    const nameField = $("#programName");
    if (!nameField.val().startsWith("Bachelor of Science in ")) {
      nameField.val("Bachelor of Science in ");
    }
  });

  $("#registerProgramForm").submit(function (e) {
    const code = $("#programCode").val().trim().toUpperCase();
    const name = $("#programName").val().trim();
    const college_code = $("#programCollege").val().trim().toUpperCase();

    if (!code || !name || !college_code) {
      e.preventDefault();
      alert("Please fill in all fields.");
    }
  });

  // ================================
  // EDIT
  // ================================

  $(".btn-edit").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");

    const programCode = row.find("td:eq(0)").text().trim();
    const programName = row.find("td:eq(1)").text().trim();
    const collegeCode = row.find("td:eq(2)").text().trim();

    $("#editOriginalProgramCode").val(programCode);
    $("#editProgramCode").val(programCode);
    $("#editProgramName").val(programName);
    $("#editProgramCollege").val(collegeCode);

    $("#editProgramModal").modal("show");
  });

  // edit program code restriction
  $("#editProgramCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // edit program name restriction
  $("#editProgramName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // edit program form validation before normal submission
  $("#editProgramForm").submit(function (e) {
    const code = $("#editProgramCode").val().trim();
    const name = $("#editProgramName").val().trim();
    const college_code = $("#editProgramCollege").val().trim();

    if (!code || !name || !college_code) {
      e.preventDefault();
      alert("Please fill in all fields.");
    }
  });

  // ================================
  // DELETE
  // ================================

  $(".btn-delete").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const programCode = row.find("td:eq(0)").text().trim();

    $("#deleteProgramCode").val(programCode);
    $("#deleteProgramModal").modal("show");
  });

  $("#confirmDeleteProgramBtn").click(function () {
    const programCode = $("#deleteProgramCode").val();

    if (!programCode) {
      alert("No program selected for deletion.");
      return;
    }

    $("#deleteProgramForm").submit();
  });

  // ================================
  // STUDENTS PAGE
  // ================================

  // ================================
  // REGISTER
  // ================================

  // student ID restriction
  $("#idNumber").on("input", function () {
    let value = this.value.toUpperCase();
    value = value.replace(/[^0-9-]/g, "");

    if (value.length > 4 && value[4] !== "-") {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    this.value = value;
  });

  // student first name restriction
  $("#firstName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // student last name restriction
  $("#lastName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // register form validation
  $("#registerStudentForm").submit(function (e) {
    const idNumber = $("#idNumber").val().trim();
    const firstName = $("#firstName").val().trim();
    const lastName = $("#lastName").val().trim();
    const programCode = $("#programCode").val().trim();
    const yearLevel = $("#yearLevel").val().trim();
    const gender = $("#gender").val().trim();

    if (
      !idNumber ||
      !firstName ||
      !lastName ||
      !programCode ||
      !yearLevel ||
      !gender
    ) {
      e.preventDefault();
      alert("Please fill in all fields.");
    }
  });

  // ================================
  // EDIT
  // ================================

  // populate edit modal
  $(".btn-edit").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");

    const idNumber = row.find("td:eq(0)").text().trim();
    const firstName = row.find("td:eq(1)").text().trim();
    const lastName = row.find("td:eq(2)").text().trim();
    const programCode = row.find("td:eq(3)").text().trim();
    const yearLevel = row.find("td:eq(4)").text().trim();
    const gender = row.find("td:eq(5)").text().trim();

    $("#editOriginalStudentId").val(idNumber);
    $("#editOriginalStudentProgram").val(programCode);
    $("#editStudentId").val(idNumber);
    $("#editStudentFirstName").val(firstName);
    $("#editStudentLastName").val(lastName);
    $("#editStudentProgram").val(programCode);
    $("#editStudentYearLevel").val(yearLevel);
    $("#editStudentGender").val(gender);

    $("#editStudentModal").modal("show");
  });

  // edit student ID restriction
  $("#studentIdInput").on("input", function () {
    let value = this.value.toUpperCase();
    value = value.replace(/[^0-9-]/g, "");

    if (!value.startsWith("20")) {
      value = "20";
    }
    if (value.length > 4 && value[4] !== "-") {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    this.value = value;
  });

  // edit first name restriction
  $("#studentFirstNameInput").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // edit last name restriction
  $("#studentLastNameInput").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // edit form validation
  $("#editStudentForm").submit(function (e) {
    const idNumber = $("#studentIdInput").val().trim();
    const firstName = $("#studentFirstNameInput").val().trim();
    const lastName = $("#studentLastNameInput").val().trim();
    const programCode = $("#studentProgramSelect").val().trim();
    const yearLevel = $("#studentYearLevelSelect").val().trim();
    const gender = $("#studentGenderSelect").val().trim();

    const idPattern = /^20\d{2}-\d{4}$/;
    if (!idPattern.test(idNumber)) {
      e.preventDefault();
      alert("ID Number must follow the format: 20xx-xxxx (e.g., 2023-0001).");
      return;
    }

    if (
      !idNumber ||
      !firstName ||
      !lastName ||
      !programCode ||
      !yearLevel ||
      !gender
    ) {
      e.preventDefault();
      alert("Please fill in all fields.");
    }
  });

  // ================================
  // DELETE
  // ================================

  $(".btn-delete").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const studentId = row.find("td:eq(0)").text().trim();

    $("#deleteStudentId").val(studentId);
    $("#deleteStudentModal").modal("show");
  });

  $("#confirmDeleteStudentBtn").click(function () {
    const studentId = $("#deleteStudentId").val();
    if (!studentId) {
      alert("No student selected for deletion.");
      return;
    }
    $("#deleteStudentForm").submit();
  });
});

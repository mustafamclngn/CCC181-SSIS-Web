// toast notification
function showToast(message, type = "error") {
  const colors = {
    error: "#dc3545",
    warning: "#ffc107",
    success: "#28a745",
    info: "#17a2b8",
    danger: "#dc3545",
  };

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.style.backgroundColor = colors[type] || colors.error;
  toast.textContent = message;

  const container = document.getElementById("toastContainer");
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// flash messages to toast
document.addEventListener("DOMContentLoaded", function () {
  const flashMessages = document.querySelectorAll(".alert");
  flashMessages.forEach((alert) => {
    const type = alert.classList.contains("alert-success")
      ? "success"
      : alert.classList.contains("alert-warning")
      ? "warning"
      : alert.classList.contains("alert-info")
      ? "info"
      : alert.classList.contains("alert-danger")
      ? "error"
      : "error";
    const message = alert.textContent.trim();
    showToast(message, type);
    alert.remove();
  });
});

$(document).ready(function () {
  $("#data-table").DataTable();

  // Sidebar Toggle
  const toggleBtn = document.getElementById("toggle-btn");
  const sidebar = document.getElementById("sidebar");

  if (toggleBtn && sidebar) {
    const sidebarState = sessionStorage.getItem("sidebarCollapsed");
    if (sidebarState === "true") {
      sidebar.classList.add("collapsed");
    }

    document.documentElement.classList.remove("sidebar-collapsed-init");
    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      sidebar.classList.toggle("collapsed");
      const isCollapsed = sidebar.classList.contains("collapsed");
      sessionStorage.setItem("sidebarCollapsed", isCollapsed);
    });
  }
  const currentPath = window.location.pathname;

  document.querySelectorAll("#sidebar .nav-link").forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // ================================
  // COLLEGE PAGE
  // ================================

  // REGISTER
  // college code restriction
  $("#collegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // college name restriction
  $("#collegeName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  $("#registerCollegeModal").on("shown.bs.modal", function () {
    const nameField = $("#collegeName");
    if (!nameField.val().startsWith("College Of ")) {
      nameField.val("College Of ");
    }
  });

  $("#registerCollegeForm").submit(function (e) {
    e.preventDefault();

    const code = $("#collegeCode").val().trim().toUpperCase();
    const name = $("#collegeName").val().trim();

    if (!code || !name) {
      showToast(
        "Please fill in both College Code and College Name.",
        "warning"
      );
      return;
    }

    $.ajax({
      url: "/colleges/check",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ code: code, name: name }),
      success: function (response) {
        if (response.exists) {
          showToast("College code or name already exists!", "error");
        } else {
          e.target.submit();
        }
      },
      error: function () {
        showToast(
          "Error checking college existence. Please try again.",
          "error"
        );
      },
    });
  });

  // EDIT
  $(document).on("click", ".btn-edit", function (e) {
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
    e.preventDefault();

    const originalCode = $("#originalCollegeCode").val().trim().toUpperCase();
    const code = $("#editCollegeCode").val().trim().toUpperCase();
    const name = $("#editCollegeName").val().trim();

    if (!code || !name) {
      showToast(
        "Please fill in both College Code and College Name.",
        "warning"
      );
      return;
    }

    $.ajax({
      url: "/colleges/check",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        code: code,
        name: name,
        original_code: originalCode,
      }),
      success: function (response) {
        if (response.exists) {
          showToast("College code or name already exists!", "error");
        } else {
          e.target.submit();
        }
      },
      error: function () {
        showToast(
          "Error checking college existence. Please try again.",
          "error"
        );
      },
    });
  });

  // DELETE
  $(document).on("click", ".btn-delete", function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const code = row.find("td:eq(0)").text().trim();

    $("#deleteCollegeCode").val(code);
    $("#deleteCollegeModal").modal("show");
  });

  $("#confirmDeleteBtn").click(function () {
    const code = $("#deleteCollegeCode").val();

    if (!code) {
      showToast("No college selected for deletion.", "warning");
      return;
    }

    $("#deleteCollegeForm").submit();
  });

  // ================================
  // PROGRAM PAGE
  // ================================

  //REGISTER
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
    if (!nameField.val().startsWith("Bachelor Of ")) {
      nameField.val("Bachelor Of ");
    }
  });

  $("#registerProgramForm").submit(function (e) {
    e.preventDefault();

    const code = $("#programCode").val().trim().toUpperCase();
    const name = $("#programName").val().trim();
    const college_code = $("#programCollege").val().trim();

    if (!code || !name || !college_code) {
      showToast("Please fill in all fields.", "warning");
      return;
    }

    $.ajax({
      url: "/programs/check",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        code: code,
        name: name,
        college_code: college_code,
      }),
      success: function (response) {
        if (response.exists) {
          showToast("Program code or name already exists!", "error");
        } else {
          e.target.submit();
        }
      },
      error: function () {
        showToast(
          "Error checking program existence. Please try again.",
          "error"
        );
      },
    });
  });

  //EDIT
  $(document).on("click", ".btn-edit", function (e) {
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

  // edit program form validation
  $("#editProgramForm").submit(function (e) {
    e.preventDefault();

    const originalCode = $("#editOriginalProgramCode")
      .val()
      .trim()
      .toUpperCase();
    const code = $("#editProgramCode").val().trim().toUpperCase();
    const name = $("#editProgramName").val().trim();
    const college_code = $("#editProgramCollege").val().trim();

    if (!code || !name || !college_code) {
      showToast("Please fill in all fields.", "warning");
      return;
    }

    $.ajax({
      url: "/programs/check",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        code: code,
        name: name,
        college_code: college_code,
        original_code: originalCode,
      }),
      success: function (response) {
        if (response.exists) {
          showToast("Program code or name already exists!", "error");
        } else {
          e.target.submit();
        }
      },
      error: function () {
        showToast(
          "Error checking program existence. Please try again.",
          "error"
        );
      },
    });
  });

  // DELETE
  $(document).on("click", ".btn-delete", function (e) {
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

  // REGISTER
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

  $("#registerStudentForm").submit(function (e) {
    e.preventDefault();

    const idNumber = $("#idNumber").val().trim().toUpperCase();
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
      showToast("Please fill in all fields.", "warning");
      return;
    }

    const idPattern = /^20\d{2}-\d{4}$/;
    if (!idPattern.test(idNumber)) {
      showToast(
        "ID Number must follow the format: 20xx-xxxx (e.g., 2023-0001).",
        "error"
      );
      return;
    }

    $.ajax({
      url: "/students/check",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        id_number: idNumber,
        first_name: firstName,
        last_name: lastName,
      }),
      success: function (response) {
        if (response.exists) {
          showToast("Student ID already exists!", "error");
        } else {
          e.target.submit();
        }
      },
      error: function () {
        showToast(
          "Error checking student existence. Please try again.",
          "error"
        );
      },
    });
  });

  // EDIT
  $(document).on("click", ".btn-edit", function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");

    const idNumber = row.find("td:eq(0)").text().trim();
    const firstName = row.find("td:eq(1)").text().trim();
    const lastName = row.find("td:eq(2)").text().trim();
    const programCode = row.find("td:eq(3)").text().trim();
    const yearLevel = row.find("td:eq(4)").text().trim();
    const gender = row.find("td:eq(5)").text().trim();

    $("#editOriginalStudentId").val(idNumber);
    $("#editStudentId").val(idNumber);
    $("#editStudentFirstName").val(firstName);
    $("#editStudentLastName").val(lastName);
    $("#editStudentProgram").val(programCode);
    $("#editStudentYearLevel").val(yearLevel);
    $("#editStudentGender").val(gender);

    $("#editStudentModal").modal("show");
  });

  // edit student ID restrictions
  $("#editStudentId").on("input", function () {
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

  // edit student first name restriction
  $("#editStudentFirstName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // edit student last name restriction
  $("#editStudentLastName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  $("#editStudentForm").submit(function (e) {
    e.preventDefault();

    const originalId = $("#editOriginalStudentId").val().trim();
    const idNumber = $("#editStudentId").val().trim().toUpperCase();
    const firstName = $("#editStudentFirstName").val().trim();
    const lastName = $("#editStudentLastName").val().trim();
    const programCode = $("#editStudentProgram").val().trim();
    const yearLevel = $("#editStudentYearLevel").val().trim();
    const gender = $("#editStudentGender").val().trim();

    if (
      !idNumber ||
      !firstName ||
      !lastName ||
      !programCode ||
      !yearLevel ||
      !gender
    ) {
      showToast("Please fill in all fields.", "warning");
      return;
    }

    const idPattern = /^20\d{2}-\d{4}$/;
    if (!idPattern.test(idNumber)) {
      showToast(
        "ID Number must follow the format: 20xx-xxxx (e.g., 2023-0001).",
        "error"
      );
      return;
    }

    $.ajax({
      url: "/students/check",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        id_number: idNumber,
        first_name: firstName,
        last_name: lastName,
        original_id: originalId,
      }),
      success: function (response) {
        if (response.exists) {
          showToast("Student ID already exists!", "error");
        } else {
          e.target.submit();
        }
      },
      error: function () {
        showToast(
          "Error checking student existence. Please try again.",
          "error"
        );
      },
    });
  });

  // DELETE
  $(document).on("click", ".btn-delete", function (e) {
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

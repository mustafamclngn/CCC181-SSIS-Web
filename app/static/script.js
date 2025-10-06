$(document).ready(function () {
  $("#data-table").DataTable();

  // Sidebar
  document.querySelectorAll(".sidebar-link.nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      document
        .querySelectorAll(".sidebar-link.nav-link")
        .forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  const currentPath = window.location.pathname;
  $("#sidebar a").each(function () {
    if (this.getAttribute("href") === currentPath) {
      $(this).addClass("active");
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

  // register college submit validation
  $("#registerCollegeForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action");
    const code = $("#collegeCode").val().trim().toUpperCase();
    const name = $("#collegeName").val().trim();

    if (!code || !name) {
      alert("Please fill in both College Code and College Name.");
      return;
    }

    $.ajax({
      url: url,
      method: "POST",
      data: { code: code, name: name },
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#registerCollegeModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
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

  // edit college submit validation
  $("#editForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action");
    const data = form.serialize();

    $.ajax({
      url: url,
      method: "POST",
      data: data,
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#editCollegeModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
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

    $.ajax({
      url: "/colleges/delete",
      method: "POST",
      data: { code: code },
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#deleteCollegeModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
  });

  // ================================
  // PROGRAM PAGE
  // ================================

  // ================================
  // REGISTER
  // ================================

  // register program code restriction
  $("#programCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // register program name restriction
  $("#programName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  $("#registerProgramModal").on("shown.bs.modal", function () {
    const nameField = $("#programName");
    if (!nameField.val().startsWith("Bachelor of Science in ")) {
      nameField.val("Bachelor of Science in ");
    }
  });

  // register program submit validation
  $("#registerProgramForm").submit(function (e) {
    e.preventDefault();

    const url = $(this).attr("action") || "/programs/register";
    const data = {
      code: $("#programCode").val().trim().toUpperCase(),
      name: $("#programName").val().trim(),
      college_code: $("#programCollege").val().trim().toUpperCase(),
    };

    if (!data.code || !data.name || !data.college_code) {
      alert("Please fill in all fields.");
      return;
    }

    $.ajax({
      url: url,
      method: "POST",
      data: data,
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#registerProgramModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
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

  // edit program submit validation
  $("#editProgramForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action");
    const data = form.serialize();

    $.ajax({
      url: url,
      method: "POST",
      data: data,
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#editProgramModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
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

    $.ajax({
      url: "/programs/delete",
      method: "POST",
      data: { code: programCode },
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#deleteProgramModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
  });

  // ================================
  // STUDENTS PAGE
  // ================================

  // ================================
  // REGISTER
  // ================================

  $("#idNumber").on("input", function () {
    let value = this.value.toUpperCase();

    // register student idnumber restriction
    value = value.replace(/[^0-9-]/g, "");

    if (value.length > 4 && value[4] !== "-") {
      value = value.slice(0, 4) + "-" + value.slice(4);
    }

    if (value.length > 9) {
      value = value.slice(0, 9);
    }

    this.value = value;
  });

  // register student firstname restriction
  $("#firstName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // register student lastname restriction
  $("#lastName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // register student submit validation
  $("#registerStudentForm").submit(function (e) {
    e.preventDefault();

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
      alert("All fields are required.");
      return;
    }

    const data = {
      id_number: idNumber,
      first_name: firstName,
      last_name: lastName,
      program_code: programCode,
      year_level: yearLevel,
      gender: gender,
    };

    const url = $(this).attr("action") || "/students/register";

    $.ajax({
      url: url,
      method: "POST",
      data: data,
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#registerStudentModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
  });

  // ================================
  // EDIT
  // ================================

  $(".btn-edit").click(function (e) {
    e.preventDefault();

    const row = $(this).closest("tr");

    const idNumber = row.find("td:eq(0)").text().trim();
    const firstName = row.find("td:eq(1)").text().trim();
    const lastName = row.find("td:eq(2)").text().trim();
    const programCode = row.find("td:eq(3)").text().trim();

    $("#originalStudentId").val(idNumber);
    $("#originalStudentProgram").val(programCode);
    $("#studentIdInput").val(idNumber);
    $("#studentFirstNameInput").val(firstName);
    $("#studentLastNameInput").val(lastName);
    $("#studentProgramSelect").val(programCode);

    $("#editStudentModal").modal("show");
  });

  // edit student idnumber restriction
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

  // edit student firstname restriction
  $("#studentFirstNameInput").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // edit student lastname restriction
  $("#studentLastNameInput").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // edit student submit validation
  $("#editStudentForm").submit(function (e) {
    e.preventDefault();

    const idNumber = $("#studentIdInput").val().trim();
    const firstName = $("#studentFirstNameInput").val().trim();
    const lastName = $("#studentLastNameInput").val().trim();
    const programCode = $("#studentProgramSelect").val().trim();

    const idPattern = /^20\d{2}-\d{4}$/;
    if (!idPattern.test(idNumber)) {
      alert("ID Number must follow the format: 20xx-xxxx (e.g., 2023-0001).");
      return;
    }

    if (!idNumber || !firstName || !lastName || !programCode) {
      alert("All fields are required.");
      return;
    }

    const form = $(this);
    const url = form.attr("action");
    const data = form.serialize();

    $.ajax({
      url: url,
      method: "POST",
      data: data,
      complete: function (xhr) {
        if (xhr.status === 204) {
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
  });

  // ================================
  // DELETE
  // ================================

  $(".btn-delete").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");

    const studentId = row.find("td:eq(0)").text().trim();

    if (!studentId) {
      alert("Unable to get student ID. Please check your table structure.");
      return;
    }

    $("#confirmDeleteStudentBtn").data("student-id", studentId);

    $("#deleteStudentModal").modal("show");
  });

  $("#confirmDeleteStudentBtn").click(function () {
    const studentId = $(this).data("student-id");

    if (!studentId) {
      alert("No student ID found. Cannot delete.");
      return;
    }

    $.ajax({
      url: "/students/delete",
      method: "POST",
      data: { id_number: studentId },
      complete: function (xhr) {
        if (xhr.status === 204) {
          $("#deleteStudentModal").modal("hide");
          location.reload();
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          alert("Error: " + xhr.responseJSON.message);
        }
      },
    });
  });
});

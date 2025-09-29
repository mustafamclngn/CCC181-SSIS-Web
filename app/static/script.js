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

  // college code restriction
  $("#collegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // college name restriction
  $("#collegeName").on("input", function () {
    if (!this.value.startsWith("College of ")) {
      this.value = "College of ";
    }
    const prefix = "College of ";
    let suffix = this.value.substring(prefix.length);
    suffix = suffix.replace(/[^A-Za-z\s]/g, "");
    this.value = prefix + suffix;
  });

  $("#registerCollegeModal").on("shown.bs.modal", function () {
    $("#collegeName").val("College of ");
    $("#collegeCode").val("");
  });

  // submit validation
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

    $.post(url, { code: code, name: name })
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          $("#registerCollegeModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const errMsg = xhr.responseJSON
          ? xhr.responseJSON.message
          : xhr.statusText;
        alert("Request failed: " + errMsg);
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

  // college code restriction
  $("#editCollegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  // college name restriction
  $("#editCollegeName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

  // submit validation
  $("#editForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action");
    const data = form.serialize();

    $.post(url, data)
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          $("#registerCollegeModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const errMsg = xhr.responseJSON
          ? xhr.responseJSON.message
          : xhr.statusText;
        alert("Request failed: " + errMsg);
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

    $.post("/colleges/delete", { code: code })
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          $("#deleteCollegeModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const errMsg = xhr.responseJSON
          ? xhr.responseJSON.message
          : xhr.statusText;
        alert("Request failed: " + errMsg);
      });
  });

  // ================================
  // PROGRAM PAGE
  // ================================

  // Register Program
  $("#registerProgramForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action") || "/programs/register";
    const code = $("#programCode").val().trim().toUpperCase();
    const name = $("#programName").val().trim();
    const college_code = $("#programCollege").val().trim().toUpperCase();

    if (!code || !name || !college_code) {
      alert("Please fill in all fields.");
      return;
    }

    const data = { code: code, name: name, college_code: college_code };

    $.post(url, data)
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          $("#registerProgramModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const errMsg = xhr.responseJSON
          ? xhr.responseJSON.message
          : xhr.statusText;
        alert("Request failed: " + errMsg);
      });
  });

  // Edit Program
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

  $("#editProgramForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action");
    const data = form.serialize();

    $.post(url, data)
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        alert("Request failed: " + xhr.responseJSON.message);
      });
  });

  // Delete Program
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

    $.post("/students/delete", { id_number: studentId })
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          $("#deleteStudentModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const errMsg = xhr.responseJSON
          ? xhr.responseJSON.message
          : xhr.statusText;
        alert("Request failed: " + errMsg);
      });
  });

  // ================================
  // STUDENTS PAGE
  // ================================

  // Register Student
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

    $.post(url, data)
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          $("#registerStudentModal").modal("hide");
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const errMsg = xhr.responseJSON
          ? xhr.responseJSON.message
          : xhr.statusText;
        alert("Request failed: " + errMsg);
      });
  });

  // Edit Student
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

  $("#editStudentForm").submit(function (e) {
    e.preventDefault();

    const form = $(this);
    const url = form.attr("action");
    const data = form.serialize();

    $.post(url, data)
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        let res = xhr.responseJSON;
        alert("Request failed: " + (res ? res.message : xhr.responseText));
      });
  });

  $(".btn-delete").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");

    const studentId = row.find("td:eq(0)").text().trim();

    if (!studentId) {
      alert("Unable to get student ID. Please check your table structure.");
      return;
    }

    $("#confirmDeleteBtn").data("student-id", studentId);

    $("#deleteStudentModal").modal("show");
  });

  $("#confirmDeleteBtn").click(function () {
    const studentId = $(this).data("student-id");

    if (!studentId) {
      alert("No student ID found. Cannot delete.");
      return;
    }

    $.post("/students/delete", { id_number: studentId })
      .done(function (response) {
        if (response.success) {
          alert(response.message);
          location.reload();
        } else {
          alert("Error: " + response.message);
        }
      })
      .fail(function (xhr) {
        const res = xhr.responseJSON;
        alert("Request failed: " + (res ? res.message : xhr.responseText));
      });
  });
});

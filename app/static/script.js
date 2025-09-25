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

  // Register College
  $("#registerCollegeForm").on("submit", function (e) {
    e.preventDefault();

    let code = $("#collegeCode").val().trim().toUpperCase();
    let name = $("#collegeName").val().trim();

    if (!code || !name) {
      alert("All fields are required.");
      return;
    }

    $.ajax({
      url: "/colleges/register",
      type: "POST",
      data: { code: code, name: name },
      success: function () {
        $("#registerCollegeModal").modal("hide");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        alert("An error occurred while registering the college.");
      },
    });
  });

  // Edit College
  $(".btn-edit").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const code = row.find("td:eq(0)").text().trim();
    const name = row.find("td:eq(1)").text().trim();

    $("#originalCollegeCode").val(code);
    $("#editCollegeCode").val(code);
    $("#editCollegeName").val(name);

    $("#editCollegeModal").modal("show");
  });

  $(document).ready(function () {
    $("#editForm").on("submit", function (e) {
      e.preventDefault();

      const originalCode = $("#originalCollegeCode").val().trim().toUpperCase();
      const code = $("#editCollegeCode").val().trim().toUpperCase();
      const name = $("#editCollegeName").val().trim();

      if (!code || !name) {
        alert("All fields are required.");
        return;
      }

      $.ajax({
        url: "/colleges/edit",
        type: "POST",
        data: {
          original_code: originalCode,
          code: code,
          name: name,
        },
        success: function (response) {
          $("#editCollegeModal").modal("hide");
          location.reload();
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
          alert("An error occurred while updating the college.");
        },
      });
    });

    $(".btn-edit").click(function (e) {
      e.preventDefault();
      const row = $(this).closest("tr");
      const code = row.find("td:eq(0)").text().trim();
      const name = row.find("td:eq(1)").text().trim();

      $("#originalCollegeCode").val(code);
      $("#editCollegeCode").val(code);
      $("#editCollegeName").val(name);
      $("#editCollegeModal").modal("show");
    });
  });

  // Delete College
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
      alert("College code is missing.");
      return;
    }

    $.ajax({
      url: "/colleges/delete",
      type: "POST",
      data: { code: code },
      success: function () {
        $("#deleteCollegeModal").modal("hide");
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error:", error);
        alert("An error occurred while deleting the college.");
      },
    });
  });

  // --------------------------------
  // Programs Page
  // --------------------------------

  // Edit Program
  $(".btn-edit").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const code = row.find("td:eq(0)").text();
    const name = row.find("td:eq(1)").text();
    const college = row.find("td:eq(2)").text();

    $("#editProgramCode").val(code);
    $("#editProgramName").val(name);
    $("#editProgramCollege option")
      .filter(function () {
        return $(this).text() === college;
      })
      .prop("selected", true);

    $("#editProgramModal").modal("show");
  });

  // Delete Program
  $(".btn-delete").click(function (e) {
    e.preventDefault();
    $("#deleteProgramModal").modal("show");
  });

  // --------------------------------
  // Students Page
  // --------------------------------

  // Edit Student
  $(".btn-edit").click(function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const idnumber = row.find("td:eq(0)").text();
    const firstName = row.find("td:eq(1)").text();
    const lastName = row.find("td:eq(2)").text();
    const programCode = row.find("td:eq(3)").text().trim();
    const yearLevel = row.find("td:eq(4)").text().trim();
    const gender = row.find("td:eq(5)").text().trim();

    $("#editIdNumber").val(idnumber);
    $("#editFirstName").val(firstName);
    $("#editLastName").val(lastName);

    $("#editProgramCode option")
      .filter(function () {
        return $(this).val() === programCode;
      })
      .prop("selected", true);

    $("#editYearLevel").val(yearLevel);
    $("#editGender").val(gender);

    $("#editStudentModal").modal("show");
  });

  // Delete Student
  $(".btn-delete").click(function (e) {
    e.preventDefault();
    $("#deleteStudentModal").modal("show");
  });
});

$(document).ready(function () {
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

  // --------------------------------
  // Colleges Page
  // --------------------------------

  if ($("#collegesTable").length) {
    $("#collegesTable").DataTable({
      searching: true,
      ordering: true,
      paging: true,
      columnDefs: [{ orderable: false, searchable: false, targets: 2 }],
      pageLength: 10,
      lengthMenu: [10, 25, 50],
    });

    // Edit College
    $(".btn-edit").click(function (e) {
      e.preventDefault();
      const row = $(this).closest("tr");
      const code = row.find("td:eq(0)").text();
      const name = row.find("td:eq(1)").text();

      $("#editCollegeCode").val(code);
      $("#editCollegeName").val(name);
      $("#editCollegeModal").modal("show");
    });

    // Delete College
    $(".btn-delete").click(function (e) {
      e.preventDefault();
      $("#deleteCollegeModal").modal("show");
    });
  }

  // --------------------------------
  // Programs Page
  // --------------------------------

  if ($("#programsTable").length) {
    $("#programsTable").DataTable({
      searching: true,
      ordering: true,
      paging: true,
      columnDefs: [{ orderable: false, searchable: false, targets: 3 }],
      pageLength: 10,
      lengthMenu: [10, 25, 50],
    });

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
  }

  // --------------------------------
  // Students Page
  // --------------------------------

  if ($("#studentsTable").length) {
    $("#studentsTable").DataTable({
      searching: true,
      ordering: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [10, 25, 50],
      columnDefs: [
        { orderable: false, searchable: false, targets: 6 },
        { className: "dt-head-center dt-body-left", targets: 4 },
      ],
    });

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
  }
});

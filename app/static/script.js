function getCSRFToken() {
  return $("meta[name=csrf-token]").attr("content");
}

$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    if (
      !/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) &&
      !this.crossDomain
    ) {
      xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
    }
  },
});

// toast notification
function showToast(message, type = "error") {
  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.textContent = message;

  const container = document.getElementById("toastContainer");
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
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
  const dataTableElement = $("#data-table");

  const firstHeaderText = dataTableElement.find("thead th:first").text().trim();
  const isStudentPage = firstHeaderText === "Photo";
  const isProgramPage = firstHeaderText === "Program Code";
  const isCollegePage = firstHeaderText === "College Code";

  let dataTable = null;

  if (isStudentPage) {
    // ===============================================
    // STUDENTS DATATABLE - SERVER-SIDE
    // ===============================================

    let customFilters = {
      gender: "",
      year: "",
      program: "",
    };

    dataTable = dataTableElement.DataTable({
      processing: true,
      serverSide: true,
      language: {
        processing: "",
      },
      ajax: {
        url: "/students/data",
        type: "GET",
        data: function (d) {
          d.filter_gender = customFilters.gender;
          d.filter_year = customFilters.year;
          d.filter_program = customFilters.program;
        },
      },
      columns: [
        {
          data: "0",
          render: function (data, type, row) {
            // 'data' is the image URL from the server
            // 'row.DT_RowData.default_avatar' is the fallback passed in metadata
            const fallback = row.DT_RowData.default_avatar || "";
            return `
              <div class="text-center">
                <img src="${data}" 
                     alt="Student Photo" 
                     class="rounded-circle" 
                     style="width: 45px; height: 45px; object-fit: cover; border: 2px solid #dee2e6;"
                     onerror="this.onerror=null; this.src='${fallback}';">
              </div>`;
          },
        },
        { data: "1" }, // ID
        { data: "2" }, // First Name
        { data: "3" }, // Last Name
        {
          data: "4",
          render: function (data, type, row) {
            return data ? data : "None";
          },
        },
        { data: "5" }, // Year
        { data: "6" }, // Gender
        {
          data: "7",
          orderable: false,
          render: function (data, type, row) {
            return `
              <a href="#" class="btn btn-primary btn-sm btn-edit">
                <i class="bi bi-pencil-square"></i> Edit
              </a>
              <a href="#" class="btn btn-danger btn-sm btn-delete">
                <i class="bi bi-trash"></i> Delete
              </a>`;
          },
        },
      ],
      pageLength: 10,
      lengthChange: true,
      searching: true,
      order: [
        [3, "asc"],
        [2, "asc"],
      ],
      dom: '<"row"<"col-sm-12"tr>><"row mt-3"<"col-sm-12 col-md-5 d-flex align-items-center gap-3"l i><"col-sm-12 col-md-7 d-flex justify-content-end"p>>',
      columnDefs: [
        {
          targets: [0, 7],
          orderable: false,
        },
      ],
    });

    $("#applyFiltersBtn").on("click", function () {
      customFilters.gender = $("#filterGender").val();
      customFilters.year = $("#filterYearLevel").val();
      customFilters.program = $("#filterProgramCode").val();
      dataTable.ajax.reload();
    });

    $("#clearFiltersBtn").on("click", function () {
      $("#filterGender").val("");
      $("#filterYearLevel").val("");
      $("#filterProgramCode").val("");
      customFilters.gender = "";
      customFilters.year = "";
      customFilters.program = "";
      dataTable.ajax.reload();
    });

    const searchColumnStudent = $("#searchByColumnStudent");
    const searchInputStudent = $("#customSearchStudent");

    if (searchColumnStudent.length && searchInputStudent.length) {
      searchInputStudent.off("keyup").on("keyup", function () {
        dataTable.search(this.value).draw();
      });

      searchColumnStudent.off("change").on("change", function () {
        searchInputStudent.val("");
        dataTable.search("").draw();
      });
    }
  } else if (isProgramPage) {
    // ===============================================
    // PROGRAMS DATATABLE
    // ===============================================

    dataTable = dataTableElement.DataTable({
      processing: true,
      serverSide: true,
      language: {
        processing: "",
      },
      ajax: {
        url: "/programs/data",
        type: "GET",
      },
      columns: [
        { data: "code" },
        { data: "name" },
        {
          data: "college_code",
          render: function (data, type, row) {
            return data ? data : "None";
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            return `
              <a href="#" class="btn btn-primary btn-sm btn-edit">
                <i class="bi bi-pencil-square"></i> Edit
              </a>
              <a href="#" class="btn btn-danger btn-sm btn-delete">
                <i class="bi bi-trash"></i> Delete
              </a>
             `;
          },
          orderable: false,
        },
      ],
      pageLength: 10,
      lengthChange: true,
      searching: true,
      order: [[0, "asc"]],
      dom: '<"row"<"col-sm-12"tr>><"row mt-3"<"col-sm-12 col-md-5 d-flex align-items-center gap-3"l i><"col-sm-12 col-md-7 d-flex justify-content-end"p>>',
    });

    const searchColumnProgram = $("#searchByColumnProgram");
    const searchInputProgram = $("#customSearchProgram");

    if (searchColumnProgram.length && searchInputProgram.length) {
      searchInputProgram.on("keyup", function () {
        const searchValue = this.value;
        const columnIndex = parseInt(searchColumnProgram.val());

        dataTable.search("");
        dataTable.columns().search("");

        if (columnIndex === -1) {
          dataTable.search(searchValue).draw();
        } else {
          dataTable.column(columnIndex).search(searchValue).draw();
        }
      });

      searchColumnProgram.on("change", function () {
        dataTable.search("");
        dataTable.columns().search("");
        searchInputProgram.val("");
        dataTable.draw();
      });
    }
  } else if (isCollegePage) {
    // ===============================================
    // COLLEGES DATATABLE
    // ===============================================

    dataTable = dataTableElement.DataTable({
      processing: true,
      serverSide: true,
      language: {
        processing: "",
      },
      ajax: {
        url: "/colleges/data",
        type: "GET",
      },
      columns: [
        { data: "collegecode" },
        { data: "collegename" },
        {
          data: null,
          render: function (data, type, row) {
            return `
              <a href="#" class="btn btn-primary btn-sm btn-edit">
                <i class="bi bi-pencil-square"></i> Edit
              </a>
              <a href="#" class="btn btn-danger btn-sm btn-delete">
                <i class="bi bi-trash"></i> Delete
              </a>
             `;
          },
          orderable: false,
        },
      ],
      pageLength: 10,
      lengthChange: true,
      searching: true,
      order: [[0, "asc"]],
      dom: '<"row"<"col-sm-12"tr>><"row mt-3"<"col-sm-12 col-md-5 d-flex align-items-center gap-3"l i><"col-sm-12 col-md-7 d-flex justify-content-end"p>>',
    });

    const searchColumnCollege = $("#searchByColumnCollege");
    const searchInputCollege = $("#customSearchCollege");

    if (searchColumnCollege.length && searchInputCollege.length) {
      searchInputCollege.on("keyup", function () {
        const searchValue = this.value;
        const columnIndex = parseInt(searchColumnCollege.val());

        dataTable.search("");
        dataTable.columns().search("");

        if (columnIndex === -1) {
          dataTable.search(searchValue).draw();
        } else {
          dataTable.column(columnIndex).search(searchValue).draw();
        }
      });

      searchColumnCollege.on("change", function () {
        dataTable.search("");
        dataTable.columns().search("");
        searchInputCollege.val("");
        dataTable.draw();
      });
    }
  } else {
    dataTable = dataTableElement.DataTable({
      pageLength: 10,
      lengthChange: true,
      searching: true,
    });
  }

  const dashboardTable = $("#dashboard-table").DataTable({
    pageLength: 5,
    lengthChange: false,
    searching: false,
  });

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
  $("#collegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

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
          showToast("College already exists!", "error");
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

    let programCode, programName, collegeCode;
    const row = $(this).closest("tr");

    if (isProgramPage && dataTable) {
      const data = dataTable.row(row).data();
      if (data) {
        programCode = data.code;
        programName = data.name;
        collegeCode = data.college_code;
      }
      if ($("#editProgramModal").length) {
        $("#editOriginalProgramCode").val(programCode);
        $("#editProgramCode").val(programCode);
        $("#editProgramName").val(programName);
        $("#editProgramCollege").val(collegeCode);
        $("#editProgramModal").modal("show");
      }
      return;
    }

    if (isCollegePage && dataTable) {
      const data = dataTable.row(row).data();
      let code, name;
      if (data) {
        code = data.collegecode;
        name = data.collegename;
      }
      $("#originalCollegeCode").val(code);
      $("#editCollegeCode").val(code);
      $("#editCollegeName").val(name);
      $("#editCollegeModal").modal("show");
      return;
    }

    // ============================================
    // FALLBACK
    // ============================================

    const col0 = row.find("td:eq(0)").text().trim();
    const col1 = row.find("td:eq(1)").text().trim();
    const col2 = row.find("td:eq(2)").text().trim();

    if ($("#editCollegeModal").length && !isProgramPage) {
      $("#originalCollegeCode").val(col0);
      $("#editCollegeCode").val(col0);
      $("#editCollegeName").val(col1);
      $("#editCollegeModal").modal("show");
    }
  });

  $("#editCollegeCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

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
          showToast("College already exists!", "error");
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
    let code;

    if (isProgramPage && dataTable) {
      const data = dataTable.row(row).data();
      code = data ? data.code : row.find("td:eq(0)").text().trim();
      $("#deleteProgramCode").val(code);
      $("#deleteProgramModal").modal("show");
    } else if (isCollegePage && dataTable) {
      const data = dataTable.row(row).data();
      code = data ? data.collegecode : row.find("td:eq(0)").text().trim();
      $("#deleteCollegeCode").val(code);
      $("#deleteCollegeModal").modal("show");
    }
    // Fallback
    else {
      const header = dataTableElement.find("th:first").text().trim();
      code = row.find("td:eq(0)").text().trim();

      if (header === "College Code") {
        $("#deleteCollegeCode").val(code);
        $("#deleteCollegeModal").modal("show");
      } else {
        $("#deleteProgramCode").val(code);
        $("#deleteProgramModal").modal("show");
      }
    }
  });

  $("#confirmDeleteBtn").click(function () {
    const code = $("#deleteCollegeCode").val();

    if (!code) {
      showToast("No college selected for deletion.", "warning");
      return;
    }

    $("#deleteForm").submit();
  });

  // ================================
  // PROGRAM PAGE
  // ================================

  //REGISTER
  $("#programCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

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
          showToast("Program already exists!", "error");
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

  $("#editProgramCode").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z]/g, "");
  });

  $("#editProgramName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

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
          showToast("Program already exists!", "error");
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

  $("#confirmDeleteProgramBtn").click(function () {
    const programCode = $("#deleteProgramCode").val();

    if (!programCode) {
      showToast("No program selected for deletion.", "warning");
      return;
    }

    $("#deleteProgramForm").submit();
  });

  // ================================
  // STUDENTS PAGE
  // ================================

  $(document).ready(function () {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("studentImage");
    const dropZoneContent = document.getElementById("dropZoneContent");
    const imagePreview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");
    const fileName = document.getElementById("fileName");
    const removeImageBtn = document.getElementById("removeImage");
    const chooseImageBtn = document.getElementById("chooseImageBtn");

    if (dropZone && fileInput && chooseImageBtn) {
      chooseImageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        fileInput.click();
      });

      dropZone.addEventListener("click", () => {
        fileInput.click();
      });

      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("border-primary", "bg-light");
      });

      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("border-primary", "bg-light");
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-primary", "bg-light");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          fileInput.files = files;
          handleFileSelect(files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          handleFileSelect(e.target.files[0]);
        }
      });

      function handleFileSelect(file) {
        if (file) {
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            showToast("Image file size must be less than 5MB", "error");
            fileInput.value = "";
            return;
          }

          const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
          if (!allowedTypes.includes(file.type)) {
            showToast("Only PNG, JPG, and JPEG files are allowed", "error");
            fileInput.value = "";
            return;
          }

          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              previewImg.src = e.target.result;
              fileName.textContent = file.name;
              dropZoneContent.classList.add("d-none");
              imagePreview.classList.remove("d-none");
              removeImageBtn.classList.remove("d-none");
            };
            reader.readAsDataURL(file);
          }
        }
      }

      removeImageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.value = "";
        previewImg.src = "";
        fileName.textContent = "";
        imagePreview.classList.add("d-none");
        dropZoneContent.classList.remove("d-none");
        removeImageBtn.classList.add("d-none");
      });
    }

    // Edit student image function
    const editDropZone = document.getElementById("editDropZone");
    const editFileInput = document.getElementById("editStudentImage");
    const editDropZoneContent = document.getElementById("editDropZoneContent");
    const editImagePreview = document.getElementById("editImagePreview");
    const editPreviewImg = document.getElementById("editPreviewImg");
    const editFileName = document.getElementById("editFileName");
    const editRemoveImageBtn = document.getElementById("editRemoveImage");
    const editChooseImageBtn = document.getElementById("editChooseImageBtn");

    if (editDropZone && editFileInput && editChooseImageBtn) {
      editChooseImageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        editFileInput.click();
      });

      editDropZone.addEventListener("click", () => {
        editFileInput.click();
      });

      editDropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        editDropZone.classList.add("border-primary", "bg-light");
      });

      editDropZone.addEventListener("dragleave", () => {
        editDropZone.classList.remove("border-primary", "bg-light");
      });

      editDropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        editDropZone.classList.remove("border-primary", "bg-light");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          editFileInput.files = files;
          handleEditFileSelect(files[0]);
        }
      });

      editFileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          handleEditFileSelect(e.target.files[0]);
        }
      });

      function handleEditFileSelect(file) {
        if (file) {
          const maxSize = 5 * 1024 * 1024;
          if (file.size > maxSize) {
            showToast("Image file size must be less than 5MB", "error");
            editFileInput.value = "";
            return;
          }

          const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
          if (!allowedTypes.includes(file.type)) {
            showToast("Only PNG, JPG, and JPEG files are allowed", "error");
            editFileInput.value = "";
            return;
          }

          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
              editPreviewImg.src = e.target.result;
              editFileName.textContent = file.name;
              editDropZoneContent.classList.add("d-none");
              editImagePreview.classList.remove("d-none");
              editRemoveImageBtn.classList.remove("d-none");
              $("#removeImageFlag").val("0");
            };
            reader.readAsDataURL(file);
          }
        }
      }

      editRemoveImageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        editFileInput.value = "";
        editPreviewImg.src = "";
        editFileName.textContent = "";
        editImagePreview.classList.add("d-none");
        editDropZoneContent.classList.remove("d-none");
        editRemoveImageBtn.classList.add("d-none");
        $("#removeImageFlag").val("1");
      });

      $("#editStudentModal").on("hidden.bs.modal", function () {
        editFileInput.value = "";
        editPreviewImg.src = "";
        editFileName.textContent = "";
        editImagePreview.classList.add("d-none");
        editDropZoneContent.classList.remove("d-none");
        editRemoveImageBtn.classList.add("d-none");
        $("#removeImageFlag").val("0");
      });
    }
  });

  // REGISTER STUDENT
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

  $("#firstName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

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
          $("#registerStudentForm")[0].submit();
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

  // EDIT STUDENT
  $(document).on("click", "#data-table .btn-edit", function (e) {
    if (!isStudentPage) return;

    e.preventDefault();
    e.stopPropagation();

    const row = $(this).closest("tr");
    const data = dataTable.row(row).data().DT_RowData;

    $("#editOriginalStudentId").val(data.id_number);
    $("#editStudentId").val(data.id_number);
    $("#editStudentFirstName").val(data.first_name);
    $("#editStudentLastName").val(data.last_name);
    $("#editStudentProgram").val(data.program_code);
    $("#editStudentYearLevel").val(data.year_level);
    $("#editStudentGender").val(data.gender);

    const defaultAvatarUrl = row
      .find("img")
      .attr("onerror")
      .match(/'(.*)'/)[1];
    if (data.image_url && !data.image_url.includes("default-avatar")) {
      $("#editPreviewImg").attr("src", data.image_url);
      $("#editFileName").text("Current image");
      $("#editDropZoneContent").addClass("d-none");
      $("#editImagePreview").removeClass("d-none");
      $("#editRemoveImage").removeClass("d-none");
    } else {
      $("#editPreviewImg").attr("src", "");
      $("#editFileName").text("");
      $("#editImagePreview").addClass("d-none");
      $("#editDropZoneContent").removeClass("d-none");
      $("#editRemoveImage").addClass("d-none");
    }
    $("#editStudentImage").val("");
    $("#removeImageFlag").val("0");

    $("#editStudentModal").modal("show");
  });

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

  $("#editStudentFirstName").on("input", function () {
    this.value = this.value.replace(/[^A-Za-z\s]/g, "");
  });

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
        original_id: originalId,
      }),
      success: function (response) {
        if (response.exists) {
          showToast("A student with this ID already exists!", "error");
        } else {
          $("#editStudentForm")[0].submit();
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

  // DELETE STUDENT
  $(document).on("click", "#data-table .btn-delete", function (e) {
    if (isStudentPage) {
      e.preventDefault();
      e.stopPropagation();

      const row = $(this).closest("tr");
      const data = dataTable.row(row).data().DT_RowData;
      const studentId = data.id_number;

      $("#deleteStudentId").val(studentId);
      $("#deleteStudentModal").modal("show");
    }
  });

  $("#confirmDeleteStudentBtn").click(function () {
    const studentId = $("#deleteStudentId").val();
    if (!studentId) {
      showToast("No student selected for deletion.", "warning");
      return;
    }
    $("#deleteStudentForm").submit();
  });
});

// ================================
// RESET MODALS ON CLOSE
// ================================

$("#registerCollegeModal").on("hidden.bs.modal", function () {
  $("#registerCollegeForm")[0].reset();
});

$("#editCollegeModal").on("hidden.bs.modal", function () {
  $("#editForm")[0].reset();
});

$("#deleteCollegeModal").on("hidden.bs.modal", function () {
  $("#deleteForm")[0].reset();
});

$("#registerProgramModal").on("hidden.bs.modal", function () {
  $("#registerProgramForm")[0].reset();
});

$("#editProgramModal").on("hidden.bs.modal", function () {
  $("#editProgramForm")[0].reset();
});

$("#deleteProgramModal").on("hidden.bs.modal", function () {
  $("#deleteProgramForm")[0].reset();
});

$("#registerStudentModal").on("hidden.bs.modal", function () {
  $("#registerStudentForm")[0].reset();
  const fileInput = document.getElementById("studentImage");
  const previewImg = document.getElementById("previewImg");
  const fileName = document.getElementById("fileName");
  const imagePreview = document.getElementById("imagePreview");
  const dropZoneContent = document.getElementById("dropZoneContent");

  if (fileInput) fileInput.value = "";
  if (previewImg) previewImg.src = "";
  if (fileName) fileName.textContent = "";
  if (imagePreview) imagePreview.classList.add("d-none");
  if (dropZoneContent) dropZoneContent.classList.remove("d-none");
});

$("#editStudentModal").on("hidden.bs.modal", function () {
  $("#editStudentForm")[0].reset();
  const editFileInput = document.getElementById("editStudentImage");
  const editPreviewImg = document.getElementById("editPreviewImg");
  const editFileName = document.getElementById("editFileName");
  const editImagePreview = document.getElementById("editImagePreview");
  const editDropZoneContent = document.getElementById("editDropZoneContent");

  if (editFileInput) editFileInput.value = "";
  if (editPreviewImg) editPreviewImg.src = "";
  if (editFileName) editFileName.textContent = "";
  if (editImagePreview) editImagePreview.classList.add("d-none");
  if (editDropZoneContent) editDropZoneContent.classList.remove("d-none");
});

$("#deleteStudentModal").on("hidden.bs.modal", function () {
  $("#deleteStudentForm")[0].reset();
});

// ================================
// VIEW STUDENT DETAILS
// ================================

$(document).on("click", "#data-table tbody tr", function (e) {
  if ($(e.target).closest(".btn-edit, .btn-delete").length) {
    return;
  }

  const dataTableElement = $("#data-table");
  const firstHeaderText = dataTableElement.find("thead th:first").text().trim();
  if (firstHeaderText !== "Photo") return;

  const row = $(this);
  const dataTable = $("#data-table").DataTable();
  if (!dataTable.row) return;

  const data = dataTable.row(row).data().DT_RowData;

  const defaultAvatar = row
    .find("img")
    .attr("onerror")
    .match(/'(.*)'/)[1];

  $("#viewStudentId").text(data.id_number);
  $("#viewStudentFirstName").text(data.first_name);
  $("#viewStudentLastName").text(data.last_name);
  $("#viewStudentProgram").text(data.program_code);
  $("#viewStudentProgramFull").text(data.program_name || "N/A");
  $("#viewStudentCollegeCode").text(data.college_code || "N/A");
  $("#viewStudentCollegeName").text(data.college_name || "N/A");
  $("#viewStudentYearLevel").text(data.year_level);
  $("#viewStudentGender").text(data.gender);

  $("#viewStudentImage").addClass("d-none");
  $("#viewStudentInitials").addClass("d-none").removeClass("d-flex");

  if (data.image_url) {
    $("#viewStudentImage").attr("src", data.image_url).removeClass("d-none");
  } else {
    $("#viewStudentImage")
      .attr("src", data.default_avatar)
      .removeClass("d-none");
  }
  $("#viewStudentModal").modal("show");
});

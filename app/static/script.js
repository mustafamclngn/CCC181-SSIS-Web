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
  const dataTable = $("#data-table").DataTable({
    pageLength: 10,
    lengthChange: true,
    searching: true,
    order: [],
    dom: '<"row"<"col-sm-12"tr>><"row mt-3"<"col-sm-12 col-md-5 d-flex align-items-center gap-3"l i><"col-sm-12 col-md-7 d-flex justify-content-end"p>>',
    columnDefs: [
      {
        targets: -1,
        orderable: false,
      },
    ],
  });

  const dashboardTable = $("#dashboard-table").DataTable({
    pageLength: 5,
    lengthChange: false,
    searching: false,
  });

  // ================================
  // SEARCH FUNCTIONS
  // ================================

  // college search
  const searchColumnCollege = $("#searchByColumnCollege");
  const searchInputCollege = $("#customSearchCollege");

  if (searchColumnCollege.length && searchInputCollege.length && dataTable) {
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

  // program search
  const searchColumnProgram = $("#searchByColumnProgram");
  const searchInputProgram = $("#customSearchProgram");

  if (searchColumnProgram.length && searchInputProgram.length && dataTable) {
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

  // student search
  const searchColumnStudent = $("#searchByColumnStudent");
  const searchInputStudent = $("#customSearchStudent");

  if (searchColumnStudent.length && searchInputStudent.length && dataTable) {
    searchInputStudent.on("keyup", function () {
      const searchValue = this.value;
      const columnIndex = parseInt(searchColumnStudent.val());
      dataTable.search("");
      dataTable.columns().search("");
      if (columnIndex === -1) {
        dataTable.search(searchValue).draw();
      } else {
        dataTable.column(columnIndex).search(searchValue).draw();
      }
    });

    searchColumnStudent.on("change", function () {
      dataTable.search("");
      dataTable.columns().search("");
      searchInputStudent.val("");
      dataTable.draw();
    });
  }

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

    const row = $(this).closest("tr");
    const collegeCode = row.find("td:eq(0)").text().trim();
    const collegeName = row.find("td:eq(1)").text().trim();

    $("#originalCollegeCode").val(collegeCode);
    $("#editCollegeCode").val(collegeCode);
    $("#editCollegeName").val(collegeName);

    $("#editCollegeModal").modal("show");
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
      showToast("No program selected for deletion.", "warning");
      return;
    }

    $("#deleteProgramForm").submit();
  });

  // ================================
  // STUDENTS PAGE
  // ================================

  // ================================
  // STUDENTS PAGE
  // ================================

  // register student image function
  $(document).ready(function () {
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("studentImage");
    const dropZoneContent = document.getElementById("dropZoneContent");
    const imagePreview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImg");
    const fileName = document.getElementById("fileName");
    const removeImageBtn = document.getElementById("removeImage");

    if (dropZone && fileInput) {
      dropZone.addEventListener("click", (e) => {
        if (
          e.target.id !== "removeImage" &&
          !e.target.closest("#removeImage")
        ) {
          fileInput.click();
        }
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
            };
            reader.readAsDataURL(file);
          }
        }
      }

      removeImageBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.value = "";
        previewImg.src = "";
        fileName.textContent = "";
        imagePreview.classList.add("d-none");
        dropZoneContent.classList.remove("d-none");
      });
    }

    // edit student image function
    const editDropZone = document.getElementById("editDropZone");
    const editFileInput = document.getElementById("editStudentImage");
    const editDropZoneContent = document.getElementById("editDropZoneContent");
    const editImagePreview = document.getElementById("editImagePreview");
    const editPreviewImg = document.getElementById("editPreviewImg");
    const editFileName = document.getElementById("editFileName");
    const editRemoveImageBtn = document.getElementById("editRemoveImage");

    if (editDropZone && editFileInput) {
      editDropZone.addEventListener("click", (e) => {
        if (
          e.target.id !== "editRemoveImage" &&
          !e.target.closest("#editRemoveImage")
        ) {
          editFileInput.click();
        }
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
            };
            reader.readAsDataURL(file);
          }
        }
      }

      editRemoveImageBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        editFileInput.value = "";
        editPreviewImg.src = "";
        editFileName.textContent = "";
        editImagePreview.classList.add("d-none");
        editDropZoneContent.classList.remove("d-none");
      });

      $("#editStudentModal").on("hidden.bs.modal", function () {
        editFileInput.value = "";
        editPreviewImg.src = "";
        editFileName.textContent = "";
        editImagePreview.classList.add("d-none");
        editDropZoneContent.classList.remove("d-none");
      });
    }
  });

  // REGISTER
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

  // EDIT
  $(document).on("click", ".btn-edit", function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const imageCell = row.find("td:eq(0)");
    const imageElement = imageCell.find("img");
    const imageUrl = imageElement.length ? imageElement.attr("src") : null;
    const idNumber = row.find("td:eq(1)").text().trim();
    const firstName = row.find("td:eq(2)").text().trim();
    const lastName = row.find("td:eq(3)").text().trim();
    const programCode = row.find("td:eq(4)").text().trim();
    const yearLevel = row.find("td:eq(5)").text().trim();
    const gender = row.find("td:eq(6)").text().trim();

    $("#editOriginalStudentId").val(idNumber);
    $("#editStudentId").val(idNumber);
    $("#editStudentFirstName").val(firstName);
    $("#editStudentLastName").val(lastName);
    $("#editStudentProgram").val(programCode);
    $("#editStudentYearLevel").val(yearLevel);
    $("#editStudentGender").val(gender);
    if (imageUrl) {
      $("#editPreviewImg").attr("src", imageUrl);
      $("#editFileName").text("Current image");
      $("#editDropZoneContent").addClass("d-none");
      $("#editImagePreview").removeClass("d-none");
    } else {
      $("#editPreviewImg").attr("src", "");
      $("#editFileName").text("");
      $("#editImagePreview").addClass("d-none");
      $("#editDropZoneContent").removeClass("d-none");
    }
    $("#editStudentImage").val("");

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
        first_name: firstName,
        last_name: lastName,
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

  // DELETE
  $(document).on("click", ".btn-delete", function (e) {
    e.preventDefault();
    const row = $(this).closest("tr");
    const studentId = row.find("td:eq(1)").text().trim();

    $("#deleteStudentId").val(studentId);
    $("#deleteStudentModal").modal("show");
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

// reset college modals
$("#registerCollegeModal").on("hidden.bs.modal", function () {
  $("#registerCollegeForm")[0].reset();
});

$("#editCollegeModal").on("hidden.bs.modal", function () {
  $("#editForm")[0].reset();
});

$("#deleteCollegeModal").on("hidden.bs.modal", function () {
  $("#deleteForm")[0].reset();
});

// reset program modals
$("#registerProgramModal").on("hidden.bs.modal", function () {
  $("#registerProgramForm")[0].reset();
});

$("#editProgramModal").on("hidden.bs.modal", function () {
  $("#editProgramForm")[0].reset();
});

$("#deleteProgramModal").on("hidden.bs.modal", function () {
  $("#deleteProgramForm")[0].reset();
});

// reset students modals
$("#registerStudentModal").on("hidden.bs.modal", function () {
  $("#registerStudentForm")[0].reset();

  // reset register image field
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

  // reset edit image field
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

  const row = $(this);
  const imageCell = row.find("td:eq(0)");
  const imageElement = imageCell.find("img");
  const imageUrl = imageElement.length ? imageElement.attr("src") : null;
  const idNumber = row.find("td:eq(1)").text().trim();
  const firstName = row.find("td:eq(2)").text().trim();
  const lastName = row.find("td:eq(3)").text().trim();
  const programCode = row.find("td:eq(4)").text().trim();
  const yearLevel = row.find("td:eq(5)").text().trim();
  const gender = row.find("td:eq(6)").text().trim();
  const programName = row.attr("data-program-name") || "N/A";
  const collegeCode = row.attr("data-college-code") || "N/A";
  const collegeName = row.attr("data-college-name") || "N/A";

  $("#viewStudentId").text(idNumber);
  $("#viewStudentFirstName").text(firstName);
  $("#viewStudentLastName").text(lastName);
  $("#viewStudentProgram").text(programCode);
  $("#viewStudentProgramFull").text(programName);
  $("#viewStudentCollegeCode").text(collegeCode);
  $("#viewStudentCollegeName").text(collegeName);
  $("#viewStudentYearLevel").text(yearLevel);
  $("#viewStudentGender").text(gender);

  $("#viewStudentImage").addClass("d-none");
  $("#viewStudentInitials").addClass("d-none").removeClass("d-flex");

  if (imageUrl) {
    $("#viewStudentImage").attr("src", imageUrl).removeClass("d-none");
  } else {
    const initials = firstName[0] + lastName[0];
    $("#viewStudentInitials")
      .text(initials)
      .removeClass("d-none")
      .addClass("d-flex");
  }
  $("#viewStudentModal").modal("show");
});


window.editors = {};

// =======================
// FORM VALIDATION
// =======================

function syncCkEditorFields() {
    if (window.editors?.["Intro"]) {
        document.getElementById("Intro").value =
            window.editors["Intro"].getData();
    }

    if (window.editors?.["Content"]) {
        document.getElementById("Content").value =
            window.editors["Content"].getData();
    }
}

function getCkEditorText(id) {
    if (window.editors?.[id]) {
        return window.editors[id].getData()
            .replace(/<[^>]*>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
    }

    let el = document.getElementById(id);
    return el ? el.value.replace(/<[^>]*>/g, "").trim() : "";
}

const EVENT_TEXTBOX_REGEX = /^[^~<>|/\\!@#]*$/;
const EVENT_EDITOR_FORBIDDEN_REGEX = /[~!^]/;
const EVENT_TEXTBOX_REGEX_MESSAGE =
    "Special characters ~ < > | / \\ ! @ # are not allowed.";
const EVENT_EDITOR_REGEX_MESSAGE =
    "Characters ~, !, and ^ are not allowed.";

function initEventFormValidation() {
    let $form = $("#eventForm");
    if (!$form.length || $form.data("validator")) {
        return;
    }

    $.validator.addMethod("ckeditorRequired", function (_value, element) {
        return getCkEditorText(element.id).length > 0;
    }, "Intro is required.");

    $.validator.addMethod("noTextboxSpecial", function (value, element) {
        if (this.optional(element)) {
            return true;
        }
        return EVENT_TEXTBOX_REGEX.test(value);
    }, EVENT_TEXTBOX_REGEX_MESSAGE);

    $.validator.addMethod("noEditorSpecial", function (_value, element) {
        let text = getCkEditorText(element.id);
        if (!text) {
            return true;
        }
        return !EVENT_EDITOR_FORBIDDEN_REGEX.test(text);
    }, EVENT_EDITOR_REGEX_MESSAGE);

    $form.validate({
        ignore: [],
        rules: {
            Title: {
                required: true,
                minlength: 2,
                maxlength: 200,
                noTextboxSpecial: true
            },
            EventTypeId: {
                required: true
            },
            EventModeId: {
                required: true
            },
            EventDate: {
                required: true
            },
            EventTime: {
                maxlength: 50,
                noTextboxSpecial: true
            },
            Speakers: {
                maxlength: 1000,
                noTextboxSpecial: true
            },
            Intro: {
                ckeditorRequired: true,
                noEditorSpecial: true
            },
            Content: {
                noEditorSpecial: true
            },
            VideoUrl: {
                url: true,
                maxlength: 500
            }
        },
        messages: {
            Title: {
                required: "Title is required.",
                minlength: "Title must be at least 2 characters.",
                maxlength: "Title cannot exceed 200 characters.",
                noTextboxSpecial: EVENT_TEXTBOX_REGEX_MESSAGE
            },
            EventTypeId: {
                required: "Event type is required."
            },
            EventModeId: {
                required: "Event mode is required."
            },
            EventDate: {
                required: "Event date is required."
            },
            EventTime: {
                maxlength: "Time cannot exceed 50 characters.",
                noTextboxSpecial: EVENT_TEXTBOX_REGEX_MESSAGE
            },
            Speakers: {
                maxlength: "Speakers cannot exceed 1000 characters.",
                noTextboxSpecial: EVENT_TEXTBOX_REGEX_MESSAGE
            },
            Intro: {
                noEditorSpecial: EVENT_EDITOR_REGEX_MESSAGE
            },
            Content: {
                noEditorSpecial: EVENT_EDITOR_REGEX_MESSAGE
            },
            VideoUrl: {
                url: "Please enter a valid video URL.",
                maxlength: "Video URL cannot exceed 500 characters."
            }
        },
        errorClass: "text-danger",
        errorElement: "span",
        highlight: function (element) {
            $(element).addClass("is-invalid");
        },
        unhighlight: function (element) {
            $(element).removeClass("is-invalid");
        }
    });
}

// =======================
// OPEN MODAL
// =======================


function openModal() {

    clearForm();

    let modal = document.getElementById('eventModal');

    // 🔥 Ensure editors initialized
    window.initCkEditors(modal);

    let $form = $("#eventForm");
    if ($form.data("validator")) {
        $form.validate().resetForm();
        $form.find(".is-invalid").removeClass("is-invalid");
    }

    new bootstrap.Modal(modal).show();
}
function getEditorData(id) {

    if (window.editors && window.editors[id]) {
        return window.editors[id].getData();
    }

    // 🔥 FALLBACK (IMPORTANT)
    let el = document.getElementById(id);
    return el ? el.value : "";
}

// =======================
// EDIT
// =======================
function edit(id) {

    fetch('/EventMaster/GetById?id=' + id)
    .then(res => res.json())
    .then(data => {

        document.getElementById("EventId").value = data.eventId || "";
        document.getElementById("Title").value = data.title || "";

      document.getElementById("EventTypeId").value =
    data.eventTypeId ? data.eventTypeId.toString() : "";

      document.getElementById("EventModeId").value =
    data.eventModeId ? data.eventModeId.toString() : "";

        document.getElementById("EventDate").value =
            data.eventDate ? data.eventDate.split('T')[0] : "";

        document.getElementById("EventTime").value = data.eventTime || "";
        document.getElementById("Speakers").value = data.speakers || "";
        document.getElementById("VideoUrl").value = data.videoUrl || "";    
        document.getElementById("FilePath").value = data.filePath || "";

        // ✅ DIRECT SET (NO WAIT)
        if (window.editors?.["Intro"])
            window.editors["Intro"].setData(data.intro || "");

        if (window.editors?.["Content"])
            window.editors["Content"].setData(data.content || "");

        new bootstrap.Modal(document.getElementById('eventModal')).show();
    });
}

// =======================
// SAVE
// function saveEvent() {

//     let model = {
//         EventId: document.getElementById("EventId").value || 0,
//         Title: document.getElementById("Title").value || "",

//         EventTypeId: document.getElementById("EventTypeId").value || null,
//         EventModeId: document.getElementById("EventModeId").value || null,

//         EventDate: document.getElementById("EventDate").value || null,
//         EventTime: document.getElementById("EventTime").value || "",

//         // ✅ DIRECT GET
//         Intro: window.editors?.["Intro"]?.getData() || "",
//         Content: window.editors?.["Content"]?.getData() || "",

//         Speakers: document.getElementById("Speakers").value || "",
//         VideoUrl: document.getElementById("VideoUrl").value || "",
//         FilePath: document.getElementById("FilePath").value || ""
//     };

//     console.log("Saving model:", model);

//     fetch('/EventMaster/Save', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(model)
//     })
//     .then(res => res.text())
//     .then(() => location.reload());
// }
// =======================
// CLEAR
// =======================


$(function () {
    initEventFormValidation();

    $("#eventForm").on("submit", function (e) {
        syncCkEditorFields();

        if (!$(this).valid()) {
            e.preventDefault();
        }
    });
});

function clearForm() {

    let eventId = document.getElementById("EventId");
    if (eventId) eventId.value = "";

    let title = document.getElementById("Title");
    if (title) title.value = "";

    let type = document.getElementById("EventTypeId");
    if (type) type.value = "";

    let mode = document.getElementById("EventModeId");
    if (mode) mode.value = "";

    let date = document.getElementById("EventDate");
    if (date) date.value = "";

    let time = document.getElementById("EventTime");
    if (time) time.value = "";

    let speakers = document.getElementById("Speakers");
    if (speakers) speakers.value = "";

    let video = document.getElementById("VideoUrl");
    if (video) video.value = "";

    let file = document.getElementById("FilePath");
    if (file) file.value = "";

    // CKEDITOR SAFE CLEAR
    if (window.editors?.["Intro"])
        window.editors["Intro"].setData("");

    if (window.editors?.["Content"])
        window.editors["Content"].setData("");
}



// =======================
// FILE UPLOAD
// =======================
document.getElementById("btnFile").addEventListener("click", function () {
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function () {

    let file = this.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert("File size must not exceed 5MB.");
        this.value = "";
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch('/EventMaster/UploadFile', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(path => {

        // 🔥 store in hidden field
        document.getElementById("FilePath").value = path;

        // 🔥 show preview
        document.getElementById("filePreview").style.display = "block";
        document.getElementById("fileLink").href = path;
    });
});

document.getElementById("removeFile").addEventListener("click", function () {

    document.getElementById("FilePath").value = "";
    document.getElementById("fileInput").value = "";

    document.getElementById("filePreview").style.display = "none";
});


function uploadFile() {

    let file = document.getElementById("FileUpload").files[0];

    let formData = new FormData();
    formData.append("file", file);

    fetch('/EventMaster/UploadFile', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(path => {
        document.getElementById("FilePath").value = path;
    });
}

// =======================
// ACTIVATE / DEACTIVATE
// =======================

function changeStatus(id, status) {

    let msg =
        status == 1
        ? "Activate this event?"
        : "Deactivate this event?";

    if (!confirm(msg))
        return;

    fetch('/EventMaster/ChangeStatus', {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify({
            id: id,
            status: status
        })
    })
    .then(res => res.text())

    .then(() => {

        location.reload();

    })

    .catch(err => {

        console.log(err);

        alert("Status update failed");

    });
}
$(function () {

    toggleRecurring();

    $("#IsRecurring").change(function () {
        toggleRecurring();
    });

    function toggleRecurring() {

        if ($("#IsRecurring").is(":checked")) {
            $("#recurringSection").show();
        }
        else {
            $("#recurringSection").hide();
        }
    }

});
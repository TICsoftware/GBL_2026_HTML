$(document).on("submit", ".search-form", function (e) {

    e.preventDefault();

    var keyword = $("#txtSearch").val().trim();

    if (keyword == "") {

        alert("Please enter search keyword.");

        $("#txtSearch").focus();

        return false;
    }

    window.location.href =
        "/search/" + encodeURIComponent(keyword);
});


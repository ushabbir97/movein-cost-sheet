$(document).ready(function () {
    var current_fs, next_fs, previous_fs; // fieldsets
    var opacity;
    $(".next").click(function () {
        var isValid = true;
        var inputs = $(this).parent().find("input[type='number']");
        inputs.each(function () {
            if ($(this).val().trim() === "") {
                $(this).addClass("invalid");
                $(this).siblings(".error-message").text("This field is required");
                isValid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).siblings(".error-message").text("");
            }
        });

        if (isValid) {
            current_fs = $(this).parent();
            next_fs = $(this).parent().next();

            // Add Class Active
            $("#progressbar li:eq(1)").eq($("fieldset").index(next_fs)).addClass("active");
            $("#progressbar li:eq(0)").removeClass("active");

            // Show the next fieldset
            next_fs.show().css({
                'opacity': 1
            });

            // Hide the current fieldset
            current_fs.hide();
        }
    });

    $(".previous").click(function () {
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        // Remove class active
        $("#progressbar li:eq(1)").eq($("fieldset").index(current_fs)).removeClass("active");
        $("#progressbar li:eq(0)").addClass("active");

        // Show the previous fieldset
        previous_fs.show().css({
            'opacity': 1
        });

        // Hide the current fieldset
        current_fs.hide();
    });

    $(".next2").click(function () {
        var isValid = true;
        var inputs = $(this).parent().find("input[type='text'], input[type='number'],input[type='date']");
        inputs.each(function () {
            if ($(this).val().trim() === "") {
                $(this).addClass("invalid");
                $(this).siblings(".error-message").text("This field is required");
                isValid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).siblings(".error-message").text("");
            }
        });
        if (isValid) {
            current_fs = $(this).parent();
            next_fs = $(this).parent().next();

            // Add Class Active
            $("#progressbar li:eq(1)").eq($("fieldset").index(next_fs)).removeClass("active");
            $("#progressbar li:eq(2)").addClass("active");

            // Show the next fieldset
            next_fs.show().css({
                'opacity': 1
            });

            // Hide the current fieldset
            current_fs.hide();
            updateProgressLine();
        }
    });

    $(".previous2").click(function () {
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        // Remove class active
        $("#progressbar li:eq(0)").eq($("fieldset").index(previous_fs)).removeClass("active");
        $("#progressbar li:eq(1)").addClass("active");
        $("#progressbar li:eq(2)").removeClass("active");

        // Show the previous fieldset
        previous_fs.show().css({
            'opacity': 1
        });

        // Hide the current fieldset
        current_fs.hide();
    });

    $('.radio-group .radio').click(function () {
        $(this).parent().find('.radio').removeClass('selected');
        $(this).addClass('selected');
    });

    $(".submit").click(function () {
        var isValid = true;
        var inputs = $(this).parent().find("input[type='text'], input[type='number']");
        inputs.each(function () {
            if ($(this).val().trim() === "") {
                $(this).addClass("invalid");
                $(this).siblings(".error-message").text("This field is required");
                isValid = false;
            } else {
                $(this).removeClass("invalid");
                $(this).siblings(".error-message").text("");
            }
        });
        if (isValid) {
            // Handle form submission
            $("#invoiceForm").submit();
        }
    });

    // Function to show the current form step
    function showFormStep(stepIndex) {
        var formSteps = document.getElementsByClassName("form-card");
        for (var i = 0; i < formSteps.length; i++) {
            formSteps[i].style.display = "none";
        }
        formSteps[stepIndex].style.display = "block";
    }

    // Function to navigate to the next form step
    function nextFormStep() {
        var currentStep = document.querySelector(".form-card.active");
        var currentStepIndex = Array.prototype.indexOf.call(currentStep.parentNode.children, currentStep);
        showFormStep(currentStepIndex + 1);
        updateProgressBar(currentStepIndex + 1);
    }

    // Function to navigate to the previous form step
    function previousFormStep() {
        var currentStep = document.getElementsByClassName("form-card-tenant active")[0];
        var currentStepIndex = Array.prototype.indexOf.call(currentStep.parentNode.children, currentStep);
        showFormStep(currentStepIndex - 1);
        updateProgressBar(currentStepIndex - 1);
    }

    // Function to update the progress bar
    function updateProgressBar(stepIndex) {
        var progressSteps = document.getElementById("progressbar").getElementsByTagName("li");
        for (var i = 0; i < progressSteps.length; i++) {
            if (i < stepIndex) {
                progressSteps[i].className = "active";
            } else if (i === stepIndex) {
                progressSteps[i].className = "active current";
            } else {
                progressSteps[i].className = "";
            }
        }
    }

    showFormStep(0);

    document.getElementById("nextBtn1").addEventListener("click", nextFormStep);
    document.getElementById("prevBtn1").addEventListener("click", previousFormStep);
    document.getElementById("nextBtn2").addEventListener("click", nextFormStep);
    document.getElementById("prevBtn2").addEventListener("click", previousFormStep);

    let dropdownData;

    $.getJSON("/get_form_data", function (data) {
        dropdownData = data;
        populateDropdown("#community", dropdownData.communities);
        populateDropdown("#concession", dropdownData.concessions);
    });

    $("#community").change(function () {
        var community = $(this).val();
        // Call the new API and populate additional fields
        $.ajax({
            url: "/get_fee_params",
            type: "GET",
            data: {
                community: community
            },
            success: function (response) {
                // Update fields based on the response from the API
                $("#pet-deposit").val(response.pet_deposit);
                $("#pet-fee").val(response.pet_fee);
                $("#app-fee").val(response.app_fee);
                $("#admin-fee").val(response.admin_fee);
                $("#monthly-pet-fee").val(response.pet_fee_monthly);
                $("#media-automation").val(response.media_fee);
                $("#garage").val(response.garage_fee);
                $("#carport").val(response.carport_fee);
                $("#storage").val(response.storage_fee);
                $("#others").val(response.other_fee);
                $("#monthly-concession").val(response.monthly_concessions);
                $("#security-deposit").val(response.security_deposit);
                $("#monthly-rent").val(response.monthly_rent);
                $("#smart-home-program").val(response.smart_home_buyer_program);
                $("#insurance-waiver").val(response.insurance_waiver);
                $("#one-time-con").val(response.one_time_con);
                $("#internet-util").val(response.internet_util);
                $("#internet_contact").val(response.internet_contact);
                // ...
            },
            error: function (xhr, status, error) {
                console.log("Error calling new API:", error);
            }
        });

        populateDropdown("#address", dropdownData.addresses[community] || []);
        populateDropdown("#provider", dropdownData.providers[community] || []);

        if (dropdownData.addresses[community].length === 0) {
            $("#address").hide();
            $("#address_label").hide();
        } else {
            $("#address").show();
            $("#address_label").show();
        }

        if (dropdownData.providers[community].length === 0) {
            $("#provider").hide();
            $("#provider_label").hide();
        } else {
            $("#provider").show();
            $("#provider_label").show();
        }

        // Populate the apart-number dropdown based on the selected address
        var selectedAddress = $("#address").val();
        populateDropdown("#apt-number", dropdownData.apart_number[selectedAddress] || []);

    });

    $("#address").change(function () {
        // Populate the apart-number dropdown based on the selected address
        var selectedAddress = $(this).val();
        populateDropdown("#apt-number", dropdownData.apart_number[selectedAddress] || []);
    });

    function populateDropdown(selector, options) {
        var $dropdown = $(selector);
        $dropdown.empty();
        $dropdown.append($("<option />").val("").text("--Select--"));
        $.each(options, function () {
            $dropdown.append($("<option />").val(this).text(this));
        });
    }
});
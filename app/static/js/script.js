$(document).ready(function () {
    $('.select2-dropdown').select2({
        tags: true,
        allowClear: true,
        width: '100%',
        placeholder: '--Select--',
        createTag: function (params) {
            return null;
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        templateResult: function (result) {
            if (result.loading) {
                return 'Searching...';
            }
            return result.text;
        },
        language: {
            noResults: function () {
                return 'No results found';
            }
        }
    }).on('change', function (e) {
        var selectedText = e.target.value;
        var renderedElement = $(this).next('.select2').find('.select2-selection__rendered');

        renderedElement.html(selectedText);

        var containerWidth = $(this).next('.select2').width(); // Get the width of the container
        var selectedTextWidth = renderedElement.outerWidth(); // Get the width of the rendered element

        // Adjust the width of the rendered element if it exceeds the available space
        if (selectedTextWidth > containerWidth) {
            var availableWidth = containerWidth - 10; // Adjusting for padding and margin
            renderedElement.width(availableWidth);
        }

        renderedElement.css({
            'overflow': 'hidden',
            'text-overflow': 'ellipsis',
            'position': 'absolute',
            'top': '0.5',
            'bottom': '0',
            'left': '0',
            'right': '0',
            'color': 'black',
            'font-size': '14px',
        });
    });

    var current_fs, next_fs, previous_fs; // fieldsets
    var opacity;
    $(".next").click(function() {
        var isValid = true;
        var inputs = $(this).parent().find("input[type='text'], input[type='number'], input[type='date']");
        var selectInputs = $(this).parent().find("select");
      
        inputs.each(function() {
          if ($(this).val().trim() === "") {
            $(this).addClass("invalid");
            $(this).siblings(".error-message").text("This field is required");
            isValid = false;
          } else {
            $(this).removeClass("invalid");
            $(this).siblings(".error-message").text("");
          }
      
          // Remove "invalid" class on input focus
          $(this).on("focus", function() {
            $(this).removeClass("invalid");
            $(this).siblings(".error-message").text("");
          });
        });
      
        selectInputs.each(function() {
          var $select = $(this);
      
          if ($select.val() === "") {
            $select.parents('.form-group').addClass('is-invalid');
            isValid = false;
          } else {
            $select.parents('.form-group').removeClass('is-invalid');
          }
      
          // Remove "is-invalid" class on select change
          $select.on("change", function() {
            $select.parents('.form-group').removeClass('is-invalid');
          });
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

    $(".previous2").click(function () {
        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        // Remove class active
        $("#progressbar li:eq(1)").eq($("fieldset").index(previous_fs)).removeClass("active");
        $("#progressbar li:eq(0)").addClass("active");
        // $("#progressbar li:eq(2)").removeClass("active");

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
    if (currentStep) {
        var currentStepIndex = Array.prototype.indexOf.call(currentStep.parentNode.children, currentStep);
        showFormStep(currentStepIndex + 1);
        updateProgressBar(currentStepIndex + 1);
    }
}

// Function to navigate to the previous form step
function previousFormStep() {
    var currentStep = document.querySelector(".form-card.active");
    if (currentStep) {
        var currentStepIndex = Array.prototype.indexOf.call(currentStep.parentNode.children, currentStep);
        showFormStep(currentStepIndex - 1);
        updateProgressBar(currentStepIndex - 1);
    }
}

// Function to update the progress bar
function updateProgressBar(stepIndex) {
    var progressSteps = document.getElementById("progressbar").getElementsByTagName("li");
    for (var i = 0; i < progressSteps.length; i++) {
        if (i < stepIndex) {
            progressSteps[i].classList.add("active");
        } else if (i === stepIndex) {
            progressSteps[i].classList.add("active", "current");
        } else {
            progressSteps[i].classList.remove("active", "current");
        }
    }
}

showFormStep(0);

document.getElementById("nextBtn1").addEventListener("click", nextFormStep);
document.getElementById("prevBtn2").addEventListener("click", previousFormStep);

    let communityDropdownData;
    let initialLoad = true;

    function loadData() {
        // Show the page loader only on the initial load
        if (initialLoad) {
            showPageLoader();
        }

        $.getJSON("/get_form_data", function (data) {
            communityDropdownData = data;
            // Sort the dropdown options alphabetically
            if (communityDropdownData) {
                communityDropdownData.sort(function(a, b) {
                    return a.Name.localeCompare(b.Name);
                });
            }
            populateCommunitiesDropdown("#community", communityDropdownData);
        }).done(function () {
            // Hide the page loader only on the initial load
            if (initialLoad) {
                hidePageLoader();
                initialLoad = false;
            }
        }).fail(function () {
            console.log("Error loading dropdown options");
            // Hide the page loader only on the initial load
            if (initialLoad) {
                hidePageLoader();
                initialLoad = false;
            }
        });
    }

    // Function to show the page loader
    function showPageLoader() {
        $("#page-loader").show();
    }

    // Function to hide the page loader
    function hidePageLoader() {
        $("#page-loader").hide();
    }

    // Load dropdown options on page load
    $(document).ready(function () {
        clearFields();
        loadData();
    });

    var selectedPropertyID = null;
    $("#community").change(function () {
        selectedPropertyID = $(this).find(":selected").data("property-id");
        // Only make the API request and show the loader if it's not the initial load
        if (!initialLoad) {
            // Call the new API and populate additional fields
            showPageLoader();

            $.ajax({
                url: "/get_fee_params",
                type: "GET",
                data: {
                    propertyId: selectedPropertyID
                },
                success: function (response) {
                    hidePageLoader();
                    fee_params = response.fee_params
                    // Sort the dropdown options alphabetically
                    if (response.units) {
                        response.units.sort(function(a, b) {
                            return a.UnitNumber.localeCompare(b.UnitNumber);
                        });
                    }
                    populateUnitsDropdown("#unit-number", response.units || []);

                    // Set default values to zero for specific fields
                    var fieldsWithDefaultZero = [
                        "security_deposit",
                        "smart_home_buyer_program",
                        "insurance_waiver",
                        "monthly_concession",
                        "monthly_rent",
                        "one_time_con",
                        "pet_deposit",
                        "pet_fee",
                        "app_fee",
                        "admin_fee",
                        "pet_fee_monthly",
                        "media_fee",
                        "garage_fee",
                        "carport_fee",
                        "storage_fee",
                        "other_fee",
                        // Add other fields here
                    ];
                    fieldsWithDefaultZero.forEach(function (field) {
                        if (fee_params[field] === undefined) {
                            fee_params[field] = "0";
                        }
                    });
                    
                    // Update fields based on the response from the API
                    $("#pet-deposit").val(fee_params.pet_deposit);
                    $("#pet-fee").val(fee_params.pet_fee);
                    $("#app-fee").val(fee_params.app_fee);
                    $("#admin-fee").val(fee_params.admin_fee);
                    $("#monthly-pet-fee").val(fee_params.pet_fee_monthly);
                    $("#media-automation").val(fee_params.media_fee);
                    $("#garage").val(fee_params.garage_fee);
                    $("#carport").val(fee_params.carport_fee);
                    $("#storage").val(fee_params.storage_fee);
                    $("#others").val(fee_params.other_fee);
                    $("#monthly-concession").val(fee_params.monthly_concession);
                    $("#security-deposit").val(fee_params.security_deposit);
                    $("#monthly-rent").val(fee_params.monthly_rent);
                    $("#smart-home-program").val(fee_params.smart_home_buyer_program);
                    $("#insurance-waiver").val(fee_params.insurance_waiver);
                    $("#one-time-con").val(fee_params.one_time_con);
                    $("#internet-util").val(fee_params.internet_util);
                    $("#internet_contact").val(fee_params.internet_contact);
                    $("#power_util").val(fee_params.power_util);
                    $("#power_util_contact").val(fee_params.power_util_contact);
                    $("#gas_util").val(fee_params.gas_util);
                    $("#gas_util_contact").val(fee_params.gas_util_contact);
                    $("#packages_util").val(fee_params.packages_util);
                    $("#packages_contact").val(fee_params.packages_contact);
                    // ...
                },
                
                error: function (xhr, status, error) {
                    console.log("Error calling get_fee_params API:", error);
                },
            });
        }

    });
    $("#unit-number").change(function () {
        var selectedUnit = $(this).find(":selected").data("unit-object");
        // Update hidden input fields with city, state, and zip data when a community is selected
        $("#address-hidden").val(selectedUnit.StreetAddress || '');
        $("#city-hidden").val(selectedUnit.City || '');
        $("#state-hidden").val(selectedUnit.State || '');
        $("#zip-hidden").val(selectedUnit.Zip || '');

        showPageLoader();

        $.ajax({
            url: "/get_monthly_rent",
            type: "GET",
            data: {
                unitNumber: selectedUnit.UnitNumber,
                propertyId: selectedPropertyID
            }, 
            success: function (response) {
                hidePageLoader();
                $("#monthly-rent").val(response.monthly_rent);
            },
            
            error: function (xhr, status, error) {
                console.log("Error calling get_monthly_rent API:", error);
            },
        });

    });

    function populateCommunitiesDropdown(selector, options) {
        var $dropdown = $(selector);
        $dropdown.empty();
        $dropdown.append($("<option />").val("").text("--Select--"));
        $.each(options, function () {
            $dropdown.append($("<option />").attr("data-property-id", this.PropertyID).text(this.Name));
        });
    }
    function populateUnitsDropdown(selector, options) {
        var $dropdown = $(selector);
        $dropdown.empty();
        $dropdown.append($("<option />").val("").text("--Select--"));
        
        $.each(options, function () {
            var optionValue = JSON.stringify({
                UnitID: this.UnitID,
                UnitNumber: this.UnitNumber,
                StreetAddress: this.StreetAddress,
                City: this.City,
                State: this.State,
                Zip: this.Zip
            });
            $dropdown.append($("<option />").attr("data-unit-object", optionValue).text(this.UnitNumber));
        });
    }
});

// Function to clear the field values
function clearFields() {
    $("#pet-deposit").val("");
    $("#pet-fee").val("");
    $("#app-fee").val("");
    $("#admin-fee").val("");
    $("#monthly-pet-fee").val("");
    $("#media-automation").val("");
    $("#garage").val("");
    $("#carport").val("");
    $("#storage").val("");
    $("#others").val("");
    $("#monthly-concession").val("");
    $("#security-deposit").val("");
    $("#monthly-rent").val("");
    $("#smart-home-program").val("");
    $("#insurance-waiver").val("");
    $("#one-time-con").val("");
    $("#internet-util").val("");
    $("#internet_contact").val("");
    $("#tenant-name").val("");
    $("#move-in-date").val("");
    // ... Clear other fields here
}

function goBack() {
    if (history.state && history.state.fromDownload) {
        history.go(-3);  // Navigate back two steps if coming from download
    } else {
        history.back();  // Navigate back one step otherwise
    }
}


if (sessionStorage.getItem('form_data')) {
    const formData = JSON.parse(sessionStorage.getItem('form_data'));
    const formElement = document.getElementById('invoiceForm');
    for (let key in formData) {
        if (formData.hasOwnProperty(key)) {
            const inputElement = document.createElement('input');
            inputElement.type = 'hidden';
            inputElement.name = key;
            inputElement.value = formData[key];
            formElement.appendChild(inputElement);
        }
    }
    sessionStorage.removeItem('form_data');
    formElement.submit();
}


// Store form data in session storage before navigating away from the page
window.onbeforeunload = function() {
    const formElement = document.getElementById('invoiceForm');
    const formData = new FormData(formElement);
    sessionStorage.setItem('form_data', JSON.stringify(Object.fromEntries(formData.entries())));
};
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

    let dropdownData;
    let initialLoad = true;

    function loadData() {
        // Show the page loader only on the initial load
        if (initialLoad) {
            showPageLoader();
        }

        $.getJSON("/get_form_data", function (data) {
            dropdownData = data;
            // Sort the dropdown options alphabetically
            if (dropdownData.communities) {
                dropdownData.communities.sort(function(a, b) {
                    return a.localeCompare(b);
                });
            }
            populateDropdown("#community", dropdownData.communities);
        }).done(function () {
            // Example: Populate the address dropdown based on the selected community
            var selectedCommunity = $("#community").val();
            populateDropdown("#apt-number", dropdownData.apart_number[selectedCommunity] || []);
            populateDropdown("#city", dropdownData.city[selectedCommunity] || []);
            populateDropdown("#state", dropdownData.state[selectedCommunity] || []);
            populateDropdown("#zip", dropdownData.zip[selectedCommunity] || []);

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


    $("#community").change(function () {
        var community = $(this).val();
          // Update hidden input fields with city, state, and zip data when a community is selected
          $("#city-hidden").val(dropdownData.city[community] || '');
          $("#state-hidden").val(dropdownData.state[community] || '');
          $("#zip-hidden").val(dropdownData.zip[community] || '');

        // Only make the API request and show the loader if it's not the initial load
        if (!initialLoad) {
            // Call the new API and populate additional fields
            $.ajax({
                url: "/get_fee_params",
                type: "GET",
                data: {
                    community: community
                }, 
                success: function (response) {
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
                        if (response[field] === undefined) {
                            response[field] = "0";
                        }
                    });

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
                    $("#monthly-concession").val(response.monthly_concession);
                    $("#security-deposit").val(response.security_deposit);
                    $("#monthly-rent").val(response.monthly_rent);
                    $("#smart-home-program").val(response.smart_home_buyer_program);
                    $("#insurance-waiver").val(response.insurance_waiver);
                    $("#one-time-con").val(response.one_time_con);
                    $("#internet-util").val(response.internet_util);
                    $("#internet_contact").val(response.internet_contact);
                    $("#power_util").val(response.power_util);
                    $("#power_util_contact").val(response.power_util_contact);
                    $("#gas_util").val(response.gas_util);
                    $("#gas_util_contact").val(response.gas_util_contact);
                    $("#packages_util").val(response.packages_util);
                    $("#packages_contact").val(response.packages_contact);
                    // ...
                },
                
                error: function (xhr, status, error) {
                    console.log("Error calling new API:", error);
                },
            });
        }
        // Sort the dropdown options alphabetically
        if (dropdownData.apart_number[community]) {
            dropdownData.apart_number[community].sort(function(a, b) {
                return a.localeCompare(b);
            });
        }
        populateDropdown("#apt-number", dropdownData.apart_number[community] || []);

    });
    $("#apt-number").change(function () {
        // Get the selected community and unit_number (apt-number)
        var selectedCommunity = $("#community").val();
        var selectedApartment = $(this).val();
    
        // Get the addresses associated with the selected community and unit_number
        var addresses = dropdownData.addresses[`${selectedCommunity}_${selectedApartment}`] || [];
        
        $("#address-hidden").val(addresses);

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
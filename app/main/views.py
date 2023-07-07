from flask import jsonify, render_template, request
from . import bp
from ..services.calculations import calculate_totals, format_dates
from ..services.dropdown import load_dropdown_options, load_fee_params
import locale

@bp.route("/")
def index():
    """Renders the index page."""
    return render_template("index.html")


@bp.route("/invoice", methods=["POST"])
def invoice():
    """
    Process the invoice form and render the invoice page.

    This endpoint receives form data, calculates total values, formats dates,
    and renders the invoice page with this processed data.
    """
    form_data = request.form.to_dict()

    # Get the values from the form data
    fields = [
        "monthly_rent",
        "media_automation",
        "others",
        "garage",
        "carport",
        "storage",
        "monthly_pet_fee",
        "insurance_waiver",
    ]

    # Calculate the total due upon move-in
    total_due_fields = [
        "security_deposit",
        "pet_deposit",
        "pet_fee",
        "smart_home_buyer_program",
        "total_monthly_rent",
    ]

    form_data = calculate_totals(form_data, fields, total_due_fields)
    form_data = format_dates(form_data)
    locale.setlocale(locale.LC_ALL, "en_US")
    fields_to_format = [
        "admin_fee",
        "app_fee",
        "security_deposit",
        "pet_deposit",
        "pet_fee",
        "smart_home_buyer_program",
        "total_monthly_rent",
        "total_due",
        "monthly_rent",
        "media_automation",
        "others",
        "garage",
        "carport",
        "monthly_pet_fee",
        "storage",
        "insurance_waiver",
        "monthly_concession",
        "one_time_con",
    ]

    for field in fields_to_format:
        form_data[field] = locale.format("%d", float(form_data[field]), grouping=True)

    return render_template("invoice.html", **form_data)


@bp.route("/get_form_data", methods=["GET"])
def get_form_data():
    """
    Retrieves data for form dropdown options.

    This endpoint loads dropdown options from database and returns them in a
    JSON response.
    """
    dropdown_options = load_dropdown_options()
    return jsonify(dropdown_options)


@bp.route("/get_fee_params", methods=["GET"])
def get_fee_params():
    """
    Retrieves fee parameters for a given community.

    Returns:
        dict: A dictionary containing fee parameters.
    """
    community = request.args.get("community")
    fee_params = load_fee_params(community)

    if fee_params is not None:
        return fee_params
    else:
        return {"error": "Data not found"}

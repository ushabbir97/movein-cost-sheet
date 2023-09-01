import locale
import json
import weasyprint
import os
from . import bp
from ..services.calculations import prorate_rent, format_dates
from ..services.property_service import (
    load_properties,
    get_market_rent,
    load_units,
    load_fee_params,
    load_util_params,
)
from app.services.azure_storage import AzureBlob
from flask import jsonify, render_template, make_response, request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime as dt


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

    form_data = prorate_rent(form_data, fields, total_due_fields)
    form_data = format_dates(form_data)
    locale.setlocale(locale.LC_ALL, "en_US.UTF-8")
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
    return render_template("invoice.html", form_data=form_data)


@bp.route("/get_form_data", methods=["GET"])
def get_form_data():
    """
    Retrieves data for form dropdown options.

    This endpoint loads dropdown options from database and returns them in a
    JSON response.
    """
    properties = load_properties()
    return jsonify(properties)


@bp.route("/get_fee_params", methods=["GET"])
def get_fee_params():
    """
    Retrieves fee parameters for a given community.

    Returns:
        dict: A dictionary containing fee parameters.
    """
    property_id = request.args.get("propertyId")
    # Create a ThreadPoolExecutor with 3 threads to run both functions in parallel
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Submit the functions to the executor to run in parallel
        property_fee_params = executor.submit(load_fee_params, property_id)
        property_util_params = executor.submit(load_util_params, property_id)
        property_units = executor.submit(load_units, property_id)

        # Wait for both functions to complete and get their results
        fee_params = property_fee_params.result()
        util_params = property_util_params.result()
        units = property_units.result()

    data = {
        "util_params": util_params if util_params is not None else {"error": "Util params not found"},
        "fee_params": fee_params if fee_params is not None else {"error": "Fee params not found"},
        "units": units if units is not None else {"error": "Units not found"},
    }
    print(">>>>>>>>>>>>>>>>>>>>>>>")
    print(data)
    return data


@bp.route("/get_monthly_rent", methods=["GET"])
def get_monthly_rent():
    """
    Retrieves monthly rent for a given property and unit number.

    Returns:
        dict: A dictionary containing market rent for a property.
    """
    property_id = request.args.get("propertyId")
    unit_number = request.args.get("unitNumber")

    market_rent = get_market_rent(property_id, unit_number)
    data = {"monthly_rent": market_rent}

    return data


@bp.route("/invoice_pdf", methods=["POST"])
def invoice_pdf():
    """
    Generate and download a PDF invoice based on form data.

    Returns:
        Response: Flask response with the PDF data as an attachment.
    """

    form_data = request.form.to_dict().get("form_data")
    form_data = form_data.replace("'", '"')
    form_data = json.loads(form_data)

    rendered_html = render_template("invoice_pdf.html", form_data=form_data)
    html = weasyprint.HTML(string=rendered_html, base_url=request.host_url)
    pdf = html.write_pdf()
    filename = f"{form_data['tenant_name']} {form_data['unit_number']} cost sheet.pdf"

    response = make_response(pdf)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = f"attachment; filename={filename}"

    return response

#
# @bp.route("/invoice_pdf", methods=["POST"])
# def invoice_pdf():
#     """
#     Generate and download a PDF invoice based on form data and also
#     upload the generated PDF and JSON file to Azure Blob Storage.
#
#     Returns:
#         Response: Flask response with the PDF data as an attachment.
#     """
#     form_data = json.loads(request.form.get("form_data").replace("'", '"'))
#
#     # Save form data as JSON file
#     _move_in_date = dt.strptime(form_data["move_in_date"], "%m/%d/%Y")
#     move_in_date = _move_in_date.strftime("%Y-%m-%d")
#     blob_file_name = f"{form_data['tenant_name']} {form_data['unit_number']} Cost Sheet {move_in_date}"
#     json_file_name = f"{blob_file_name}.json"
#     json_file_content = json.dumps(form_data).encode()
#
#     rendered_html = render_template("invoice_pdf.html", form_data=form_data)
#     html = weasyprint.HTML(string=rendered_html, base_url=request.host_url)
#     pdf = html.write_pdf()
#
#     # Set the PDF filename for download
#     pdf_file_name = f"{blob_file_name}.pdf"
#     pdf_file_content = pdf
#
#     BLOB_CONNECTION_STRING = os.environ.get("BLOB_CONNECTION_STRING")
#     BLOB_CONTAINER_NAME = os.environ.get("BLOB_CONTAINER_NAME")
#
#     # Upload the JSON and PDF files to Azure Blob Storage
#     azure_blob = AzureBlob(BLOB_CONNECTION_STRING, BLOB_CONTAINER_NAME)
#     azure_blob.upload_file(json_file_content, json_file_name, "application/json")
#     azure_blob.upload_file(pdf_file_content, pdf_file_name, "application/pdf")
#
#     # Check if the files were uploaded successfully
#     json_file_exists = azure_blob.container_client.get_blob_client(
#         json_file_name
#     ).exists()
#     pdf_file_exists = azure_blob.container_client.get_blob_client(
#         pdf_file_name
#     ).exists()
#
#     if json_file_exists and pdf_file_exists:
#         # Both files were uploaded successfully
#         download_file_name = (
#             f"{form_data['tenant_name']} {form_data['unit_number']} Cost Sheet.pdf"
#         )
#         response = make_response(pdf)
#         response.headers["Content-Type"] = "application/pdf"
#         response.headers[
#             "Content-Disposition"
#         ] = f"attachment; filename={download_file_name}"
#         return response
#     else:
#         return "Failed to upload files to Blob Storage.", 500

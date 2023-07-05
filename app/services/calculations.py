import datetime
import calendar
from dateutil.relativedelta import relativedelta


def calculate_totals(form_data, fields, total_due_fields):
    """
    This function calculates the total monthly rent and the total due based on the form data.

    :param form_data: Dict of form data received from the user.
    :param fields: List of field names to calculate total monthly rent.
    :param total_due_fields: List of field names to calculate total due.
    :return: form_data updated with total_monthly_rent and total_due.
    """

    total_monthly_rent = sum(int(form_data.get(field, 0)) for field in fields)
    monthly_concession = int(form_data.get("monthly_concession", 0))
    total_monthly_rent -= monthly_concession
    form_data["total_monthly_rent"] = total_monthly_rent

    total_due = sum(int(form_data.get(field, 0)) for field in total_due_fields)
    form_data["total_due"] = total_due

    return form_data


def format_dates(form_data):
    """
    This function formats and calculates the dates based on the form data.
    It updates the move-in date format, calculates the lease end date, and formats the start and end dates.

    :param form_data: Dict of form data received from the user.
    :return: form_data updated with the formatted dates.
    """

    move_in_date = datetime.datetime.strptime(form_data["move_in_date"], "%Y-%m-%d")
    form_data["move_in_date"] = move_in_date.strftime("%m/%d/%Y")

    # Calculate end_date as the last day of the move_in_date month
    end_date = move_in_date.replace(
        day=calendar.monthrange(move_in_date.year, move_in_date.month)[1]
    )

    # Get the lease_term from form data and calculate lease_end_date
    lease_term = int(form_data.get("lease_term") or 0)
    lease_end_date = move_in_date + relativedelta(months=lease_term)

    # Set lease_end_date as the last day of the lease_end_date month
    lease_end_date = lease_end_date.replace(
        day=calendar.monthrange(lease_end_date.year, lease_end_date.month)[1]
    )

    form_data["start_date"] = move_in_date.strftime("%m/%d")
    form_data["end_date_rent_from"] = end_date.strftime("%m/%d")
    form_data["end_date_lease_end"] = lease_end_date.strftime("%m/%d/%Y")

    return form_data

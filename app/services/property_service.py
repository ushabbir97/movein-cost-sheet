from app.services.resman_client import ResManClient
from app.services.database import Database
from datetime import datetime
import pandas as pd
import numpy as np
import math


def load_properties() -> list:
    """Queries the ResMan API for a list of properties

    Returns:
        list: A list of properties [{'PropertyID': '123', 'Name': 'Property Name'}]
    """
    client = ResManClient()
    response = client.post(path="/Account/GetProperties")
    if response.status_code == 200:
        dict_data = response.json()
    else:
        return []
    properties = [
        {"PropertyID": prop["PropertyID"], "Name": prop["Name"]}
        for prop in dict_data["Properties"]
    ]

    return properties


def load_units(property_id: str) -> list:
    """Queries the ResMan API for a list of units for a given property_id
    Returns:
        list: A list of units [{'UnitNumber': '123', 'StreetAddress': '123 Main St', 'City': 'City', 'State': 'State', 'Zip': 'Zip'}]
    """
    client = ResManClient()
    response = client.post(
        path="/Property/GetUnits", addtl_params={"PropertyID": property_id}
    )
    if response.status_code != 200:
        return []

    dict_data = response.json()
    units = [
        {
            "UnitID": unit.get("UnitID"),
            "UnitNumber": unit.get("UnitNumber"),
            "StreetAddress": unit.get("StreetAddress"),
            "City": unit.get("City"),
            "State": unit.get("State"),
            "Zip": unit.get("Zip"),
        }
        for unit in dict_data["Units"]
    ]
    return units


def get_market_rent(property_id: str, unit_number: str) -> float:
    """Queries the database for a market rent for a given unit_id
    Returns:
        float: A market rent
    """
    query = """
        SELECT market_rent
        FROM prop.get_marketing
        WHERE
            ms_property_id = :property_id
            AND unit_number = :unit_number
            AND Report_Date = (
                SELECT MAX(report_date) 
                FROM prop.get_marketing m INNER JOIN
                prop.properties p ON m.ms_property_id = p.ms_property_id INNER JOIN
                auth.clients c ON p.dv_client_id = c.client_id
                WHERE c.client_name = 'ICO' AND m.ms_property_id = :property_id
            )
    """
    try:
        with Database() as db:
            params = {"property_id": property_id, "unit_number": unit_number}
            result = db.fetch_data(query, params)
            return float(result[0][0]) if result else 0
    except Exception as e:
        print(f"Error fetching market rent: {e}")
        return 0


def load_fee_params(property_id: str) -> dict:
    """
    Loads fee parameters for a specific community from the database.

    :param property_id: The id of the community.
    :return: A dictionary with fee parameters if found, None otherwise.
    """
    query = f"SELECT * FROM prop.income_plus WHERE ms_ParentProperty_id='{property_id}';"

    try:
        with Database() as db:
            conn = db.get_engine()
            df = pd.read_sql(query, conn)

        if not df.empty:
            result = df.iloc[0].to_dict()
            # Convert non-serializable data to serializable formats
            if 'Created' in result and isinstance(result['Created'], bytes):
                result['Created'] = datetime.fromtimestamp(
                    int.from_bytes(result['Created'], byteorder='big')).strftime('%Y-%m-%d %H:%M:%S')
            # Replace NaN values with None
            for key, value in result.items():
                if isinstance(value, (float, np.float64)):
                    if math.isnan(value):
                        result[key] = None
            # print("???????????")
            # print(f"fee params data{result}")
            return result
        else:
            print("No data found")
            return None
    except Exception as e:
        print(f"Error fetching fee parameters: {e}")
        return None


def load_util_params(property_id: str) -> dict:
    """
    Loads util parameters for a specific community from the database.

    :param property_id: The id of the community.
    :return: A dictionary with utils parameters if found, None otherwise.
    """
    query = (
        f"SELECT * FROM ico.movein_cost_sheet_params WHERE property_id='{property_id}';"
    )
    try:
        with Database() as db:
            conn = db.get_engine()
            df = pd.read_sql(query, conn)

        if not df.empty:
            util_params = df.iloc[0].to_dict()
            # print(">>>>>>>>>>>>>>>")
            # print(f"util params data{util_params}")
            return util_params
        else:
            print("No data found")
            return None
    except Exception as e:
        print(f"Error fetching utils parameters: {e}")
        return None
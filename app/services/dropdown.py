from database import Database
import pandas as pd


def load_dropdown_options():
    """
    Loads dropdown options from a database.

    :return: A dictionary with dropdown options.
    """
    dropdown_options = {}
    query = "SELECT * FROM ico.movein_cost_sheet"
    with Database() as db:
        conn = db.get_engine()
        df_units = pd.read_sql(query, conn)
    if not df_units.empty:
        df_filtered = df_units.drop_duplicates(
            subset=[
                "property_name",
                "unit_number",
                "city",
                "state",
                "zip",
                "street_address",
            ]
        )

        property_city_dict = {
            property_name: df_filtered[
                (df_filtered["property_name"] == property_name)
                & (df_filtered["city"].notnull())
            ]["city"]
            .drop_duplicates()
            .tolist()
            for property_name in df_filtered["property_name"].unique()
        }
        property_state_dict = {
            property_name: df_filtered[
                (df_filtered["property_name"] == property_name)
                & (df_filtered["state"].notnull())
            ]["state"]
            .drop_duplicates()
            .tolist()
            for property_name in df_filtered["property_name"].unique()
        }
        property_zip_dict = {
            property_name: df_filtered[
                (df_filtered["property_name"] == property_name)
                & (df_filtered["zip"].notnull())
            ]["zip"]
            .drop_duplicates()
            .tolist()
            for property_name in df_filtered["property_name"].unique()
        }

        address_unit_dict = {
            property_name: df_filtered[
                (df_filtered["property_name"] == property_name)
                & (df_filtered["unit_number"].notnull())
            ]["unit_number"]
            .drop_duplicates()
            .tolist()
            for property_name in df_filtered["property_name"].unique()
        }

        # Updated property_address_dict to filter based on property_name and unit_number
        property_address_dict = {}

        for _, row in df_filtered.iterrows():
            property_name = row["property_name"]
            unit_number = row["unit_number"]
            street_address = row["street_address"]

            key = f"{property_name}_{unit_number}"

            if key not in property_address_dict:
                property_address_dict[key] = []

            if street_address not in property_address_dict[key]:
                property_address_dict[key].append(street_address)

        dropdown_options["communities"] = list(
            set(df_filtered["property_name"].tolist())
        )
        dropdown_options["addresses"] = property_address_dict
        dropdown_options["apart_number"] = address_unit_dict
        dropdown_options["city"] = property_city_dict
        dropdown_options["state"] = property_state_dict
        dropdown_options["zip"] = property_zip_dict

        return dropdown_options
    else:
        print("No data found")
        return None


def load_fee_params(community):
    """
    Loads fee parameters for a specific community from the database.

    :param community: The name of the community.
    :return: A dictionary with fee parameters if found, None otherwise.
    """
    query = (
        f"SELECT * FROM ico.movein_cost_sheet_params WHERE property_name='{community}';"
    )
    with Database() as db:
        conn = db.get_engine()
        df = pd.read_sql(query, conn)
    if not df.empty:
        fee_params = df.iloc[0].to_dict()
        return fee_params
    else:
        print("No data found")
        return None

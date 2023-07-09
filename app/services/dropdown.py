from database import Database
import pandas as pd


def load_dropdown_options():
    """
    Loads dropdown options from a database.

    :return: A dictionary with dropdown options.
    """
    dropdown_options = {}
    units_query = "SELECT * FROM ico.movein_cost_sheet"
    communities_query = "SELECT DISTINCT property_name FROM ico.movein_cost_sheet"
    
    with Database() as db:
        conn = db.get_engine()
        df_units = pd.read_sql(units_query, conn)
        df_communities = pd.read_sql(communities_query, conn)
    
    if not df_units.empty:
        df_filtered = df_units.drop_duplicates(
            subset=["property_name", "street_address"]
        )

        property_address_dict = {
            property_name: df_filtered[
                (df_filtered["property_name"] == property_name)
                & (df_filtered["street_address"].notnull())
            ]["street_address"]
            .drop_duplicates()
            .tolist()
            for property_name in df_filtered["property_name"].unique()
        }

        address_unit_dict = {
            street_address: df_filtered[
                (df_filtered["street_address"] == street_address)
                & (df_filtered["unit_number"].notnull())
            ]["unit_number"]
            .drop_duplicates()
            .tolist()
            for street_address in df_filtered["street_address"].unique()
            if street_address
        }

        dropdown_options['communities'] = df_communities["property_name"].tolist()
        dropdown_options['addresses'] = property_address_dict
        dropdown_options['apart_number'] = address_unit_dict

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

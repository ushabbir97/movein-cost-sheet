import json

def load_dropdown_options():
    """
    Loads dropdown options from a JSON file.

    :return: A dictionary with dropdown options.
    :raises: IOError if there was an error reading the file.
    """
    try:
        with open("data.json", "r") as file:
            dropdown_options = json.load(file)
            return dropdown_options
    except IOError as e:
        print("Error reading JSON file:", str(e))
        raise

from . import bp
import json
from flask import jsonify, render_template, request


def load_dropdown_options():
    try:
        with open("data.json", "r") as file:
            dropdown_options = json.load(file)
            return dropdown_options
    except IOError as e:
        print("Error reading JSON file:", str(e))


@bp.route("/")
def index():
    return render_template("index.html")


@bp.route("/invoice", methods=["POST"])
def invoice():
    form_data = request.form.to_dict()
    return render_template("invoice.html", **form_data)


@bp.route("/get_form_data", methods=["GET"])
def get_form_data():
    dropdown_options = load_dropdown_options()  # Load dropdown options from JSON file
    return jsonify(dropdown_options)

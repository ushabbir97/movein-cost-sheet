# Movein Cost Sheet Project

# Introduction 
The Movein Cost Sheet project is a Flask-based web application that lets users input data through a form and generates an invoice based on that data.

# Getting Started
This section outlines instructions on setting up a local development environment.
## Installation
### Create and Activate a Virtual Environment
Navigate to the project directory (MOVEIN-COST-SHEET) and set up a virtual environment to isolate your Python environment. You can do this using the following commands:
```cd MOVEIN-COST-SHEET
python3 -m venv env
```
Next, activate the virtual environment:

- On MacOS/Linux:

```
source env/bin/activate
```
- On Windows:
```
.\env\Scripts\activate
```
### Install Requirements
While in the activated virtual environment, install the necessary packages using pip. You can do this by running the following command:
```
pip install -r requirements.txt
```
###
```
export FLASK_APP=app.py
flask run
```
On Windows, user `set` instead of `export`
```
set FLASK_APP=app.py
flask run
```

This will start the application and it will be accessible at http://localhost:5000 in your web browser.
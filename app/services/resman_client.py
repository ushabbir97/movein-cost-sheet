import requests
import os

class ResManClient:
    def __init__(self):
        self.base_url = os.getenv('BASE_URL')
        self.params = {
            'IntegrationPartnerID': os.getenv('INTEGRATION_PARTNER_ID'),
            'APIKey': os.getenv('API_KEY'),
            'AccountID': os.getenv('ACCOUNT_ID'),
        }

    def get(self, path, addtl_params=None):
        params = self.params.copy()
        if addtl_params:
            params.update(addtl_params)
        return requests.get(self.base_url + path, params=params)

    def post(self, path, addtl_params=None):
        params = self.params.copy()
        if addtl_params:
            params.update(addtl_params)
        return requests.post(self.base_url + path, data=params)

    # def put(self, path, data=None, json=None):
    #     return requests.put(self.base_url + path, data=data, json=json)

    # def delete(self, path):
    #     return requests.delete(self.base_url + path)
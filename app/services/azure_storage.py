from azure.storage.blob import (
    BlobServiceClient,
    BlobServiceClient,
    generate_blob_sas,
    BlobSasPermissions,
    ContentSettings,
)
import datetime

class AzureBlob:
    """Class for interacting with the Azure Blob Storage"""

    def __init__(self, BLOB_CONNECTION_STRING, BLOB_CONTAINER_NAME):
        self.config = BLOB_CONNECTION_STRING
        self.blob_service_client = BlobServiceClient.from_connection_string(self.config)
        self.container_name = BLOB_CONTAINER_NAME
        self.container_client = self.blob_service_client.get_container_client(
            self.container_name
        )
        self.expiry = datetime.datetime.utcnow() + datetime.timedelta(days=3650)
        self.file_name = None

    def upload_file(self, content_bytes: bytes, file_path: str, content_type: str) -> None:
        """Uploads a PDF file to the Azure Blob Storage container"""
        self.file_path = file_path
        blob_client = self.container_client.get_blob_client(self.file_path)
        blob_client.upload_blob(
            content_bytes,
            overwrite=True,
            content_settings=ContentSettings(content_type=content_type),
            # content_settings=ContentSettings(content_type="application/pdf"),
        )

    def generate_sas(self) -> str:
        """Generates a SAS token for a given file"""

        blob_client = self.container_client.get_blob_client(self.file_path)
        sas_token = generate_blob_sas(
            blob_client.account_name,
            blob_client.container_name,
            blob_client.blob_name,
            account_key=self.blob_service_client.credential.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=self.expiry,
        )
        return sas_token

    def get_url(self) -> str:
        """Returns the URL for a given file"""

        blob_client = self.container_client.get_blob_client(self.file_path)
        sas_token = self.generate_sas()
        url = blob_client.url + "?" + sas_token
        return url
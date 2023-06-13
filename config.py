class Config:
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

# Set the appropriate configuration class based on your environment
config = ProductionConfig()  # Change this for production

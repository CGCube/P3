import os
from imagekitio import ImageKit

db_config = {
    'user': 'root',
    'password': '123456',
    'host': '127.0.0.1',
    'database': 'eventnova'
}

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your_secret_key_here'
    SQLALCHEMY_DATABASE_URI = f"mysql+mysqlconnector://{db_config['user']}:{db_config['password']}@{db_config['host']}/{db_config['database']}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY') or 'sk_test_51R1BD1IEJxqImnyTdCpcU8lkJPJQcfFJiJOpJIi3S6p2u3gWM29WxNeqpEbjZmv3KiqwCA9ucctasijbGxyfrzui00vYIurdjT'

imagekit = ImageKit(
    private_key='private_llSA2qj4HPn5FKSXuBKIdZaSw/A=',
    public_key='public_XXd3A1aug1Soz3jffRJcEK4Mhaw=',
    url_endpoint='https://ik.imagekit.io/eventnova'
)
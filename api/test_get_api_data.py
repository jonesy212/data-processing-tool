import unittest

from flask.testing import FlaskClient
from flask_jwt_extended import JWTManager

from configs.config import app


class TestApiRoutes(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.client = FlaskClient(self.app.test_client())
        self.jwt = JWTManager(self.app)

    def test_get_data_api_endpoint_v1(self):
        response = self.client.get('/api/data', headers={'Accept': 'application/vnd.yourapp.v1+json'})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data, {'message': 'This is version 1 of the API'})

    def test_get_data_api_endpoint_v2(self):
        response = self.client.get('/api/data', headers={'Accept': 'application/vnd.yourapp.v2+json'})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data, {'message': 'This is version 2 of the API'})

    def test_get_data_api_invalid_version(self):
        response = self.client.get('/api/data', headers={'Accept': 'application/json'})
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data, {'message': 'Invalid API version requested'})

    def test_export_data_api_endpoint_authenticated(self):
        # Assume a valid JWT token for an authenticated user
        jwt_token = 'your_valid_jwt_token_here'
        response = self.client.get('/api/export-data', headers={'Authorization': f'Bearer {jwt_token}'})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        # Add more assertions based on your expected exported data structure

    def test_export_data_api_endpoint_unauthenticated(self):
        response = self.client.get('/api/export-data')
        data = response.get_json()
        self.assertEqual(response.status_code, 401)
        # Add more assertions based on your expected response for unauthenticated requests

    def test_export_data_api_endpoint_authenticated(self):
        # Assume the user is authenticated (provide a valid JWT token)
        with self.app.test_request_context():
            token = self.jwt.create_access_token(identity=1)
        response = self.client.get('/api/export-data', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        # Modify this assertion based on your actual exported data structure
        self.assertIn('user_id', response.json)
        self.assertIn('username', response.json)
        self.assertIn('email', response.json)

    def test_get_profile_picture_authenticated(self):
        # Assume a valid JWT token for an authenticated user
        jwt_token = 'your_valid_jwt_token_here'
        response = self.client.get('/api/user/profile-picture', headers={'Authorization': f'Bearer {jwt_token}'})
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        # Add more assertions based on your expected profile picture data

    def test_get_profile_picture_unauthenticated(self):
        response = self.client.get('/api/user/profile-picture')
        data = response.get_json()
        self.assertEqual(response.status_code, 401)
        # Add more assertions based on your expected response for unauthenticated requests

if __name__ == '__main__':
    unittest.main()

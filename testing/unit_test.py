import unit_test

from configs.config import app


class LoginSystemTest(unit_test.TestCase):

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_login_page_loads(self):
        response = self.app.get('/login')
        self.assertEqual(response.status_code, 200)
        
        
        
#         Testing User Authentication
# Test the user authentication process, including both successful and failed login attempts.

    def test_successful_login(self):
        response = self.app.post('/login', data=dict(username="user", password="password"))
        self.assertIn(b'Logged in successfully', response.data)

    def test_failed_login(self):
        response = self.app.post('/login', data=dict(username="user", password="wrongpassword"))
        self.assertIn(b'Login failed', response.data)
        
    
        
#         Testing Session Management
# Ensure sessions are managed correctly, testing that users remain logged in across different pages and are logged out properly.

    def test_user_session(self):
        self.app.post('/login', data=dict(username="user", password="password"))
        response = self.app.get('/protected')
        self.assertEqual(response.status_code, 200)

    def test_logout(self):
        self.app.post('/login', data=dict(username="user", password="password"))
        response = self.app.get('/logout')
        self.assertIn(b'Logged out', response.data)
        
        
        
        
# Running The Tests
# Finally, run the tests to validate the functionality of your login system.

# python -m unittest discover
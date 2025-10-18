
class UserController:
    def __init__(self, user_service):
        self.user_service = user_service

    def register_user(self, username, email, password):
        # Call user service to register user
        return self.user_service.register_user(username, email, password)

    def login_user(self, email, password):
        # Call user service to authenticate user
        return self.user_service.login_user(email, password)

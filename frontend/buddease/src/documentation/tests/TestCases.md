<!-- TestCases.md -->
# Test Cases

## User Registration

### Scenario 1: Successful Registration
- **Description:** Verify that a user can register successfully with valid information.
- **Steps:**
  1. Navigate to the registration page.
  2. Enter valid username, email address, and password.
  3. Click on the "Register" button.
- **Assertions:**
  - User should be redirected to the login page.
  - User data should be stored in the database.
  - Confirmation email should be sent to the registered email address.

### Scenario 2: Invalid Username
- **Description:** Verify that the system detects and handles invalid usernames during registration.
- **Steps:**
  1. Navigate to the registration page.
  2. Enter a username that is already taken or contains invalid characters.
  3. Enter valid email address and password.
  4. Click on the "Register" button.
- **Assertions:**
  - User should see an error message indicating that the username is invalid.
  - User should not be registered.

### Scenario 3: Weak Password
- **Description:** Verify that the system enforces password strength requirements during registration.
- **Steps:**
  1. Navigate to the registration page.
  2. Enter a valid username and email address.
  3. Enter a password that does not meet the minimum strength requirements.
  4. Click on the "Register" button.
- **Assertions:**
  - User should see an error message indicating that the password is weak.
  - User should not be registered.

### Scenario 4: Invalid Email Address
- **Description:** Verify that the system detects and handles invalid email addresses during registration.
- **Steps:**
  1. Navigate to the registration page.
  2. Enter a valid username and password.
  3. Enter an email address with incorrect format (e.g., missing '@' symbol).
  4. Click on the "Register" button.
- **Assertions:**
  - User should see an error message indicating that the email address is invalid.
  - User should not be registered.

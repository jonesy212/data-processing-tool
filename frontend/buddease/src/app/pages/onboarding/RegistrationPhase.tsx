// Import necessary modules and components
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { endpoints } from "@/app/api/ApiEndpoints";
import { sanitizeInput } from "@/app/components/security/SanitizationFunctions"; // Import sanitizeInput function
import { UserData } from "@/app/components/users/User";
import authService from "@/app/components/auth/AuthService";


interface RegistrationPhaseProps {
  onSuccess: (userData: UserData) => void;
}
// Define RegistrationPhase functional component
const RegistrationPhase: React.FC<RegistrationPhaseProps> = ({ onSuccess }) => {
  // Initialize state variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize API_BASE_URL
  const API_BASE_URL = endpoints.registration.registerUser;

  // Initialize history for navigation
  const history = useNavigate();

  // Define handleRegister function
  const handleRegister = async () => {
    try {
      // Check if password and confirmPassword match
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Sanitize and validate username
      const sanitizedUsername = sanitizeInput(username);
      
      // Set loading state to true
      setLoading(true);

      // Send registration request
      const registrationResponse = await axios.post(API_BASE_URL, { username: sanitizedUsername, password });

      // Handle successful registration
      if (registrationResponse.status === 201) {
        // Authenticate user after successful registration
        await authenticateUser(sanitizedUsername, password);
        await onSuccess(registrationResponse.data);
        history("/api/questionnaire-submit");
      }
    } catch (error) {
      // Handle registration error
      setError("Failed to register. Please try again later.");
    }

    // Set loading state to false
    setLoading(false);
  };

  // Function to authenticate user using authService
  const authenticateUser = async (username: string, password: string) => {
    try {
      // Call login method from authService
      await authService.login(username, password);
    } catch (error) {
      throw new Error("Authentication failed");
    }
  };

  // Render registration form
  return (
    <div>
      <h2>Sign Up</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <label>
          Confirm Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="button" onClick={handleRegister} disabled={loading}>
          {loading ? "Loading..." : "Sign Up"}
        </button>
      </form>
      <div>
        Already have an account? <Link to="/signin">Sign In</Link>
      </div>
    </div>
  );
};

// Export RegistrationPhase component
export default RegistrationPhase;

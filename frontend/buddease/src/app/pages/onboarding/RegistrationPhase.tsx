import React from 'react'
import { endpoints } from "@/app/api/ApiEndpoints";
import authService from "@/app/components/auth/AuthService";
import EmailSetupForm from "@/app/components/communications/email/EmailSetUpForm";
import { enhancedPhaseHook, setCurrentPhase } from "@/app/components/hooks/phaseHooks/EnhancePhase";
import { PhaseHookConfig } from "@/app/components/hooks/phaseHooks/PhaseHooks";
import { sanitizeInput } from "@/app/components/security/SanitizationFunctions"; // Import sanitizeInput function
import { UserData } from "@/app/components/users/User";
import axios from "axios";
import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/components/state/redux/slices/RootSlice";
import { setError, setLoading } from "@/app/components/state/stores/UISlice";
import { ProjectPhaseTypeEnum } from "@/app/components/models/data/StatusType";
import useIdleTimeout from "@/app/components/hooks/idleTimeoutHooks";

interface RegistrationPhaseProps {
  onSuccess: (userData: UserData) => void;
}

// Define RegistrationPhase functional component
const RegistrationPhase: React.FC<RegistrationPhaseProps> = ({ onSuccess }) => {
  // Initialize state variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const dispatch = useDispatch();
  const uiState = useSelector((state: RootState) => state.uiManager);

  // Initialize API_BASE_URL
  const API_BASE_URL = endpoints.registration.registerUser;

  // Initialize history for navigation
  const history = useNavigate();

  // Function to handle transitioning to the next phase
  const moveToNextPhase = async () => {
    // Define the next phase configuration
    const nextPhaseConfig: PhaseHookConfig = {
      condition: async () => true, // Define condition for the next phase
      asyncEffect: async () => {
        return () => Promise.resolve(); // Return a function that resolves the Promise
      },
      name: "NextPhase", // Name of the next phase
      duration: "0", // Duration of the next phase if needed
      startIdleTimeout: useIdleTimeout({}).startIdleTimeout,
      phaseType: ProjectPhaseTypeEnum.Register // Type of the next phase
    };

    // Check if transition to next phase is allowed
    if (await enhancedPhaseHook.canTransitionTo(nextPhaseConfig)) {
      // Transition to next phase
      enhancedPhaseHook.handleTransitionTo(nextPhaseConfig);
      setCurrentPhase(nextPhaseConfig); // Update the current phase in local state
    }
  };

  // Function to handle transitioning to the previous phase
  const moveToPreviousPhase = async () => {
    // Define the previous phase configuration
    const previousPhaseConfig: PhaseHookConfig = {
      condition: async () => true, // Define condition for the previous phase
      asyncEffect: async () => {
        return () => Promise.resolve(); // Return a function that resolves the Promise
      },
      startIdleTimeout: useIdleTimeout({}).startIdleTimeout,
      name: "PreviousPhase", // Name of the previous phase
      duration: "0", // Duration of the previous phase if needed
      phaseType: ProjectPhaseTypeEnum.Previous ,
      // Specify that this is a previous phase
    };

    // Check if transition to previous phase is allowed
    if (await enhancedPhaseHook.canTransitionTo(previousPhaseConfig)) {
      // Transition to previous phase
      enhancedPhaseHook.handleTransitionTo(previousPhaseConfig);
      setCurrentPhase(previousPhaseConfig); // Update the current phase in local state
    }
  };

  // Define handleRegister function
  const handleRegister = async () => {
    try {
      // Check if password and confirmPassword match
      if (password !== confirmPassword) {
        dispatch(setError("Passwords do not match."));
        return;
      }

      // Sanitize and validate username
      const sanitizedUsername = sanitizeInput(username);

      // Set loading state to true
      dispatch(setLoading(true));

      // Send registration request
      const registrationResponse = await axios.post(`${API_BASE_URL}`, {
        username: sanitizedUsername,
        password,
      });

      // Handle successful registration
      if (registrationResponse.status === 201) {
        // Authenticate user after successful registration
        await authenticateUser(sanitizedUsername, password);
        await onSuccess(registrationResponse.data);
        history("/api/questionnaire-submit");
      }
    } catch (error) {
      // Handle registration error
      dispatch(setError("Failed to register. Please try again later."));
    }

    // Set loading state to false
    dispatch(setLoading(false));
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
      {uiState.error && <div style={{ color: "red" }}>{uiState.error}</div>}
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
        <button type="button" onClick={handleRegister} disabled={uiState.isLoading}>
          {uiState.isLoading ? "Loading..." : "Sign Up"}
        </button>
      </form>
      {/* Pass handleRegister function as a prop to EmailSetupForm */}
      <EmailSetupForm handleRegisterEmail={handleRegister} />
  
      <div>
        Already have an account? <Link to="/signin">Sign In</Link>
      </div>
      
      <button onClick={moveToNextPhase}>Move to Next Phase</button>
      <button onClick={moveToPreviousPhase}>Move to Previous Phase</button>
    </div>
  );
}

// Export RegistrationPhase component
export default RegistrationPhase;

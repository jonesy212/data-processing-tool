// LoginForm.tsx
import authService from "@/app/components/auth/AuthService";
import { NotificationContext, NotificationTypeEnum } from "@/app/components/support/NotificationContext";
import { NOTIFICATION_TYPES } from "@/app/components/support/NotificationTypes";
import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  onSubmit: (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setUsername, setPassword }) => {
  const [username, setLocalUsername] = useState("");
  const [password, setLocalPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false); // Track if it's an admin login

  const history = useNavigate();
  const notificationContext = useContext(NotificationContext);
  const handleSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();

      if (isAdminLogin) {
        // Handle administrator login
        const { accessToken } = await authService.adminLogin(
          username,
          password
        );
        if (accessToken) {
          // Redirect to admin dashboard upon successful login
          // Replace '/admin-dashboard' with the actual route to the admin dashboard
          history("/admin-dashboard"); // Use history function for redirection
        } else {
          // Handle administrator login failure
          console.error("Admin login failed");
          // Use notify directly without checking notificationContext
          notificationContext.notify(
            "handeLoginFailure",
            NOTIFICATION_TYPES.ERROR,
            "Admin login failed",
            new Date(),
            NotificationTypeEnum.Error
          );
          // Redirect to welcome page or handle error accordingly
          history("/frontend/buddease/src/app/pages/onboarding/Welcome.tsx");
        }
      } else {
        // Handle regular user login
        const { accessToken } = await authService.login(username, password);
        if (accessToken) {
          // Retrieve the last visited page from local storage
          const lastVisitedPage = localStorage.getItem("lastVisitedPage");
          // Navigate to the last visited page or a default page if none is stored
          history(lastVisitedPage || "/default-page"); // Use history function for redirection
        } else {
          // Handle regular user login failure
          console.error("Regular user login failed");
          // Use notify directly without checking notificationContext
          notificationContext.notify(
            "handeSubmitFailure",
            NOTIFICATION_TYPES.ERROR,
            "Regular user login failed",
            new Date(),
            NotificationTypeEnum.Error
          );
          // Redirect to welcome page or handle error accordingly
          history("/frontend/buddease/src/app/pages/onboarding/Welcome.tsx");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div>
      <h1>Login form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => {
              setLocalUsername(e.target.value);
              setUsername(e.target.value);
            }}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setLocalPassword(e.target.value);
              setPassword(e.target.value);
            }}
            required
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={isAdminLogin}
            onChange={() => setIsAdminLogin(!isAdminLogin)}
          />
          Admin Login
        </label>
        <br />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginForm;

// LoginForm.tsx
import authService from "@/app/components/auth/AuthService";
import { NotificationContext } from "@/app/components/support/NotificationContext";
import React, { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ setUsername, setPassword }) => {
  const [username, setLocalUsername] = useState("");
  const [password, setLocalPassword] = useState("");
  const history = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
  
      // Use AuthService to handle login
      const { accessToken } = await authService.login(username, password);
  
      if (accessToken) {
        // Retrieve the last visited page from local storage
        const lastVisitedPage = localStorage.getItem("lastVisitedPage");
  
        // Navigate to the last visited page or a default page if none is stored
        history(lastVisitedPage || "/default-page");
      } else {
        // Error callback
        console.error("Error during login:", error);

        NotificationContext.notify("Login failed", "Error");

        history("/frontend/buddease/src/app/pages/onboarding/Welcome.tsx");
      }
    } catch (error) {
      console.log(error);
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
        <br />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginForm;

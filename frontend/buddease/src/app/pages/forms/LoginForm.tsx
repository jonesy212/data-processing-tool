// LoginForm.tsx
import React, { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onSubmit: (
    username: string,
    password: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, setUsername, setPassword }) => {
  const [username, setLocalUsername] = useState("");
  const [password, setLocalPassword] = useState("");
  const history = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      if (onSubmit) {
        await onSubmit(
          username,
          password,
          () => {
            // Success callback
            history("/frontend/buddease/src/app/pages/dashboards/Dashboard.tsx");
          },
          (error) => {
            // Error callback
            console.error(error);
            history("/frontend/buddease/src/app/pages/onboarding/Welcome.tsx");
          }
        );
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

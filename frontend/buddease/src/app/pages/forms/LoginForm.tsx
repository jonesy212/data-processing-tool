// LoginForm.tsx
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import React, { Dispatch, SetStateAction, useState } from "react";
import useHistory from "react-router-dom";

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

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [username, setLocalUsername] = useState("");
  const [password, setLocalPassword] = useState("");
  const history = useHistory()
  const handleSubmit = async (event: React.FormEvent) => {
    // Implement your login logic here
    try {
      event.preventDefault();
      await performLogin(
        username,
        password,
        () => {
          onSubmit(
            username,
            password,
            () => {
              // Success callback
              history.push("/dashboard")
            },
            () => {
              // Added default no-op error callback

            }
          );
        },
        () => {}
      );
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
            onChange={(e) => setLocalUsername(e.target.value)}
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
            onChange={(e) => setLocalPassword(e.target.value)}
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

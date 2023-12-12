// LoginForm.tsx
import { performLogin } from "@/app/pages/forms/utils/CommonLoginLogic";
import React, { Dispatch, SetStateAction, useState } from "react";

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, setUsername, setPassword }) => {
  const [username, setLocalUsername] = useState("");
  const [password, setLocalPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    // Implement your login logic here
    try {
      event.preventDefault();
      await performLogin(
        setUsername as unknown as string,
        setPassword as unknown as string,
        () => onSubmit(username, password),
        (error) => console.log(error)
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

// LoginCard.tsx
import LoginForm from "@/app/pages/forms/LoginForm";
import React, { useState } from "react";

interface LoginCardProps {
  onSubmit: (username: string, password: string) => void;
}

const LoginCard: React.FC<LoginCardProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LoginForm
      onSubmit={onSubmit}
      setUsername={setUsername}
      setPassword={setPassword}
    />
  );
};

export default LoginCard;


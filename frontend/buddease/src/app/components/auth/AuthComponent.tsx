// AuthComponent.tsx
import axios from 'axios';
import { useState } from 'react';
import dynamicHooks from '../dynamicHooks/DynamicHooks';
const AuthComponent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("/auth/login", { username, password });
      const accessToken = response.data.access_token;
      // Save the token to localStorage or a state variable
      localStorage.setItem("token", accessToken);
      // set user session variable

      // Trigger the dynamic hook activation
      dynamicHooks.authentication.hook().toggleActivation();
    } catch (error) {
      //todo: Handle error
      // Handle login error
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AuthComponent;

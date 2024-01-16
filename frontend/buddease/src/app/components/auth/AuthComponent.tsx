// AuthComponent.tsx
import axios from 'axios';
import { useState } from 'react';
import dynamicHooks from '../hooks/dynamicHooks/dynamicHooks';
const AuthComponent = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("/auth/login", { username, password });
      const accessToken = response.data.access_token;
      localStorage.setItem("token", accessToken);
  
      // Set the authorization token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
      dynamicHooks.authentication.hook().toggleActivation({
        accessToken,
      });
    } catch (error) {
      console.error(error);
    }
  };

  
  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
  
    try {
      const accessToken = localStorage.getItem('token');
  
      const response = await fetch(`/api/users/search?q=${searchQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
  
      // Rest of the code remains the same...
    } catch (error) {
      console.error("Error fetching search results", error);
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

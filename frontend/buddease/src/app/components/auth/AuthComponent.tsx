import axios from 'axios';
import { FormEvent, useState } from 'react';
import dynamicHooks from '../hooks/dynamicHooks/dynamicHooks';
import axiosInstance from '../security/csrfToken';

interface AuthComponentProps {
  onSuccess: () => void;
  onSearch: (event: React.FormEvent, searchQuery: string) => void;
}

const AuthComponent: React.FC<AuthComponentProps> = ({ onSuccess, onSearch }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); 







  const handleAdminLogin = async () => {
    try {
      // Implement administrator login using Transfer Tokens
      // Send a request to authenticate the administrator using Transfer Token instead of username/password
      
      // Example:
      const response = await axios.post("/api/admin/login", { token: transferToken });
      const accessToken = response.data.access_token;

      // Store the access token in local storage
      localStorage.setItem("adminToken", accessToken);
  
      // Set the authorization token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
      // Activate dynamic components for administrators
      dynamicHooks.authentication.hook().toggleActivation({
        accessToken,
      });
    } catch (error) {
      console.error(error);
    }
  };
  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/auth/login", { username, password });
      const accessToken = response.data.access_token;
      localStorage.setItem("token", accessToken);
  
      // Set the authorization token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
      dynamicHooks.authentication.hook().toggleActivation();
      onSuccess(); 

      // Update searchQuery state using setSearchQuery
      if (searchQuery) {
        setSearchQuery(searchQuery);
        // Call handleSearch and process the response in the try statement
        const searchResponse = await handleSearch({} as FormEvent<Element>, searchQuery);
        // Process the searchResponse here
        console.log("Search Response:", searchResponse);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (event: React.FormEvent, searchQuery: string) => {
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

      // Process the response here
      const searchResponse = await response.json();
      return searchResponse;
    } catch (error) {
      console.error("Error fetching search results", error);
      throw error;
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

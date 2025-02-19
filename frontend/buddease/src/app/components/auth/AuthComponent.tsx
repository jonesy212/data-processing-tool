import { endpoints } from '@/app/api/ApiEndpoints';
import { generateTransferToken } from '@/app/generators/GenerateTokens';
import React, { FormEvent, useState } from "react";
import { loadDashboardState } from '../dashboards/LoadDashboard';
import dynamicHooks from '../hooks/dynamicHooks/dynamicHooks';
import axiosInstance from '../security/csrfToken';

const API_BASE_URL = endpoints.auth.admin

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
      
      const transferToken = await generateTransferToken();
      const response = await axiosInstance.post(`${API_BASE_URL}`, { token: transferToken });
      const accessToken = response.data.access_token;
  
      // Store the access token in local storage
      localStorage.setItem("adminToken", accessToken);
  
      // Set the authorization token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
      // Check if toggleActivation function is available
      if (typeof dynamicHooks.authentication.hook.toggleActivation === 'function') {
        // Call toggleActivation function if available
        dynamicHooks.authentication.hook.toggleActivation(accessToken);
      } else {
        console.error("toggleActivation is not a function or not available");
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleLogin = async () => {
    try {
      // Perform login using axiosInstance or performLogin function
      const response = await axiosInstance.post("/auth/login", { username, password });
      const accessToken = response.data.access_token;
      localStorage.setItem("token", accessToken);
  
      // Set the authorization token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  
      // Toggle authentication hooks and perform other actions
      if (dynamicHooks.authentication.hook && dynamicHooks.authentication.hook.toggleActivation) {
        dynamicHooks.authentication.hook.toggleActivation(accessToken);
      }
  
      // Update searchQuery state using setSearchQuery if needed
      if (searchQuery) {
        setSearchQuery(searchQuery);
        // Call handleSearch and process the response if needed
        const searchResponse = await handleSearch({} as FormEvent<Element>, searchQuery);
        // Process the searchResponse here
        console.log("Search Response:", searchResponse);
      }
  
      // On successful login
      console.log("Login successful!");
      // Redirect or perform other actions
      loadDashboardState();
    } catch (error) {
      // On login error
      console.error("Login failed:", error);
      // Display error message to the user or perform other error-handling actions
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
      <button onClick={handleAdminLogin}>Admin Login</button>
    </div>
  );
};

export default AuthComponent;

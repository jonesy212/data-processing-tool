import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const history = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      // Perform signup logic here using Axios (e.g., send data to the server)
      const response = await axios.post('/api/signup', { username, password });

      // Assuming signup is successful (adjust the condition based on your API response)
      if (response.status === 201) {
        // Redirect to the next page based on the onboarding process
        history('/api/questionnaire-submit'); // Adjust the path as needed
      } else {
        // Handle unsuccessful signup (show an error message, etc.)
        console.error('Signup failed:', response.data.error);
      }
    } catch (error) {
      // Handle any network or unexpected errors
      console.error('An error occurred during signup:', error);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form>
        <label>
          Username:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="button" onClick={handleRegister}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;

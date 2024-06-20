// FrontendCacheInteraction.js
import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import React from 'react';

const FrontendCacheInteraction = () => {
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const [response, setResponse] = useState('');

  const updateCache = async () => {
    try {
      const response = await axiosInstance.post('http://localhost:5000/update_cache', {
        key: key,
        data: JSON.parse(data), // Assuming data is JSON
      });

      setResponse(response.data.message);
    } catch (error) {
      setResponse('Error updating cache');
    }
  };

  const getCache = async () => {
    try {
      const response = await axiosInstance.get(`http://localhost:5000/get_cache?key=${key}`);
      setResponse(JSON.stringify(response.data));
    } catch (error) {
      setResponse('Error getting cache');
    }
  };

  return (
    <div>
      <h2>Frontend Cache Interaction</h2>
      <label>
        Cache Key:
        <input type="text" value={key} onChange={(e) => setKey(e.target.value)} />
      </label>
      <br />
      <label>
        Cache Data:
        <textarea value={data} onChange={(e) => setData(e.target.value)} />
      </label>
      <br />
      <button onClick={updateCache}>Update Cache</button>
      <button onClick={getCache}>Get Cache</button>
      <div>
        <strong>Response:</strong>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default FrontendCacheInteraction;

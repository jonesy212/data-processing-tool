// CaptionManagementPage.js

import React from 'react';
import { useEffect, useState } from 'react';
import { getCaptions } from '../api/captionApi'; // Assuming you have an API function to fetch captions

const CaptionManagementPage = () => {
  const [captions, setCaptions] = useState([]);

  useEffect(() => {
    // Fetch captions when component mounts
    async function fetchCaptions() {
      try {
        const captionsData = await getCaptions();
        setCaptions(captionsData);
      } catch (error) {
        console.error('Error fetching captions:', error);
      }
    }

    fetchCaptions();

    // Cleanup function
    return () => {
      // Any cleanup code if needed
    };
  }, []);

  return (
    <div>
      <h1>Caption Management Page</h1>
      <ul>
        {captions.map((caption, index) => (
          <li key={index}>{caption.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default CaptionManagementPage;

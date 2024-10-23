// hooks/useDID.ts

import { useEffect, useState } from 'react';

const useDID = () => {
  const [userDID, setUserDID] = useState<string | null>(null);

  useEffect(() => {
    // Add logic to fetch user's DID from storage or external source
    const fetchUserDID = async () => {
      // Example: Fetch user's DID from local storage
      const storedDID = localStorage.getItem('userDID');
      setUserDID(storedDID);
    };

    fetchUserDID();

    // Cleanup function
    return () => {
      // Add cleanup logic if needed
    };
  }, []);

  return userDID;
};

export default useDID;

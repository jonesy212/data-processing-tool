import React, { useEffect } from 'react';

const TimerComponent = () => {
  useEffect(() => {
    const timerId = setInterval(() => {
      // Some periodic task
    }, 1000);

    return () => {
      // Cleanup: Clear the interval when the component unmounts
      clearInterval(timerId);
    };
  }, []); // Empty dependency array to run the effect only once on mount

  return <div>Timer Component</div>;
};

export default TimerComponent;

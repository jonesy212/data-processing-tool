const clearIntervalTimer = (timerId: NodeJS.Timeout) => {
    clearInterval(timerId);
    // Any additional cleanup logic can go here
  };
  
  export default clearIntervalTimer;
  
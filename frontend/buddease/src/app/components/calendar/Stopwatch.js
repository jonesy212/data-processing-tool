
// Stopwatch Component
const Stopwatch = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
  
    useEffect(() => {
      let interval;
  
      // Start interval when Stopwatch is running
      if (isRunning) {
        interval = setInterval(() => {
          setElapsedTime((prevTime) => prevTime + 1);
        }, 1000);
      }
  
      // Cleanup: Stop interval on component unmount or when Stopwatch is paused
      return () => clearInterval(interval);
    }, [isRunning]);
  
    // Toggle Stopwatch between running and paused
    const toggleStopwatch = () => {
      setIsRunning((prevIsRunning) => !prevIsRunning);
    };
  
    // Reset Stopwatch to zero
    const resetStopwatch = () => {
      setElapsedTime(0);
      setIsRunning(false);
    };
  
    return (
      <div>
        <div>Stopwatch: {elapsedTime} seconds</div>
        <button onClick={toggleStopwatch}>{isRunning ? 'Pause' : 'Start'}</button>
        <button onClick={resetStopwatch}>Reset</button>
      </div>
    );
  };
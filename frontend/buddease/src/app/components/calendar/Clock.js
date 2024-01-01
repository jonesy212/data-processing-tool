
// Clock Component
const Clock = () => {
    const [time, setTime] = useState(new Date());
  
    useEffect(() => {
      // Update time every second
      const interval = setInterval(() => {
        setTime(new Date());
      }, 1000);
  
      // Cleanup: Stop interval on component unmount
      return () => clearInterval(interval);
    }, []);
  
    return <div>Clock: {time.toLocaleTimeString()}</div>;
  };

  export default Clock
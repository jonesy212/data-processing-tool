// TeamCollaborationTimerComponent.tsx
import React, { useEffect, useState } from "react";

interface TeamCollaborationTimerProps {
  initialTime: number; // Initial time in seconds
}

const TeamCollaborationTimerComponent: React.FC<
  TeamCollaborationTimerProps
> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    if (isActive) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft === 0) {
            clearInterval(intervalId!);
            setIsActive(false);
            // Additional logic can be added here when the timer reaches 0
            return 0; // Ensure that a valid number is always returned
          } else {
            return prevTimeLeft - 1;
          }
        });
      }, 1000);
    } else if (intervalId) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive]);

  const toggleTimer = () => {
    setIsActive((prevIsActive) => !prevIsActive);
  };

  const resetTimer = () => {
    setTimeLeft(initialTime);
    setIsActive(false);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div>
      <h1>Team Collaboration Timer</h1>
      <p>Time Left: {formatTime(timeLeft)}</p>
      <button onClick={toggleTimer}>{isActive ? "Pause" : "Start"}</button>
      <button onClick={resetTimer}>Reset</button>
    </div>
  );
};

export default TeamCollaborationTimerComponent;

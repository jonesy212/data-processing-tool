import React from 'react';
import { AnimatedComponent, AnimatedComponentRef } from '../../libraries/animations/AnimationComponent';
import { Team } from '../../models/teams/Team';

const TeamProgressBar = ({ team }: {team: Team}) => {
  const animatedComponentRef = React.useRef<AnimatedComponentRef>(null);

  const startAnimation = () => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.startAnimation();
    }
  };

  const stopAnimation = () => {
    if (animatedComponentRef.current) {
      animatedComponentRef.current.stopAnimation();
    }
  };

  const isActive = animatedComponentRef.current ? animatedComponentRef.current.isActive : false;


  return (
    <div>
      <h4>{team.teamName}</h4>

      {/* Add other team-related fields as needed */}
      <p>Progress: {String(team.progress)}%</p>

      <button onClick={startAnimation}>Start Animation</button>
      <button onClick={stopAnimation}>Stop Animation</button>
      {isActive && <p>Team is active!</p>}
      <AnimatedComponent
        animationClass={"slideIn"}
        ref={animatedComponentRef}
        animationType="slideIn"
        duration={1000} />

    </div>
  );
};

export default TeamProgressBar;

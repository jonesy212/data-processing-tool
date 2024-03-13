import { AnimatedComponent } from '../../libraries/animations/AnimationComponent';
import Team from '../../models/teams/Team';

const TeamProgressBar = ({ team }: {team: Team}) => {
  const { startAnimation, stopAnimation, isActive } = AnimatedComponent({
    animationType: 'slideIn', // Example prop
    duration: 1000, // Example prop
  });

  return (
    <div>
      <h4>{team.teamName}</h4>
      <p>Progress: {team.progress}%</p>
      <button onClick={startAnimation}>Start Animation</button>
      <button onClick={stopAnimation}>Stop Animation</button>
      {isActive && <p>Team is active!</p>}
    </div>
  );
};

export default TeamProgressBar;

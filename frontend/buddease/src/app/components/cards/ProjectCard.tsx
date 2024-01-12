import AnimatedComponent from './AnimatedComponent';

const ProjectCard = ({ project }) => {
  const { animateIn, isActive } = AnimatedComponent();

  return (
    <div>
      <h4>{project.name}</h4>
      <p>Phase: {project.phase}</p>
      <p>Status: {project.status}</p>
      <button onClick={animateIn}>Animate In</button>
      {isActive && <p>Project is active!</p>}
    </div>
  );
};

export default ProjectCard;

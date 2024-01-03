import IdeaPhase from './IdeationPhase';

const IdeaLifecycle = () => {
  return (
    <div>
      <h2>Idea Lifecycle</h2>
      {/* Render different phases based on your application state */}
      <IdeaPhase phaseName="Idea" />
      <IdeaPhase phaseName="Team Building" />
      <IdeaPhase phaseName="Ideation" />
      {/* Add more phases as needed */}
    </div>
  );
};

export default IdeaLifecycle;

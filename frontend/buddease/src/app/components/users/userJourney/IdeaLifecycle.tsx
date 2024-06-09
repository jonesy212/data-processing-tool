import React from "react";
import IdeaCreationPhase from "./IdeaCreationPhase";
import IdeaPhase from "./IdeationPhase";

const IdeaLifecycle = () => {
  return (
    <div>
      <h2>Idea Lifecycle</h2>
      {/* Render different phases based on your application state */}
      <IdeaCreationPhase
        onSubmit={() => {}}
        onTransition={() => {}}
        duration={0}
        // phaseName="Idea Creation"
      />
      <IdeaPhase
        phaseName="Idea"
        onTransition={{
          phaseName: "string",
          onTransition: () => {
            console.log("onTransition");
          },
        }}
      />
      <IdeaPhase
        phaseName="Team Building"
        onTransition={{
          phaseName: "string",
          onTransition: () => {
            console.log("onTransition");
          },
        }}
      />
      <IdeaPhase
        phaseName="Ideation"
        onTransition={{
          phaseName: "string",
          onTransition: () => {
            console.log("onTransition");
          },
        }}
      />
      {/* Add more phases as needed */}
    </div>
  );
};

export default IdeaLifecycle;

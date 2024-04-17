// DevelopmentPhase.tsx



export interface DevelopmentPhase {
  phase: string;
  title: string;
  render(): JSX.Element;
}

export const PlanningPhase: DevelopmentPhase  = {
  phase: "planning",
  title: "Planning",
  render: () => {
    return <div>Planning Phase UI</div>;
  },
};

export const DesignPhase: DevelopmentPhase = {
  phase: "design",
  title: "Design",
  render: () => {
    return <div>Developement Phase UI</div>;
    // Render design phase UI and logic
  },
};

// Define other phases similarly...


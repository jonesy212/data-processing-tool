import ProjectCard from "../../cards/ProjectCard";
import { Project } from "../Project";
import React from "react";

const ProjectTimeline = () => {
  // Assume projectData is an array with project details
  const projectData = [
    { id: 1, name: 'Project A', phase: 'Planning', status: 'Pending' },
    { id: 2, name: 'Project B', phase: 'Execution', status: 'In Progress' },
    // Add more projects as needed
  ];

  return (
    <div>
      <h3>Project Timeline</h3>
      {projectData.map((project: any) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectTimeline;

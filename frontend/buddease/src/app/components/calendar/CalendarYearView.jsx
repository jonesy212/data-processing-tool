import React from "react";

const YearView = ({ year, projects }) => {
  // Assume you have a selectedProject state that represents the currently selected project
  const selectedProject = null; // Set this based on user interaction or other logic

  return (
    <div>
      <h2>Year View</h2>

      {selectedProject ? (
        // Render project details
        <div>
          <h3>Project: {selectedProject.name}</h3>
          <p>Description: {selectedProject.description}</p>
          {/* Display other project details */}
        </div>
      ) : (
        // Render tasks for the year
        <div>
          <h3>Tasks for {year}</h3>
          {/* Render tasks based on priority, date, etc. */}
          {/* ... */}
        </div>
      )}
      <h3>Projects for {year}</h3>
      {/* Render a list of projects */}
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <strong>{project.name}</strong> - {project.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YearView;

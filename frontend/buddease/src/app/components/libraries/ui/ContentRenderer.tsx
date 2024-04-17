// ContentRenderer.tsx
import React from "react";
import { Task } from "../../models/tasks/Task";
import { Project } from "../../projects/Project";
import { isProject, isTask } from "./ContentHelpers";

interface ButtonProps {
  label: string;
}

interface CardProps {
  title: string;
  content: string;
}

interface EntityProps {
  id: string;
  name: string;
  type: string;
  // Add more properties as needed
}

interface ContentRendererProps {
  dynamicContent?: Task[] | Project[]; // Union type of Task[] or Project[]
  handleTaskClick: (task: Task) => void;
  handleTodoClick: (todo: Todo) => void;
  handleProjectClick: (project: Project) => void;
  entity?: EntityProps; // Add EntityProps as a prop
  button?: ButtonProps;
  card?: CardProps;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  dynamicContent,
  entity,
  button,
  card,
  handleTaskClick,
  handleProjectClick,
}) => {
  return (
    <div>
      <h2>{dynamicContent ? "Dynamic" : "Static"} Component</h2>
      {dynamicContent
        ? renderDynamicContent(
            dynamicContent,
            handleTaskClick,
            handleProjectClick
          )
        : renderStaticContent()}
    </div>
  );
};

const renderStaticContent = () => {
  return (
    <div>
      <h3>Static Card</h3>
      <p>Static Card Content</p>
    </div>
  );
};

const renderDynamicContent = (
  dynamicContent: (Task | Project)[],
  handleTaskClick?: (task: Task) => void,
  handleProjectClick?: (project: Project) => void,
  entity?: EntityProps,
  button?: ButtonProps,
  card?: CardProps,
) => {
  // Check if entity, button, or card props are provided
  if (dynamicContent && dynamicContent.length > 0) {
    return dynamicContent.map((content) => (
      <div key={content.id}>
        {isTask(content) ? (
          <>
            <h3>{content.title}</h3>
            {handleTaskClick && (
              <button onClick={() => handleTaskClick(content)}>
                Click Task
              </button>
            )}
          </>
        ) : isProject(content) ? (
          <>
            <h3>{(content as Project).name}</h3>
            {handleProjectClick && (
              <button onClick={() => handleProjectClick(content)}>
                Click Project
              </button>
            )}
          </>
        ) : // Handle other types of dynamic content here if needed
        null}
      </div>
    ));
  } else {
    return <p>No content available</p>;
  }
};

export default ContentRenderer;

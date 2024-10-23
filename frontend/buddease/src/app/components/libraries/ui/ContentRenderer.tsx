// ContentRenderer.tsx
import { Project, ProjectDetails } from "@/app/components/projects/Project";
import React from "react";
import { StatusType } from "../../models/data/StatusType";
import { Task } from "../../models/tasks/Task";
import { Todo } from "../../todos/Todo";
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
  handleTaskClick: (task: Task) => Promise<void>;
  handleTodoClick: (todoId: Todo["id"]) => Promise<void>;
  handleProjectClick: (
    project: {
      projectId: string;
      project: Project;
      projectDetails: ProjectDetails;
      completion: number;
      pending: boolean;
    },
    type: string
  ) => Promise<void>;
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
            handleProjectClick,
            entity,
            button,
            card
          )
        : renderStaticContent()}
    </div>
  );
};



const renderDynamicContent = (
  dynamicContent: (Task | Project)[],
  handleTaskClick?: (task: Task) => Promise<void>,
  handleProjectClick?: (
    project: {
      projectId: string;
      project: Project;
      projectDetails: ProjectDetails;
      completion: number;
      pending: boolean;
    },
    type: string
  ) => Promise<void>,
  entity?: EntityProps,
  button?: ButtonProps,
  card?: CardProps
) => {
  // Check if entity, button, or card props are provided
  if (dynamicContent && dynamicContent.length > 0) {
    return dynamicContent.map((content) => (
      <div key={content.id}>
        {isTask(content) ? (
          <>
            <h3>{content.title}</h3>
            {handleTaskClick && (
              <button onClick={() => handleTaskClick(content as Task)}>
                Click Task
              </button>
            )}
          </>
        ) : isProject(content) ? (
          <>
            <h3>{(content as Project).name}</h3>
            {handleProjectClick && (
              <button
                onClick={() =>
                  handleProjectClick(
                    {
                      projectId: content.id,
                      project: content,
                      completion: 0,
                      pending: false,
                      projectDetails: {
                        _id: (content as Project)._id as string,
                        name: (content as Project).name,
                        title: (content as Project).title as string,
                        description: "Project Description",
                        status: StatusType.Pending,
                        tasks: [],
                        
                      }
                    },
                    "update"
                  )
                }
              >
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



const renderStaticContent = () => {
  return (
    <div>
      <h3>Static Card</h3>
      <p>Static Card Content</p>
    </div>
  );
};


export default ContentRenderer;

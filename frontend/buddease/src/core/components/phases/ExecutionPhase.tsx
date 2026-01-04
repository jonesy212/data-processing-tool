components/phases/ExecutionPhase.tsx
import { TaskManagementPhase } from "@/core/projects/TaskManagementPhase";
import React from "react";

interface ExecutionPhaseProps {
  onSubmit: (nextPhase: TaskManagementPhase) => void;
}

const ExecutionPhase: React.FC<ExecutionPhaseProps> = ({ onSubmit }) => {
  const [progress, setProgress] = React.useState(0);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [tasks, setTasks] = React.useState([
    { id: 1, name: "Setup database", completed: false },
    { id: 2, name: "Configure API endpoints", completed: false },
    { id: 3, name: "Implement core features", completed: false },
    { id: 4, name: "Integrate third-party services", completed: false },
    { id: 5, name: "Performance optimization", completed: false },
  ]);

  const executeTasks = () => {
    setIsExecuting(true);
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      
      // Update task completion status
      setTasks(prev => 
        prev.map((task, index) => ({
          ...task,
          completed: index < Math.floor(currentProgress / 20)
        }))
      );
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 1000);
  };

  const handleSubmit = () => {
    if (progress === 100) {
      onSubmit(TaskManagementPhase.TESTING);
    } else {
      alert("Please complete all execution tasks before proceeding.");
    }
  };

  return (
    <div className="execution-phase">
      <h2>Execution Phase</h2>
      
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="progress-text">{progress}% Complete</div>
      </div>
      
      <div className="execution-controls">
        <button 
          onClick={executeTasks} 
          disabled={isExecuting || progress === 100}
          className="execute-btn"
        >
          {isExecuting ? "Executing..." : "Execute Tasks"}
        </button>
        
        <button 
          onClick={() => setProgress(0)}
          disabled={isExecuting || progress === 0}
          className="reset-btn"
        >
          Reset Progress
        </button>
      </div>
      
      <div className="task-list">
        <h3>Execution Tasks</h3>
        <ul>
          {tasks.map(task => (
            <li key={task.id} className={task.completed ? "completed" : ""}>
              <input 
                type="checkbox" 
                checked={task.completed}
                readOnly
              />
              <span>{task.name}</span>
              {task.completed && <span className="checkmark">✓</span>}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="logs">
        <h3>Execution Logs</h3>
        <div className="log-container">
          {progress >= 20 && <div>[INFO] Database setup completed</div>}
          {progress >= 40 && <div>[INFO] API endpoints configured</div>}
          {progress >= 60 && <div>[INFO] Core features implemented</div>}
          {progress >= 80 && <div>[INFO] Third-party services integrated</div>}
          {progress >= 100 && <div>[SUCCESS] All tasks completed!</div>}
        </div>
      </div>
      
      <div className="action-buttons">
        <button 
          onClick={() => onSubmit(TaskManagementPhase.PLANNING)}
          className="back-btn"
        >
          Back to Planning
        </button>
        <button 
          onClick={handleSubmit}
          disabled={progress < 100}
          className="submit-btn"
        >
          Proceed to Testing
        </button>
      </div>
    </div>
  );
};

export default ExecutionPhase;
import { PayloadAction } from "@reduxjs/toolkit";
import React, { useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import { Task } from "../../models/tasks/Task";
import { Snapshot } from "../../state/stores/SnapshotStore";

// Define project phases
enum ProjectPhase {
  PHASE_1 = "Phase 1",
  PHASE_2 = "Phase 2",
  PHASE_3 = "Phase 3",
  // Add more phases as needed
}

const ProjectManager: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(
    ProjectPhase.PHASE_1
  );
  const [tasks, setTasks] = useState<Task[]>([]);

  const advanceToNextPhase = () => {
    console.log(`Advancing to the next project phase (${currentPhase})...`);
    // Add your logic to move to the next phase
    // For example, update the currentPhase state to the next phase
    // and perform any other necessary actions
  };

  const markTaskAsComplete = (taskId: string) => {
    console.log(`Marking task ${taskId} as complete...`);
    // Add your logic to mark a task as complete
    // For example, update the tasks state to mark the task as complete
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  const rollbackToPreviousPhase = () => {
    console.log(
      `Rolling back to the previous project phase (${currentPhase})...`
    );
    // Add your logic to rollback to the previous phase
    // For example, update the currentPhase state to the previous phase
    // and perform any other necessary actions
  };

  const getActionHistory = () => {
    // Implement your logic to retrieve the action history (array of actions)
    // Include snapshots from the SnapshotStore
  
    const snapshotStoreSnapshots: Snapshot<T>[] = useSnapshotManager().getSnapshots();
    const snapshotActions = snapshotStoreSnapshots.map((snapshot) =>
      entityActions.addSnapshot(snapshot)
    );
  
    // Replace the following line with your actual implementation to retrieve other actions
    const otherActions: PayloadAction[] = [];
  
    // Combine snapshot actions with other actions
    const actionHistory: PayloadAction[] = [...snapshotActions, ...otherActions];
  
    return actionHistory;
  };

  // Function to undo the last action
  const undoLastAction = () => {
    const actionHistory: PayloadAction[] = getActionHistory();

    console.log("Undoing the last action...");

    if (actionHistory.length > 0) {
      // Get the last action
      const lastAction = actionHistory.pop();

      // Log that the last action was undone
      console.log("Last action undone:", lastAction);
    } else {
      console.log("No actions to undo.");
    }
  };

  return (
    <div>
      <h2>Project Manager</h2>
      <p>Current Phase: {currentPhase}</p>
      <button onClick={advanceToNextPhase}>Advance to Next Phase</button>
      <button onClick={rollbackToPreviousPhase}>
        Rollback to Previous Phase
      </button>
      <button onClick={undoLastAction}>Undo Last Action</button>

      <h3>Tasks</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.description} - {task.status ? "Completed" : "Incomplete"}
            <button onClick={() => markTaskAsComplete(task.id as string)}>
              Mark as Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManager;
import { UserConfigExport } from "vite";
import { PayloadAction } from "@reduxjs/toolkit";
import React, { useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import { Data } from "../../models/data/Data";
import { Task } from "../../models/tasks/Task";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotConfig";
import SnapshotStore, {
  CustomSnapshotData,
  Snapshot,
} from "../../snapshots/SnapshotStore";
import { snapshot } from "../../snapshots/snapshot";
import { addSnapshot, mergeSnapshots, takeSnapshot } from "@/app/api/SnapshotApi";
import {
  deleteSnapshot,
  updateSnapshot,
} from "../../snapshots/snapshotHandlers";

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

  const getActionHistory = async (
    snapshot: SnapshotStore<Snapshot<Data>>
  ): Promise<SnapshotStoreConfig<Snapshot<Data>, Data>> => {
    const entityActions = useSnapshotManager();
    const snapshotStoreSnapshots = await (
      await entityActions
    ).getSnapshots(snapshot);

    // Assuming snapshotStoreSnapshots is of type SnapshotStoreConfig<Snapshot<Data>, Data>
    const otherActions: PayloadAction[] = []; // Example other actions

    // Constructing the actions object as per the SnapshotStoreConfig interface
    const actions = {
      takeSnapshot: takeSnapshot,
      updateSnapshot: updateSnapshot,
      deleteSnapshot: deleteSnapshot,
      addSnapshot: addSnapshot,
      mergeSnapshots: mergeSnapshots,
    };

    const actionHistory: SnapshotStoreConfig<Snapshot<Data>, Data> = {
      ...snapshotStoreSnapshots,
      actions: actions,
    };

    return actionHistory;
  };

  // Function to undo the last action
  const undoLastAction = () => {
    if (snapshot.store) {
      getActionHistory(snapshot.store).then(
        (value: SnapshotStoreConfig<Snapshot<Data>, Data>) => {
          console.log('Undoing the last action...');
  
          // Access action history from value
          const actionHistory = value.actions || [];
  
          if (Array.isArray(actionHistory) && actionHistory.length > 0) {
            // Get the last action
            const lastAction = actionHistory.pop();
  
            // Log that the last action was undone
            console.log('Last action undone:', lastAction);
          } else {
            console.log('No actions to undo.');
          }
        }
      );
    } else {
      console.log('No snapshot store available.');
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
            {task.description} - {task.completed ? "Completed" : "Incomplete"}
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

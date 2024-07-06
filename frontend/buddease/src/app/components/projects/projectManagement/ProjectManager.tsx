import { addSnapshot, mergeSnapshots, takeSnapshot } from "@/app/api/SnapshotApi";
import { PayloadAction } from "@reduxjs/toolkit";
import React, { useRef, useState } from "react";
import useSnapshotManager from "../../hooks/useSnapshotManager";
import useStorageManager from "../../hooks/useStorageManager";
import { BaseData, Data } from "../../models/data/Data";
import { Task } from "../../models/tasks/Task";
import { SnapshotStoreConfig } from "../../snapshots/SnapshotConfig";
import SnapshotStore, {
} from "../../snapshots/SnapshotStore";
import { snapshot } from "../../snapshots/snapshot";
import {
  deleteSnapshot,
  updateSnapshot,
} from "../../snapshots/snapshotHandlers";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";

// Define project phases
enum ProjectPhase {
  PHASE_1 = "Phase 1",
  PHASE_2 = "Phase 2",
  PHASE_3 = "Phase 3",
  // Add more phases as needed
}


// Define Data for the snapshot
interface ProjectData extends BaseData {
  currentPhase: ProjectPhase;
  tasks: Task[];
}

const ProjectManager: React.FC = () => {
  const storageManager = useStorageManager("project-phase-data");
  const initialData = storageManager.getItem() as ProjectData | undefined;
  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(
    initialData?.currentPhase || ProjectPhase.PHASE_1
  );
  const [tasks, setTasks] = useState<Task[]>(initialData?.tasks || []);
  const snapshotStoreRef = useRef(new SnapshotStore<ProjectData>(
    data,
    initialState,
    category,
    date,
    type,
    snapshotConfig,
    subscribeToSnapshots,
    subscribeToSnapshot,
    
    delegate,
    dataStoreMethods,
  ));

  const advanceToNextPhase = () => {
    const nextPhase = getNextPhase(currentPhase);
    setCurrentPhase(nextPhase);
    updateLocalStorage(nextPhase, tasks);
  };

  const markTaskAsComplete = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    updateLocalStorage(currentPhase, updatedTasks);
  };

  const rollbackToPreviousPhase = () => {
    const previousPhase = getPreviousPhase(currentPhase);
    setCurrentPhase(previousPhase);
    updateLocalStorage(previousPhase, tasks);
  };

  const updateLocalStorage = (phase: ProjectPhase, taskList: Task[]) => {
    storageManager.setItem({ currentPhase: phase, tasks: taskList });
  };

  const getActionHistory = async (): Promise<SnapshotStoreConfig<Snapshot<ProjectData>, ProjectData>> => {
    const entityActions = useSnapshotManager();
    const snapshotStoreSnapshots = await entityActions.getSnapshots(snapshotStoreRef.current);
    const actions = {
      takeSnapshot: takeSnapshot,
      updateSnapshot: updateSnapshot,
      deleteSnapshot: deleteSnapshot,
      addSnapshot: addSnapshot,
      mergeSnapshots: mergeSnapshots,
    };

    const actionHistory: SnapshotStoreConfig<Snapshot<ProjectData>, ProjectData> = {
      snapshots: snapshotStoreSnapshots,
      actions: actions,
    };

    return actionHistory;
  };

  const undoLastAction = () => {
    if (snapshotStoreRef.current) {
      getActionHistory().then(
        (value: SnapshotStoreConfig<Snapshot<ProjectData>, ProjectData>) => {
          const actionHistory = value.actions || [];
          if (Array.isArray(actionHistory) && actionHistory.length > 0) {
            const lastAction = actionHistory.pop();
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

  const getNextPhase = (currentPhase: ProjectPhase): ProjectPhase => {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;
    return phases[nextIndex];
  };

  const getPreviousPhase = (currentPhase: ProjectPhase): ProjectPhase => {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(currentPhase);
    const previousIndex = (currentIndex - 1 + phases.length) % phases.length;
    return phases[previousIndex];
  };

  return (
    <div>
      <h2>Project Manager</h2>
      <p>Current Phase: {currentPhase}</p>
      <button onClick={advanceToNextPhase}>Advance to Next Phase</button>
      <button onClick={rollbackToPreviousPhase}>Rollback to Previous Phase</button>
      <button onClick={undoLastAction}>Undo Last Action</button>

      <h3>Tasks</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.description} - {task.completed ? "Completed" : "Incomplete"}
            <button onClick={() => markTaskAsComplete(task.id as string)}>Mark as Complete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManager;
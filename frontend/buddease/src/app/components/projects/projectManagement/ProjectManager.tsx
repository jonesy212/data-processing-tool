import { addSnapshot, mergeSnapshots, snapshotContainer, takeSnapshot } from "@/app/api/SnapshotApi";
import React, { useRef, useState } from "react";
import useStorageManager from "../../hooks/useStorageManager";
import { BaseData, Data } from "../../models/data/Data";
import { Task } from "../../models/tasks/Task";
import SnapshotStore, {
} from "../../snapshots/SnapshotStore";
import {
  deleteSnapshot,
  updateSnapshot,
} from "../../snapshots/snapshotHandlers";
import { Snapshot, snapshots, SnapshotUnion } from "../../snapshots/LocalStorageSnapshotStore";
import { SnapshotContainer, SnapshotOperation, SnapshotOperationType, SnapshotStoreConfig } from "../../snapshots";
import { useSnapshotManager } from "../../hooks/useSnapshotManager";
import * as snapshotApi from '@/app/api/SnapshotApi'
import SnapshotManagerOptions from "../../snapshots/SnapshotManagerOptions";
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

const ProjectManager: React.FC = async () => {
  const storageManager = useStorageManager("project-phase-data");
  const initialData = storageManager.getItem() as ProjectData | undefined;
  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(
    initialData?.currentPhase || ProjectPhase.PHASE_1
  );



  
  const criteria = await snapshotApi.getSnapshotCriteria(
    snapshotContainer as unknown as SnapshotContainer<Data, Data>, 
    snapshot
  );
  const snapshotId = await snapshotApi.getSnapshotId(criteria);
  const storeId = await snapshotApi.getSnapshotStoreId(Number(snapshotId)); 
  const operation: SnapshotOperation = {
    // Provide the required operation details
    operationType: SnapshotOperationType.TaskSnapshotReference
  };
  const options = await useSnapshotManager(storeId) 
  ? new SnapshotManagerOptions().get() 
  : {};

  
  const [tasks, setTasks] = useState<Task[]>(initialData?.tasks || []);
  const snapshotStoreRef = useRef(new SnapshotStore<ProjectData>( storeId, options, category, config, operation));

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
    const entityActions = useSnapshotManager(storeId);
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
        (value: SnapshotStoreConfig<T, ProjectData>) => {
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
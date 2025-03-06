import { Attachment } from '@/app/components/documents/Attachment/attachment'
import * as snapshotApi from '@/app/api/SnapshotApi';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import { storeProps } from '@/app/components/snapshots/SnapshotStoreProps';
import {
  addSnapshot, mergeSnapshots, snapshotContainer, takeSnapshot,
  mapSnapshots,
  updateSnapshotStore,
  deleteSnapshotStore
 } from "@/app/api/SnapshotApi";
import React, { useRef, useState, useEffect } from "react";
import { useSnapshotManager } from "../../hooks/useSnapshotManager";
import useStorageManager from "../../hooks/useStorageManager";
import { BaseData, Data } from "../../models/data/Data";
import { Task } from "../../models/tasks/Task";
import { SnapshotContainer, SnapshotOperation, SnapshotOperationType, SnapshotStoreConfig, SnapshotStoreProps } from "../../snapshots";
import { Snapshot } from "../../snapshots/LocalStorageSnapshotStore";
import SnapshotManagerOptions from "../../snapshots/SnapshotManagerOptions";
import SnapshotStore from "../../snapshots/SnapshotStore";
import {
    deleteSnapshot,
    updateSnapshot,
} from "../../snapshots/snapshotHandlers";
import { useSnapshotStore } from '../../snapshots/useSnapshotStore';
import { T, K, Meta} from "@/app/components/models/data/dataStoreMethods";
import { Project } from '@/app/components/projects/Project';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';


// Define project phases
enum ProjectPhase {
  PHASE_1 = "Phase 1",
  PHASE_2 = "Phase 2",
  PHASE_3 = "Phase 3",
  // Add more phases as needed
}


// Define Data for the snapshot
interface ProjectData<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> extends BaseData<any, any, StructuredMetadata<any, any>, never, Attachment> {
  currentPhase: ProjectPhase;
  tasks: Task<T, K>[];
}

interface ProjectManagerProps {
  storeProps: SnapshotStoreProps<ProjectDataManagement>; // Adjust type according to your structure
}

type ProjectDataManagement = ProjectData<T, K<T>, StructuredMetadata<T, K<T>>>

interface ProjectSnapshot extends Snapshot<BaseData<any, any, StructuredMetadata<any, any>, never, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, never, Attachment>, StructuredMetadata<any, any>, never> {
  projectData: ProjectDataManagement;
}

const ProjectManager: React.FC<ProjectManagerProps> = async ({ storeProps }) => {
    const {
      storeId,
      initialState,
      name,
      version,
      schema,
      options,
      category,
      config,
      operation,
      expirationDate,
      payload,
      callback,
    
      endpointCategory,
    } = storeProps;

  const storageManager = useStorageManager("project-phase-data");
  const initialData = storageManager.getItem() as ProjectDataManagement | undefined;
  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(initialData?.currentPhase || ProjectPhase.PHASE_1);
  const initialStates: Snapshot<T, K<T>>[] = []; // Explicitly define the type

  const [states, setStates] = useState<any[]>([]); // Replace `any` with the actual type
  const [currentState, setCurrentState] = useState<any>(null); // Replace `any` with the actual type

  const snapshotStoreRef = useRef(new SnapshotStore<ProjectDataManagement>({storeId, initialState, storeProps, name, version, schema, options, category, config, operation, expirationDate, payload, callback, endpointCategory }))

  let snapshotId: string;
  useEffect(() => {
    
    const fetchSnapshotData = async () => {
      const snapshotStore = await useSnapshotStore(
        async (snapshot, subscribers, storeProps) => {
          // Implement the logic to add a snapshot to the list
          return Promise.resolve(null); // Replace with actual logic
        },
        storeProps
      );

      snapshotStoreRef.current = snapshotStore;
       // Fetch initial snapshot data
       const snapshot = await snapshotApi.getSnapshot("", Number(storeId), additionalHeaders); // Await the promise

      const criteria: CriteriaType = await snapshotApi.getSnapshotCriteria(
        snapshotContainer as unknown as SnapshotContainer<Data<BaseData<any>>, Data<BaseData<any>>>, 
        snapshot
      );

      const snapshotId = snapshotApi.getSnapshotId(criteria).toString();

      const operation: SnapshotOperation<any, any> = {
        operationType: SnapshotOperationType.TaskSnapshotReference,
      };
      const options = await useSnapshotManager(Number(storeId)) 
        ? new SnapshotManagerOptions().get() 
        : {};

      // Set initial states
      setStates(snapshotStore.states);
      setCurrentState(snapshotStore.currentState);
    };

    fetchSnapshotData();
  }, [storeId, additionalHeaders]);

  const [tasks, setTasks] = useState<Task<T, K<T>>[]>(initialData?.tasks || []);

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

  const updateLocalStorage = (phase: ProjectPhase, taskList: Task<T, K<T>>[]) => {
    storageManager.setItem({ currentPhase: phase, tasks: taskList });
  };

  const getActionHistory = async (): Promise<
    SnapshotStoreConfig<Snapshot<BaseData<any, any, StructuredMetadata<any, any>, never, Attachment>>, ProjectDataManagement>
  > => {
    const entityActions = useSnapshotManager(Number(storeId));
    const rawSnapshots = await entityActions.getAllSnapshots(snapshotStoreRef.current);

    // Map rawSnapshots to ProjectSnapshot
    const snapshotStoreSnapshots: ProjectSnapshot[] = rawSnapshots.map((data: ProjectSnapshot) => ({
      ...data, // Include all Snapshot properties
      projectData: data, // Include the project-specific data
    }));

        // Map snapshotStoreSnapshots to ProjectSnapshot
    const mappedSnapshots: ProjectSnapshot[] = snapshotStoreSnapshots.map((data: ProjectSnapshot) => ({
      ...data, // Include all Snapshot properties
      projectData: data, // Include the project-specific data
    }));
    
    const actions = {
      takeSnapshot: takeSnapshot,
      updateSnapshot: updateSnapshot,
      deleteSnapshot: deleteSnapshot,
      addSnapshot: addSnapshot,
      mergeSnapshots: mergeSnapshots,
      mapSnapshots: mapSnapshots,
      updateSnapshotStore: updateSnapshotStore,
      deleteSnapshotStore: deleteSnapshotStore
    };


  const actionHistory: SnapshotStoreConfig<
        ProjectSnapshot,
        ProjectDataManagement
      > = {
        snapshots: mappedSnapshots,
        actions: actions,
      };

    return actionHistory;
  };

  const undoLastAction = () => {
    if (snapshotStoreRef.current) {
      getActionHistory().then(
        (value: SnapshotStoreConfig<T, ProjectDataManagement>) => {
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
            {task.description} - {task.isComplete ? "Completed" : "Incomplete"}
            <button onClick={() => markTaskAsComplete(task.id as string)}>Mark as Complete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManager;
import * as snapshotApi from '@/app/api/SnapshotApi';
import {
  addSnapshot,
  deleteSnapshotStore,
  mapSnapshots,
  mergeSnapshots,
  snapshotContainer,
  takeSnapshot,
  updateSnapshotStore
} from "@/app/api/SnapshotApi";
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { additionalHeaders } from '@/app/api/headers/generateAllHeaders';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { useSnapshotManager } from "@/app/hooks/useSnapshotManager";
import useStorageManager from "@/app/hooks/useStorageManager";
import { BaseData, Data } from '@/app/models/data/Data';
import { K, T } from '@/app/models/data/dataStoreMethods';
import { Task } from "@/app/models/tasks/Task";
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { Snapshot, SnapshotContainer, SnapshotStoreConfig, SnapshotStoreProps } from "@/app/snapshots";
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import {
  deleteSnapshot,
  updateSnapshot,
} from "@/app/snapshots/snapshotHandlers";
import { useSnapshotStore } from '@/app/snapshots/useSnapshotStore';
import React, { useEffect, useRef, useState } from "react";

// -------------------- Project Phases --------------------
enum ProjectPhase {
  PHASE_1 = "Phase 1",
  PHASE_2 = "Phase 2", 
  PHASE_3 = "Phase 3",
  PHASE_4 = "Phase 4",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled"
}

// -------------------- Project Data --------------------
interface ProjectData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  currentPhase: ProjectPhase;
  tasks: Task<T, K>[];
}

interface ProjectManagerProps {
  storeProps: SnapshotStoreProps<ProjectDataManagement>;
}

type ProjectDataManagement = ProjectData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

interface ProjectSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  projectData: ProjectDataManagement;
}

// -------------------- Component --------------------
const ProjectManagerComponent: React.FC<ProjectManagerProps> = ({ storeProps }) => {
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

  // -------------------- Storage --------------------
  const storageManager = useStorageManager("project-phase-data");
  const initialData = storageManager.getItem() as ProjectDataManagement | undefined;

  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(
    initialData?.currentPhase || ProjectPhase.PHASE_1
  );

  const [states, setStates] = useState<ProjectSnapshot[]>([]);
  const [currentState, setCurrentState] = useState<ProjectSnapshot | null>(null);
  const [tasks, setTasks] = useState<Task<T, K>[]>(initialData?.tasks || []);

  const snapshotStoreRef = useRef<SnapshotStore<ProjectDataManagement> | null>(null);

  // -------------------- Async Snapshot Initialization --------------------
  useEffect(() => {
    const initSnapshots = async () => {
      try {
        // 1️⃣ Initialize snapshot store
        const snapshotStore = await useSnapshotStore(
          async (snapshot, subscribers, storeProps) => {
            return Promise.resolve(null); // TODO: implement snapshot addition logic
          },
          storeProps
        );
        snapshotStoreRef.current = snapshotStore;

        // 2️⃣ Fetch initial snapshot from API
        const snapshot = await snapshotApi.getSnapshot("", Number(storeId), additionalHeaders);

        // 3️⃣ Get snapshot criteria
        const criteria: CriteriaType = await snapshotApi.getSnapshotCriteria(
          snapshotContainer as unknown as SnapshotContainer<Data<BaseData<any>>, Data<BaseData<any>>>,
          snapshot
        );

        // 4️⃣ Get snapshot ID (sync from criteria)
        const snapshotId = snapshotApi.getSnapshotId(criteria).toString();

        // 5️⃣ Get all snapshots from snapshot manager
        const entityActions = useSnapshotManager<ProjectDataManagement>(Number(storeId));
        if (entityActions.snapshotManager) {
          const rawSnapshots = await entityActions.snapshotManager.getAllSnapshots(snapshotStoreRef.current);
          setStates(rawSnapshots);
          setCurrentState(rawSnapshots[0] || null);
        }
      } catch (error) {
        console.error("Error initializing snapshots:", error);
      }
    };

    initSnapshots();
  }, [storeId, storeProps]);

  // -------------------- Task/Phase Handlers --------------------
  const advanceToNextPhase = () => {
    const nextPhase = getNextPhase(currentPhase);
    setCurrentPhase(nextPhase);
    updateLocalStorage(nextPhase, tasks);
  };

  const rollbackToPreviousPhase = () => {
    const previousPhase = getPreviousPhase(currentPhase);
    setCurrentPhase(previousPhase);
    updateLocalStorage(previousPhase, tasks);
  };

  const markTaskAsComplete = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    updateLocalStorage(currentPhase, updatedTasks);
  };

  const updateLocalStorage = (phase: ProjectPhase, taskList: Task<T, K>[]) => {
    storageManager.setItem({ currentPhase: phase, tasks: taskList });
  };

  const getNextPhase = (phase: ProjectPhase) => {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(phase);
    return phases[(currentIndex + 1) % phases.length];
  };

  const getPreviousPhase = (phase: ProjectPhase) => {
    const phases = Object.values(ProjectPhase);
    const currentIndex = phases.indexOf(phase);
    return phases[(currentIndex - 1 + phases.length) % phases.length];
  };

  // -------------------- Async Undo Action --------------------
  const getActionHistory = async (): Promise<SnapshotStoreConfig<ProjectSnapshot, ProjectDataManagement>> => {
    const entityActions = useSnapshotManager<ProjectDataManagement>(Number(storeId));
    if (!entityActions.snapshotManager) throw new Error("Snapshot manager not initialized");

    const rawSnapshots = await entityActions.snapshotManager.getAllSnapshots(snapshotStoreRef.current);

    const mappedSnapshots: ProjectSnapshot[] = rawSnapshots.map((data: ProjectSnapshot) => ({
      ...data,
      projectData: data,
    }));

    const actions = {
      takeSnapshot,
      updateSnapshot,
      deleteSnapshot,
      addSnapshot,
      mergeSnapshots,
      mapSnapshots,
      updateSnapshotStore,
      deleteSnapshotStore,
    };

    return {
      snapshots: mappedSnapshots,
      actions,
    } as SnapshotStoreConfig<ProjectSnapshot, ProjectDataManagement>;
  };

  const undoLastAction = async () => {
    if (!snapshotStoreRef.current) {
      console.log("No snapshot store available.");
      return;
    }

    try {
      const actionHistory = await getActionHistory();
      const actions = actionHistory.actions || [];
      if (Array.isArray(actions) && actions.length > 0) {
        const lastAction = actions.pop();
        console.log("Last action undone:", lastAction);
      } else {
        console.log("No actions to undo.");
      }
    } catch (error) {
      console.error("Failed to undo last action:", error);
    }
  };

  // -------------------- Render --------------------
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

export default ProjectManagerComponent;
export type { ProjectPhase };

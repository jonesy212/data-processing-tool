// ProjectManager.tsx
import { additionalHeaders } from "@/core/api/headers/generateAllHeaders";
import {
    BaseDataEntity,
    DefaultExcludedFields,
    DefaultMeta,
} from "@/core/config/BaseConfig";
import type { Attachment } from "@/core/documents/attachment/Attachment";
import { useSnapshotManager } from "@/core/hooks/useSnapshotManager";
import useStorageManager from "@/core/hooks/useStorageManager";
import type { BaseData } from "@/core/models/data/Data";
import type { Task } from "@/core/models/tasks/Task";
import { CriteriaType } from "@/core/pages/searches/CriteriaType";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import { SnapshotContainer } from "@/core/snapshots/SnapshotContainer";
import SnapshotStore from "@/core/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import type { SnapshotStoreProps } from "@/core/snapshots/SnapshotStoreProps";
import {
    deleteSnapshot,
    updateSnapshot,
} from "@/core/snapshots/snapshotHandlers";
import { getSnapshot } from "@/core/snapshots/snapshotOperations";
import { useSnapshotStore } from "@/core/snapshots/useSnapshotStore";
import {
    ProjectAttachment,
    ProjectEntity,
    ProjectExcludedFields,
    ProjectIncludedFields,
    ProjectK,
    ProjectMeta,
} from "@/core/typings/entities/ProjectEntity";
import { SnapshotEvent } from "@/core/typings/snapshotTypes";
import React, { useEffect, useRef, useState } from "react";
;

// -------------------- Project Phases --------------------
enum ProjectPhase {
  PHASE_1 = "Phase 1",
  PHASE_2 = "Phase 2",
  PHASE_3 = "Phase 3",
  PHASE_4 = "Phase 4",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
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
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

interface ProjectManagerProps {
  storeProps: SnapshotStoreProps<ProjectDataManagement>;
}

type ProjectDataManagement = ProjectData<
  ProjectEntity,
  ProjectK,
  ProjectMeta,
  ProjectAttachment,
  ProjectExcludedFields,
  ProjectIncludedFields
>;

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

// Create type aliases for concrete types for better readability
type ConcreteTask = Task<
  ProjectEntity,
  ProjectK,
  ProjectMeta,
  ProjectAttachment,
  ProjectExcludedFields,
  ProjectIncludedFields
>;
type ConcreteProjectSnapshot = ProjectSnapshot<
  ProjectEntity,
  ProjectK,
  ProjectMeta,
  ProjectAttachment,
  ProjectExcludedFields,
  ProjectIncludedFields
>;
type ConcreteSnapshot = Snapshot<
  ProjectEntity,
  ProjectK,
  ProjectMeta,
  ProjectAttachment,
  ProjectExcludedFields,
  ProjectIncludedFields
>;

// -------------------- Component --------------------
const ProjectManagerComponent: React.FC<ProjectManagerProps> = ({
  storeProps,
}: ProjectManagerProps) => {
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
  const initialData = storageManager.getItem() as
    | ProjectDataManagement
    | undefined;

  const [currentPhase, setCurrentPhase] = useState<ProjectPhase>(
    initialData?.currentPhase || ProjectPhase.PHASE_1
  );

  // Use concrete types instead of generics
  const [states, setStates] = useState<ConcreteProjectSnapshot[]>([]);
  const [currentState, setCurrentState] =
    useState<ConcreteProjectSnapshot | null>(null);
  const [tasks, setTasks] = useState<ConcreteTask[]>(initialData?.tasks || []);

  const snapshotStoreRef = useRef<SnapshotStore<ProjectDataManagement> | null>(
    null
  );

  // Define snapshotContainer (you'll need to provide this value)
  const snapshotContainer: SnapshotContainer<
    T,
    K,
    Meta,
    AttachmentType,
    ExcludedFields,
    IncludedFields
  > = /* define or get this */ {} as any;

  // -------------------- Async Snapshot Initialization --------------------
  useEffect(() => {
    const initSnapshots = async () => {
      try {
        // 1️⃣ Initialize snapshot store
        const snapshotStore = await useSnapshotStore(
          async (snapshot, subscribers, storeProps) => {
            return Promise.resolve(null);
          },
          storeProps
        );
        snapshotStoreRef.current = snapshotStore;

        // 2️⃣ Fetch initial snapshot from API - Use concrete types
        const snapshot = await getSnapshot<
          ProjectEntity,
          ProjectK,
          ProjectMeta,
          ProjectAttachment,
          ProjectExcludedFields,
          ProjectIncludedFields
        >(
          "", // snapshotId
          Number(storeId),
          {} as ConcreteSnapshot,
          "fetch",
          {} as SnapshotEvent<
            ProjectEntity,
            ProjectK,
            ProjectMeta,
            ProjectAttachment,
            ProjectExcludedFields,
            ProjectIncludedFields
          >,
          {} as SnapshotConfig<
            ProjectEntity,
            ProjectK,
            ProjectMeta,
            ProjectAttachment,
            ProjectExcludedFields,
            ProjectIncludedFields
          >,
          additionalHeaders
        );

        // 3️⃣ Get snapshot criteria
        const criteria: CriteriaType = await getSnapshotCriteria(
          snapshotContainer,
          snapshot
        );

        // 4️⃣ Get snapshot ID (sync from criteria)
        const snapshotId = getSnapshotId(criteria).toString();

        // 5️⃣ Get all snapshots from snapshot manager
        const entityActions = useSnapshotManager<ProjectDataManagement>(
          Number(storeId),
          storeProps
        );
        if (entityActions.snapshotManager) {
          const rawSnapshots =
            await entityActions.snapshotManager.getAllSnapshots(
              snapshotStoreRef.current
            );

          // Convert Snapshot to ProjectSnapshot by adding projectData
          const projectSnapshots = rawSnapshots.map((snapshot) => ({
            ...snapshot,
            projectData:
              initialData ||
              ({
                currentPhase: ProjectPhase.PHASE_1,
                tasks: [],
                // Add other default properties as needed
              } as ProjectDataManagement),
          })) as ConcreteProjectSnapshot[];

          setStates(projectSnapshots);
          setCurrentState(projectSnapshots[0] || null);
        }
      } catch (error) {
        console.error("Error initializing snapshots:", error);
      }
    };

    initSnapshots();
  }, [storeId, storeProps, initialData]);

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

  const updateLocalStorage = (
    phase: ProjectPhase,
    taskList: ConcreteTask[]
  ) => {
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
  const getActionHistory = async (): Promise<
    SnapshotStoreConfig<ConcreteProjectSnapshot, ProjectDataManagement>
  > => {
    const entityActions = useSnapshotManager<ProjectDataManagement>(
      Number(storeId),
      storeProps
    );
    if (!entityActions.snapshotManager)
      throw new Error("Snapshot manager not initialized");

    const rawSnapshots = await entityActions.snapshotManager.getAllSnapshots(
      snapshotStoreRef.current
    );

    const mappedSnapshots: Snapshot<
      ConcreteProjectSnapshot,
      ProjectDataManagement,
      DefaultMeta<any, any>,
      Attachment,
      never,
      keyof ConcreteProjectSnapshot
    >[] = rawSnapshots.map(
      (
        snapshot: Snapshot<
          ConcreteProjectSnapshot,
          ProjectDataManagement,
          DefaultMeta<any, any>,
          Attachment,
          never,
          keyof ConcreteProjectSnapshot
        >
      ) => {
        // Create a new snapshot object with the merged data
        const enhancedData = {
          ...snapshot.data,
          projectData:
            initialData ||
            ({
              currentPhase: ProjectPhase.PHASE_1,
              tasks: [],
              // Add other default properties
            } as ProjectDataManagement),
        };

        return {
          ...snapshot,
          data: enhancedData,
          // Add projectData to the snapshot itself if needed
          projectData:
            initialData ||
            ({
              currentPhase: ProjectPhase.PHASE_1,
              tasks: [],
            } as ProjectDataManagement),
        };
      }
    );

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
    };
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
        // You can now use storeProps here if needed
        console.log("Store props:", storeProps);
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
      <button onClick={rollbackToPreviousPhase}>
        Rollback to Previous Phase
      </button>
      <button onClick={undoLastAction}>Undo Last Action</button>

      <h3>Tasks</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.description} - {task.isCompleted ? "Completed" : "Incomplete"}
            <button onClick={() => markTaskAsComplete(task.id as string)}>
              Mark as Complete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagerComponent;
export { ProjectPhase };

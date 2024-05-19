import { HistoryEntry, HistoryStore, baseStore } from "../../state/stores/HistoryStore";

// TaskHistoryEntry.tsx
interface TaskHistoryEntry {
    id: number;
    taskId: number;
    timestamp: number;
    action: string;
    // Add more properties as needed to capture details of the action
}

interface TaskHistoryStore {
    getTaskHistory: (taskId: number) => Promise<TaskHistoryEntry[]>;
    addTaskHistoryEntry: (taskId: number, action: string) => void;
    // Add more methods as needed
}

// Mock data for demonstration purposes (replace with actual implementation)
const taskHistoryData: Record<number, TaskHistoryEntry[]> = {
    1: [
        { id: 1, taskId: 1, action: 'Task created', timestamp: 1620332996000 },
        { id: 2, taskId: 1, action: 'Task updated', timestamp: 1620333012000 },
    ],
    2: [
        { id: 3, taskId: 2, action: 'Task created', timestamp: 1620333054000 },
        { id: 4, taskId: 2, action: 'Task completed', timestamp: 1620333078000 },
    ],
};

// Function to fetch task history entries for the specified taskId
const getTaskHistory = async (taskId: number): Promise<TaskHistoryEntry[]> => {
    // Simulate async fetch from database/storage
    return new Promise((resolve, reject) => {
        // Simulate delay
        setTimeout(() => {
            // Retrieve task history entries for the specified taskId
            const historyEntries = taskHistoryData[taskId] || [];
            resolve(historyEntries);
        }, 1000); // Simulated delay of 1 second
    });
};

// Function to add a new task history entry
const addTaskHistoryEntry = (taskId: number, action: string): void => {
    // Generate a unique ID for the new history entry (replace with actual ID generation)
    const id = Math.floor(Math.random() * 1000) + 1;

    // Get the current timestamp
    const timestamp = Date.now();

    // Create the new history entry object
    const newHistoryEntry: TaskHistoryEntry = {
        id,
        taskId,
        action,
        timestamp,
    };

    // Save the new history entry to the taskHistoryData (replace with actual saving to database)
    if (taskHistoryData[taskId]) {
        taskHistoryData[taskId].push(newHistoryEntry);
    } else {
        taskHistoryData[taskId] = [newHistoryEntry];
    }

    // Log the addition of the new history entry
    console.log('New task history entry added:', newHistoryEntry);
};

const taskHistoryStore: TaskHistoryStore = {
    getTaskHistory,
    addTaskHistoryEntry,
    // Include other methods here
};

const historyManagerStore = (): HistoryStore => {
    const baseStoreInstance = baseStore();

    // Implement general history store methods here
    const historyStore: HistoryStore = {
        ...baseStoreInstance,
        getTaskHistory: taskHistoryStore.getTaskHistory,
        addTaskHistoryEntry: taskHistoryStore.addTaskHistoryEntry,
        history: [],
        addHistoryEntry: (entry: HistoryEntry) => {
            historyStore.history.push(entry);
        },
        undo: () => {
            if (historyStore.history.length > 0) {
                historyStore.history.pop();
            }
        },
        redo: () => {
            if (historyStore.history.length > 0) {
              historyStore.history.push(historyStore.history[historyStore.history.length - 1]);
            }
        },
    };

    return historyStore;
};

export { historyManagerStore };
export type { TaskHistoryEntry };










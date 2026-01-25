# Project Architecture Overview

## Introduction

This document provides an overview of the project structure, highlighting key components and their responsibilities. Understanding the organization of the codebase is crucial for developers who are new to the project or seeking insights into its architecture.

## Separation of Concerns

The project exhibits a robust separation of concerns, enhancing maintainability and scalability.

### 1. Redux-Saga for Side Effects

- **Responsibility:** Manages side effects and asynchronous logic.
- **Implementation:** Sagas handle API calls and other asynchronous operations independently, ensuring clean separation and maintainability.

### 2. MobX for State Management

- **Responsibility:** Manages application state.
- **Implementation:** MobX is employed for state management, handling business logic related to task management, such as adding, removing, and updating tasks.

### 3. Redux Toolkit for Redux Logic

- **Responsibility:** Manages Redux actions and reducers.
- **Implementation:** Utilizes Redux Toolkit for creating slices and managing actions and reducers in a concise manner, reducing boilerplate code.

### 4. React Component State

- **Responsibility:** Manages UI-related states within React components.
- **Implementation:** Local component state is used in specific cases for handling UI-related logic.

### 5. Generators for Code Generation

- **Responsibility:** Ensures consistent code generation.
- **Implementation:** Generators for actions, slices, store, and reducers promote consistency and reduce manual boilerplate code.

### 6. Use of Hooks

- **Responsibility:** Manages state within functional components.
- **Implementation:** Adheres to modern React best practices by using hooks for state management.

### 7. API Calls in Sagas

- **Responsibility:** Handles API calls.
- **Implementation:** API calls are centralized in sagas, keeping components focused on rendering and user interactions.

### 8. Notification Handling

- **Responsibility:** Manages and displays notification messages.
- **Implementation:** Centralized notification handling in the store provides a consistent way to manage and display notifications.

### 9. SnapshotStore

- **Responsibility:** Manages historical states.
- **Implementation:** The `SnapshotStore` is responsible for handling snapshots, facilitating the management of historical states.

---

### Project State Flow Diagram (Box/Arrow Style)

┌───────────────────────────────┐
│ MobX RootStore │
│ (observable objects) │
├───────────────┬───────────────┤
│ ProjectStore │ TaskStore │
│ UserStore │ CalendarStore │
└───────┬───────┴───────────────┘
│ (direct reactive access)
▼
┌───────────────────────────────┐
│ React Components │
│ - useStore(projectStore) │
│ - useStore(taskStore) │
└───────┬───────────────────────┘
│ interacts with
▼
┌───────────────────────────────┐
│ Redux RootStore │
├───────────────────────────────┤
│ rootSlice │
│ useTaskManagerSlice │
│ projectManagerSlice │
│ userManagerSlice │
│ uiManagerSlice │
└───────┬───────────────────────┘
│ accessed via
▼
┌───────────────────────────────┐
│ React Hooks / Wrappers │
│ (typed selectors & dispatch) │
│ - useTaskManager() │
│ - useProjectManager() │
└───────┬───────────────────────┘
│ triggers
▼
┌───────────────────────────────┐
│ Thunks / Async Actions │
│ - updateTaskPositionAsync │
│ - fetchTasksAsync │
└───────┬───────────────────────┘
│ optionally writes to
▼
┌───────────────────────────────┐
│ MobX Store or Backend │
│ (updates observable) │
└───────────────────────────────┘

pgsql
Copy code

---

### Store Type / Slice Table

| Store Type / Slice                       | Role / Purpose                                                   | Usage Context                    | React Hook Wrapper Needed?                                | Notes                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **MobX RootStore / Reactive Store**      | Central state container for multiple stores (observable objects) | Anywhere MobX state is used      | Optional (`useStore()` pattern common)                    | Direct reactive state access via `observable`, `action`, `computed`.                                                  |
| **Redux Slice (`rootSlice`)**            | Encapsulates task-specific state + reducers + actions            | Redux store                      | No, but can wrap with `useSelector` / `useDispatch` hooks | Actions: `setTasksLocal`, `addTaskLocal`, `deleteTaskLocal`, `updateTaskLocal`, `reorderTaskLocal`, `clearTasksLocal` |
| **Redux Slice (`useTaskManagerSlice`)**  | Encapsulates advanced task operations & async state              | Redux store                      | Yes                                                       | Actions: `completeTask`, `removeTask`, `selectTasks`, `sortTasks`, `updateTaskStatus`, `resizeTask`                   |
| **Redux Slice + Thunks / Async Actions** | Async updates, API calls                                         | Redux store                      | No, but used in conjunction with hooks                    | Handles side-effects like `updateTaskPositionAsync`, `fetchTasksAsync`.                                               |
| **ProjectStore (MobX or Redux wrapper)** | Domain-specific store for project entities                       | Components needing project state | Optional, if using MobX                                   | Could wrap with a React context or selector hook.                                                                     |
| **UI / Generic State Slice**             | Any other feature-specific state (UI, toolbar, notifications)    | Components                       | Optional / via `useSelector`                              | Only needed if slice is meant to be modular.                                                                          

---

## Best Practices

- **Separate slices clearly:** Using `rootSlice` for generic task operations and `useTaskManagerSlice` for detailed task operations avoids naming conflicts.  
- **Hooks for Redux:** Only create hooks for components to consume slice state or dispatch actions. Avoid naming slices themselves with `use`.  
- **MobX vs Redux:** Use MobX for highly reactive state, Redux slices for domain-specific, action-driven state. They can coexist.  
- **Async / Side-effects:** Handle API calls in thunks or sagas; avoid putting them directly in React components.  

## Conclusion

The project structure is designed with a focus on clarity, modularity, and maintainability. Developers are encouraged to follow established patterns and practices to ensure a cohesive and scalable codebase. Refer to this documentation for a comprehensive understanding of the project's architecture and organization.
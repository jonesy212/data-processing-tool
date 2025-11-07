# Project State Management and Integration Pattern

## Overview

This document defines the recommended pattern for integrating **MobX**, **Redux**, and **React** within the project. Following this pattern ensures consistent, maintainable, and scalable code for state management, side effects, and UI rendering.

---

## 1. Store Management with MobX

**Responsibilities:**
- Manages the primary application state.
- Handles business logic (e.g., tasks, projects, milestones, progress, notifications).
- Provides reactive state updates for UI components.

**Implementation Steps:**
1. Create a class store using `makeAutoObservable`.
2. Define observable state properties (e.g., `projects`, `tasks`, `loading`).
3. Implement actions for CRUD operations (add, remove, update).
4. Optionally use `reaction` for side-effect monitoring or logging.

*Example:*

```ts
import { makeAutoObservable } from "mobx";

class ProjectStore {
  projects = [];
  tasks = {};
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  addProject(project) { /* ... */ }
  updateProject(project) { /* ... */ }
  removeProject(projectId) { /* ... */ }
}
```
2. Using Custom Hooks to Access Stores

## Responsibilities:

Provide a simple, reusable interface for components to access MobX stores.

Encapsulate store initialization and side-effects like data fetching.

Implementation Steps:

Create a custom hook (e.g., useProjectManager).

Import and return the MobX store instance.

Use useEffect for initial data fetching if needed.

Example:

``` ts

import { useEffect } from "react";
import { projectManagerStore } from "../hybrid/ProjectManagerStore";

export const useProjectManager = () => {
  useEffect(() => {
    if (!projectManagerStore.projects.length) {
      projectManagerStore.fetchProjects();
    }
  }, []);

  return projectManagerStore;
};
```

- 3. Reactive UI Components with MobX

## Responsibilities:

Reactively render UI based on store changes.

Avoid passing large props; consume state directly from the store.

Implementation Steps:

Wrap components with observer from mobx-react-lite.

Consume the MobX store using the custom hook.

Render UI dynamically based on the store state.

*Example:*

```ts

import { observer } from "mobx-react-lite";

const ProjectList = observer(() => {
  const projectManagerStore = useProjectManager();
  const tasks = projectManagerStore.projects.flatMap(p => p.tasks || []);
  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
});
```

- 4. Redux Toolkit for Slices and Actions
Responsibilities:

Handles structured global state when MobX is insufficient.

Manages asynchronous logic via Thunks or Saga if needed.

Provides integration points for cross-store events.

Implementation Steps:

Create slices with createSlice.

Define state, reducers, and actions.

Use selectors to access Redux state from components.

Example:

```ts

import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "projects",
  initialState: [],
  reducers: {
    addProject: (state, action) => { /* ... */ },
    removeProject: (state, action) => { /* ... */ },
  },
});

export const { addProject, removeProject } = projectSlice.actions;
```

- 5. API Calls and Side Effects
Responsibilities:

Centralize API calls for consistency.

Keep components focused on rendering and user interaction.

Optionally handled via Redux-Saga or async functions in MobX actions.

Implementation Steps:

Create a dedicated API module.

Implement CRUD functions for each resource.

Use async/await within store actions or sagas.

Example:

```ts

async function fetchProjects() {
  try {
    const response = await ApiProject.getProjects();
    projectStore.projects = response.data;
  } catch (error) {
    console.error(error);
  }
}
```

- 6. Notifications and Progress Management
Responsibilities:

Centralize user feedback (notifications, loading indicators, progress bars).

Ensure consistency across components.

Implementation Steps:

Add notifications and progress state in MobX store.

Implement actions to update notifications and progress.

Consume in UI components for reactive display.

Example:

```ts
projectStore.addNotification({ id: uuid(), message: "Task added!" });
projectStore.setProgress({ value: 50, label: "Loading" });
```

- 7. General Integration Guidelines
MobX for reactive local/global state: Use for objects and collections with frequent UI updates.

Redux for structured global state: Use for cross-cutting concerns and async workflows.

Custom hooks: Always expose stores and actions via hooks for components.

Observer wrapper: All MobX-react components must use observer.

Separation of concerns: API calls, store logic, and UI rendering should remain decoupled.

Documentation: Comment each store, action, and component clearly for maintainability.

- 8. Recommended Folder Structure

```bash

/state
  /stores
    /hybrid
      ProjectManagerStore.ts   # Mixed MobX + Redux + React pattern
    /mobx
      ProjectStore.ts
    /redux
      projectSlice.ts
  /hooks
    useProjectManager.ts
    useProjectStore.ts
/components
  /project
    ProjectList.tsx
    TaskDetails.tsx
/api
  ApiProject.ts
/models
  Project.ts
  Task.ts
Conclusion
Following this pattern ensures:

Reactive and consistent UI updates.

Clear separation of state management responsibilities.

Simplified integration of MobX, Redux, and React components.

Maintainable, scalable codebase that is easy for new developers to follow.
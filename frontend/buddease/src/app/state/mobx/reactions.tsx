// reactions.tsx
import { Task } from '@/app/components/models/tasks/Task';
import { Todo } from '@/app/todos/Todo';
import { useTaskManagerStore } from '@/app/state/stores/TaskStore ';
import useTodoManagerStore from '@/app/state/stores/TodoStore';
import { reaction } from 'mobx';

// Function to set up reaction for a specific store
const setupReactionForStore = (getStore: () => any, propertyToObserve: string, onReaction: (value: any) => void) => {
  reaction(
    () => getStore()[propertyToObserve],
    (propertyValue) => {
      onReaction(propertyValue);
    }
  );
};


// Set up reaction for todoManagerStore
setupReactionForStore(
  useTaskManagerStore,
  'tasks', // Replace with the property you want to observe
  (tasks: Task[]) => {
    console.log('Tasks in taskManagerStore have changed:', tasks);
    // Additional logic or function calls can be placed here
  }
);

// Set up reaction for taskManagerStore
setupReactionForStore(
  useTodoManagerStore,
  'todos', // Replace with the property you want to observe
  (todos: Todo[]) => {
    console.log('Todos in todoManagerStore have changed:', todos);
    // Additional logic or function calls can be placed here
  }
);

setupRactionFortStor(
  useThemeManagerStore,
  'theme',
  () => brandingSettings.themeColor,
  (themeColor) => {
    // Call the onColorChange callback when the theme color changes
    this.onColorChange(themeColor);
  }
)
// AnimatedDashboard.tsx
import DynamicIntroTooltip from '@/app/components/DynamicIntroTooltip';
import { AnimatedComponent } from '@/app/components/animations/AnimationComponent';

import SwingCard from '@/app/components/cards/animation/SwingCard';
import React from 'react';

import ClickableList from '@/app/components/actions/ClickableList';
import { AnimatedComponentRef } from '@/app/components/animations/AnimationComponent';
import { ImageCard } from '@/app/components/cards';
import { default as GenerateUserLayout, default as useLayoutGenerator } from '@/app/components/hooks/GenerateUserLayout';
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from '@/app/components/hooks/userInterface/UIPhaseHooks';
import TaskList from '@/app/components/lists/TaskList';
import { useTaskManagerStore } from '@/app/components/state/stores/TaskStore ';
import useTodoManagerStore from '@/app/components/state/stores/TodoStore';
import TodoList from '@/app/components/todos/TodoList';



interface TaskManagerStore {
        tasks: any[];
}

    interface ClickableListItem {
        id: number;
        label: string;
        imageSrc?: string;
        onClick: () => void;
    }

    
const AnimatedDashboard: React.FC = () => {
    const animatedComponentRef = React.useRef<AnimatedComponentRef | null>(null);
  const taskManagerStore = useTaskManagerStore();
  const todoManagerStore = useTodoManagerStore()

    // Toggle activation functions
    const toggleAnimatedComponent = () => animatedComponentRef.current?.toggleActivation();
    const toggleNotificationBar = () => notificationBarHook.toggleActivation();
    const toggleDarkModeToggle = () => darkModeToggleHook.toggleActivation();

    // Condition for layout effect
    const shouldApplyLayoutEffect = true; // You can customize this condition

    // Layout effect function
    const layoutEffectFunction = () => {
        // Your layout effect logic here
        console.log("Layout effect applied!");
    };

    // Cleanup function (optional)
    const cleanupFunction = () => {
        // Your cleanup logic here
        console.log("Cleanup function called!");
    };

    // Use the layout generator hook
    const layoutGenerator = useLayoutGenerator({
        condition: () => shouldApplyLayoutEffect,
        layoutEffect: layoutEffectFunction,
        cleanup: cleanupFunction,
    });

    return (
    
        <SwingCard
            draggableId="uniqueId" // Replace with a unique ID for each card
            index={0} // Replace with the card's index
            onDragStart={() => console.log('Drag started')}
            onDragEnd={() => console.log('Drag ended')} >
          <h1>Animated Dashboard</h1>
    
          {/* Animated Component */}
          <AnimatedComponent
            ref={animatedComponentRef}
            animationClass={""}
            children={undefined}
          />
    
          {/* Dynamic Intro Tooltip */}
          <DynamicIntroTooltip
            steps={[
              {
                element: ".task-list",
                content: "This is the task list",
              },
              {
                element: ".todo-list",
                content: "This is the todo list",
              },
            ]}
          />
    
          {/* Task List */}
          <TaskList tasks={taskManagerStore.tasks} />
    
          {/* Todo List */}
          <TodoList todos={Object.values(taskManagerStore.tasks)} />
    
          {/* Image Card */}
          <ImageCard imageUrl="path/to/image.jpg" alt="Sample Image" />
    
          {/* Clickable List */}
          <ClickableList
            items={[
              {
                id: 1,
                label: "Tasks",
                imageSrc: "",
                onClick: () => {
                  animatedComponentRef.current?.animateIn(".task-list");
                },
              },
              {
                id: 2,
                label: "Todos",
                imageSrc: "",
                onClick: () => {
                  animatedComponentRef.current?.animateIn(".todo-list");
                },
              },
            ]}
          />
    
          {/* Icon Loader */}
          <IconLoader iconName="duckduckgo" />{}
    
          {/* Generate User Layout */}
          <GenerateUserLayout condition={function (): boolean {
          throw new Error('Function not implemented.');
        } } layoutEffect={function (): void {
          throw new Error('Function not implemented.');
        } } />
    
          {/* Toggle Buttons */}
          <button onClick={toggleAnimatedComponent}>
            Toggle Animated Component
          </button>
          <button onClick={toggleNotificationBar}>Toggle Notification Bar</button>
          <button onClick={toggleDarkModeToggle}>Toggle Dark Mode Toggle</button>
    
          {/* Add more components/tools as needed */}
        </SwingCard>
    );
}
// Use phase hooks
const notificationBarHook = notificationBarPhaseHook();
const darkModeToggleHook = darkModeTogglePhaseHook();

export default AnimatedDashboard

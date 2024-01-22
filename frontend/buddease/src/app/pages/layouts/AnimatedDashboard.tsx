// AnimatedDashboard.tsx
import DynamicIntroTooltip from "@/app/components/DynamicIntroTooltip";
import { AnimatedComponent } from "@/app/components/libraries/animations/AnimationComponent";

import SwingCard from "@/app/components/cards/animation/SwingCard";
import React from "react";

import ClickableList from "@/app/components/actions/ClickableList";
import { ImageCard } from "@/app/components/cards";
import {
  default as GenerateUserLayout,
  default as useLayoutGenerator,
} from "@/app/components/hooks/GenerateUserLayout";
import {
  darkModeTogglePhaseHook,
  notificationBarPhaseHook,
} from "@/app/components/hooks/userInterface/UIPhaseHooks";
import useDarkModeToggle from "@/app/components/hooks/userInterface/useDarkModeToggle";
import { loadDuckDuckGoIcon } from "@/app/components/icons/IconLoader";
import { AnimatedComponentRef } from "@/app/components/libraries/animations/AnimationComponent";
import TaskList from "@/app/components/lists/TaskList";
import { useTaskManagerStore } from "@/app/components/state/stores/TaskStore ";
import useTodoManagerStore from "@/app/components/state/stores/TodoStore";
import TodoList from "@/app/components/todos/TodoList";
import ButtonGenerator from "@/app/generators/GenerateButtons";
import { useLayout } from "./LayoutContext";

interface ClickableListItem {
  id: number;
  label: string;
  imageSrc?: string;
  onClick: () => void;
}

const AnimatedDashboard: React.FC = () => {
  const animatedComponentRef = React.useRef<AnimatedComponentRef | null>(null);
  const taskManagerStore = useTaskManagerStore();
  const todoManagerStore = useTodoManagerStore();
  // Use the useDarkModeToggle hook
  const { isDarkMode, toggleDarkMode } = useDarkModeToggle();
  const { setLayout } = useLayout();

  // Toggle activation functions
  const toggleAnimatedComponent = () =>
    animatedComponentRef.current?.toggleActivation();
  const toggleNotificationBar = () => notificationBarHook.toggleActivation();
  const toggleDarkModeToggle = () => darkModeToggleHook.toggleActivation();

  // Condition for layout effect
  const shouldApplyLayoutEffect = true; // You can customize this condition

  // Layout effect function
  const layoutEffectFunction = () => {
    // Your layout effect logic here
    setLayout({ backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' });
    console.log("Layout effect applied!");
  };

  // Cleanup function (optional)
  const cleanupFunction = () => {
    // Your cleanup logic here
    setLayout({ backgroundColor: '' });
    console.log("Cleanup function called!");
  };

  // Use the layout generator hook
  const layoutGenerator = useLayoutGenerator({
    condition: () => shouldApplyLayoutEffect,
    layoutEffect: layoutEffectFunction,
    cleanup: cleanupFunction,
  });

  const taskListItems: ClickableListItem[] = [
    {
      id: 1,
      label: "Tasks",
      imageSrc: "",
      onClick: () => {
        animatedComponentRef.current?.animateIn(".task-list");
      },
    },
    // Add more items as needed
  ];

    // Button generator configurations
    const buttonTypes = ['submit', 'reset', 'cancel'];

  return (
    <SwingCard
      draggableId="uniqueId" // Replace with a unique ID for each card
      index={0} // Replace with the card's index
      onDragStart={() => console.log("Drag started")}
      onDragEnd={() => console.log("Drag ended")}
    >

      <h1>Animated Dashboard</h1>

      {/* Animated Component */}
      <AnimatedComponent ref={animatedComponentRef} animationClass={""} />

      {/* Toggle Dark Mode Button */}
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode: {isDarkMode ? "On" : "Off"}
      </button>

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

      {/* Toggle Buttons using ButtonGenerator */}
      <ButtonGenerator
        buttonTypes={buttonTypes}
        onSubmit={toggleAnimatedComponent}
        onReset={toggleNotificationBar}
        onCancel={toggleDarkModeToggle}
      />

      {/* Task List */}
      <TaskList />

      {/* Todo List */}
      <TodoList />
      {/* Image Card */}
      <ImageCard id={0} label={""} onClick={function (): void {
        animatedComponentRef.current?.animateIn(".image-card");
      }}
      {...{
        imageSrc: '/path/to/image.png',
        title: 'Image Card',
        description: 'A card displaying an image'
      }}/>
      

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
      {loadDuckDuckGoIcon()}

   

        {/* Generate User Layout */}
        {GenerateUserLayout({
        condition: () => {
          throw new Error("Function not implemented.");
        },
        layoutEffect: () => {
          throw new Error("Function not implemented.");
        },
        cleanup: () => {
          throw new Error("Function not implemented.");
        },
      })}

      {/* Toggle Buttons */}
      <button onClick={toggleAnimatedComponent}>
        Toggle Animated Component
      </button>
      <button onClick={toggleNotificationBar}>Toggle Notification Bar</button>
      <button onClick={toggleDarkModeToggle}>Toggle Dark Mode Toggle</button>

      {/* Toggle Dark Mode Button */}
      <button onClick={toggleDarkModeToggle}>
        Toggle Dark Mode: {isDarkMode ? "On" : "Off"}
      </button>

      {/* Toggle other components */}
      <button
        onClick={() => animatedComponentRef.current?.animateIn(".todo-list")}
      >
        Toggle Todo List
      </button>
      <button
        onClick={() => animatedComponentRef.current?.animateIn(".image-card")}
      >
        Toggle Image Card
      </button>
      {/* Add more components/tools as needed */}
    </SwingCard>
  );
};
// Use phase hooks
const notificationBarHook = notificationBarPhaseHook();
const darkModeToggleHook = darkModeTogglePhaseHook();

export default AnimatedDashboard;

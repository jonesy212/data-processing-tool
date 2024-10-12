// AnimatedDashboard.tsx
import DynamicIntroTooltip from "@/app/components/DynamicIntroTooltip";
import { AnimatedComponent } from "@/app/components/libraries/animations/AnimationComponent";

import SwingCard from "@/app/components/cards/animation/SwingCard";
import React, { useEffect, useState } from "react";

import ClickableList from "@/app/components/actions/ClickableList";
import { ImageCard } from "@/app/components/cards";
import {
  LayoutGeneratorProps,
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
import { ButtonGenerator } from "@/app/generators/GenerateButtons";
import { DocxGeneratorOptions } from "@/app/generators/docxGenerator";
import ContentItemComponent, {
  ContentItem,
} from "../../components/models/content/ContentItem";
import responsiveDesignStore from "../../components/styling/ResponsiveDesign";
import { useLayout } from "./LayoutContext";

interface ClickableListItem {
  id: number;
  label: string;
  imageSrc?: string;
  onClick: () => void;
}

const AnimatedDashboard: React.FC<ClickableListItem> = ({
  id,
  label,
  imageSrc,
  onClick,
}) => {
  const animatedComponentRef = React.useRef<AnimatedComponentRef | null>(null);
  const taskManagerStore = useTaskManagerStore();
  const todoManagerStore = useTodoManagerStore();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // Use the useDarkModeToggle hook
  const { isDarkMode, toggleDarkMode } = useDarkModeToggle();
  const { setLayout } = useLayout();

  const [duckDuckGoIcon, setDuckDuckGoIcon] = useState<React.ReactNode | null>(
    null
  );

  useEffect(() => {
    const fetchDuckDuckGoIcon = async () => {
      const iconComponent = await loadDuckDuckGoIcon();
      setDuckDuckGoIcon(iconComponent);
    };

    fetchDuckDuckGoIcon();
  }, []); // Run only once on component mount

  // Define your layout effect function
  const layoutEffect = () => {
    setLayout({ backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" });
    console.log("Layout effect applied!");
  };

  // Layout effect function
  const layoutEffectFunction = () => {
    // Your layout effect logic here
    setLayout({ backgroundColor: isDarkMode ? "#1a1a1a" : "#fff" });
    console.log("Layout effect applied!");
  };

  // Cleanup function (optional)
  const cleanupFunction = () => {
    // Your cleanup logic here
    setLayout({ backgroundColor: "" });
    console.log("Cleanup function called!");
  };

  const shouldApplyLayoutEffect = true;

  // Define your layout config getter function
  const layoutConfigGetter = async () => ({
    documentGeneration: "Generate Document",
    designDashboard: <div>Layout Config Content</div>,
    responsiveDesignStore: {} as typeof responsiveDesignStore,
  });

  // Use the layout generator hook
  const layoutGenerator = useLayoutGenerator({
    condition: () => shouldApplyLayoutEffect,
    layoutEffect: layoutEffectFunction,
    generateDocument: async (options: DocxGeneratorOptions) =>
      options.data.generateDocument(options),
    documentGeneratorOptions: {} as DocxGeneratorOptions,
    layoutConfigGetter: async () => ({
      documentGeneration: "Generate Document",
      designDashboard: <div>Layout Config Content</div>,
      responsiveDesignStore: {} as typeof responsiveDesignStore,
    }),
    cleanup: cleanupFunction,
  });

  // Use the useLayoutGenerator hook
  const { toggleActivation } = useLayoutGenerator({
    condition: () => shouldApplyLayoutEffect,
    layoutEffect,
    generateDocument: async (options: DocxGeneratorOptions) => {
      // Implement your document generation logic here
      return { success: true, message: "Document generated successfully" };
    },
    documentGeneratorOptions: {} as DocxGeneratorOptions,
    layoutConfigGetter,
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

  // Toggle activation functions

  const toggleAnimatedComponent = () =>
    animatedComponentRef.current?.toggleActivation();

  const toggleNotificationBar = async () => {
    const hook = await notificationBarHook;
    hook.toggleActivation();
  };

  const toggleDarkModeToggle = () => darkModeToggleHook.toggleActivation();

  // Button generator configurations
  const buttonTypes = ["submit", "reset", "cancel"];

  return (
    <SwingCard
      draggableId="uniqueId"
      index={0}
      onDragStart={() => console.log("Drag started")}
      onDragEnd={() => console.log("Drag ended")}
    >
      <h1>Animated Dashboard</h1>
      <AnimatedComponent ref={animatedComponentRef} animationClass={""} />
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode: {isDarkMode ? "On" : "Off"}
      </button>
      <DynamicIntroTooltip
        steps={[
          { element: ".task-list", intro: "This is the task list" },
          { element: ".todo-list", intro: "This is the todo list" },
        ]}
      />
      <ButtonGenerator
        buttonTypes={buttonTypes}
        onSubmit={toggleAnimatedComponent}
        onReset={toggleNotificationBar}
        onCancel={toggleDarkModeToggle}
      />
      <TaskList />
      <TodoList />
      <ImageCard
        id={0}
        label={""}
        onClick={() => animatedComponentRef.current?.animateIn(".image-card")}
        imageSrc="/path/to/image.png"
      />
      <ClickableList
        items={[
          {
            id: 1,
            label: "Tasks",
            imageSrc: "",
            onClick: () =>
              animatedComponentRef.current?.animateIn(".task-list"),
          },
          {
            id: 2,
            label: "Todos",
            imageSrc: "",
            onClick: () =>
              animatedComponentRef.current?.animateIn(".todo-list"),
          },
        ]}
      />
      {duckDuckGoIcon} {/* Render the DuckDuckGo icon */}
      <button onClick={toggleAnimatedComponent}>
        Toggle Animated Component
      </button>
      <h1>Animated Dashboard</h1>
      {/* Render content items */}
      {contentItems.map((item) => (
        <ContentItemComponent key={item.id} {...item} />
      ))}
      <button onClick={toggleNotificationBar}>Toggle Notification Bar</button>
      <button onClick={toggleDarkModeToggle}>Toggle Dark Mode Toggle</button>
      <button onClick={toggleDarkModeToggle}>
        Toggle Dark Mode: {isDarkMode ? "On" : "Off"}
      </button>
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
    </SwingCard>
  );
};
// Use phase hooks
const notificationBarHook = notificationBarPhaseHook;
const darkModeToggleHook = darkModeTogglePhaseHook;

export default AnimatedDashboard;
useLayoutGenerator({} as LayoutGeneratorProps);
export type {ClickableListItem}
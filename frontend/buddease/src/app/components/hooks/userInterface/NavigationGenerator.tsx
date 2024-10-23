// NavigationGenerator.tsx
import React, { useEffect, useState } from 'react';
import createDynamicHook from '../dynamicHooks/dynamicHookGenerator';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavigationGeneratorProps {
    // You can extend this interface based on future requirements
      // Additional props for future requirements
  onNavigationChange?: (newItems: NavigationItem[]) => void;
  defaultNavigationItems?: NavigationItem[];
  showIcons?: boolean;
  showLabels?: boolean;
  // Add more props as needed
}

const NavigationGenerator: React.FC<NavigationGeneratorProps> = (props) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([
    // Define your initial navigation items here
    { label: 'Home', path: '/home', icon: <HomeIcon /> },
    { label: 'Tasks', path: '/tasks', icon: <TasksIcon /> },
    // Add more initial items as needed
  ]);
    
  const {
    onNavigationChange,
    defaultNavigationItems = [],
    showIcons = true,
    showLabels = true,
  } = props;
    
  const [iconsVisible, setIconsVisible] = useState(showIcons);
  const [labelsVisible, setLabelsVisible] = useState(showLabels);

    
  // Generate a dynamic hook for onNavigationChange
  const dynamicOnNavigationChange = createDynamicHook({
    condition: async () => !!onNavigationChange,
    asyncEffect: async () => {
      // Fetch additional information or perform actions as needed
      console.log("Dynamic onNavigationChange hook triggered");
      onNavigationChange && onNavigationChange(defaultNavigationItems);
    },
    cleanup: () => {
      // Cleanup logic if needed
      console.log("Dynamic onNavigationChange hook cleanup");
    },
    resetIdleTimeout: () => {
      // Reset idle timeout if needed
      console.log("Resetting idle timeout");
    },
    isActive: false,
  });

  // useEffect to mimic component did mount
  useEffect(() => {
    dynamicOnNavigationChange.startAnimation();

    // Cleanup animation on component unmount
    return () => dynamicOnNavigationChange.stopAnimation();
  }, []);



  const addNavigationItem = (newItem: NavigationItem) => {
    setNavigationItems((prevItems) => [...prevItems, newItem]);
  };

  const removeNavigationItem = (path: string) => {
    setNavigationItems((prevItems) =>
      prevItems.filter((item) => item.path !== path)
    );
  };

  const toggleIconsVisibility = () => {
    setIconsVisible((prev) => !prev);
  };

  const toggleLabelsVisibility = () => {
    setLabelsVisible((prev) => !prev);
  };

  return (
    <div>
      <h2>Navigation Menu</h2>
      <button onClick={toggleIconsVisibility}>
        {iconsVisible ? "Hide Icons" : "Show Icons"}
      </button>
      <button onClick={toggleLabelsVisibility}>
        {labelsVisible ? "Hide Labels" : "Show Labels"}
      </button>
      <ul>
        {navigationItems.map((item) => (
          <li key={item.path}>
            {iconsVisible && item.icon}
            {labelsVisible && <span>{item.label}</span>}
            <button onClick={() => removeNavigationItem(item.path)}>
              Remove
            </button>
          </li>
        ))}
        {defaultNavigationItems.map((item, index) => (
          <div key={index}>
            {iconsVisible && item.icon}
            {labelsVisible && <span>{item.label}</span>}
            {/* Render other navigation item details as needed */}
          </div>
        ))}
      </ul>
      <button
        onClick={() =>
          addNavigationItem({
            label: "New Page",
            path: "/new",
            icon: <NewPageIcon />,
          })
        }
      >
        Add New Page
      </button>
    </div>
  );
};

const HomeIcon: React.FC = () => <span>🏠</span>;
const TasksIcon: React.FC = () => <span>✅</span>;
const NewPageIcon: React.FC = () => <span>➕</span>;

export default NavigationGenerator;
export type { NavigationGeneratorProps, NavigationItem };


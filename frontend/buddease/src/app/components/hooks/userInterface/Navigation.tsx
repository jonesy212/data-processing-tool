// NavigationGenerator.tsx
import React, { useEffect, useState } from 'react';
import createDynamicHook, { DynamicHookResult } from '../dynamicHooks/dynamicHookGenerator';

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
    
    
    
  // Generate a dynamic hook for onNavigationChange
  const dynamicOnNavigationChange: DynamicHookResult = createDynamicHook({
    condition: () => !!onNavigationChange,
    asyncEffect: async () => {
      // Fetch additional information or perform actions as needed
      console.log('Dynamic onNavigationChange hook triggered');
      onNavigationChange && onNavigationChange(defaultNavigationItems);
    },
    cleanup: () => {
      // Cleanup logic if needed
      console.log('Dynamic onNavigationChange hook cleanup');
    },
  })();

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
    setNavigationItems((prevItems) => prevItems.filter((item) => item.path !== path));
  };

  return (
    <div>
      <h2>Navigation Menu</h2>
      <ul>
        {navigationItems.map((item) => (
          <li key={item.path}>
            {item.icon}
            <span>{item.label}</span>
            <button onClick={() => removeNavigationItem(item.path)}>Remove</button>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          addNavigationItem({ label: 'New Page', path: '/new', icon: <NewPageIcon /> })
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

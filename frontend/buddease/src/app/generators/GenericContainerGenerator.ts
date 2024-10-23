// GenericContainerGenerator.ts

import { AxiosError } from 'axios';
import { NotificationType, NotificationTypeEnum, useNotification } from '@/app/components/support/NotificationContext';

// Define a generic container interface
interface Container<T> {
  data: T;
  isActive: boolean;
  // Add more properties and methods as needed
}

// Define a type for container configuration
type ContainerConfig<T> = {
  name: string;
  generate: () => Container<T>;
  isActive: boolean;
};

// Define a type for the generator props
type ContainerGeneratorProps<T> = {
  initialConfigs: ContainerConfig<T>[];
  onError?: (error: AxiosError<unknown>, errorMessage: string) => void;
};

// Container generator function
const createContainer = <T>(props: ContainerGeneratorProps<T>) => {
  // Use a Map to store the containers with better key support
  const containers: Map<string, Container<T>> = new Map();
  const { notify } = useNotification();  // Destructure notify from useNotification

  // Function to get or generate a container based on its name
  const getContainer = (name: string) => {
    if (!containers.has(name)) {
      try {
        const container = props.initialConfigs.find((config) => config.name === name);
        if (!container) {
          throw new Error(`Container with name ${name} not found in initial configs.`);
        }
        containers.set(name, container.generate());
      } catch (error) {
        if (props.onError) {
          props.onError(error as AxiosError<unknown>, `Failed to generate container for ${name}`);
        } else {
          console.error(error);
        }
      }
    }
    return containers.get(name);
  };

  // Function to get all active containers
  const getActiveContainers = () => {
    return Array.from(containers.values()).filter((container) => container.isActive);
  };

  // Function to connect containers based on user needs
  const connectContainers = (userNeeds: string[]) => {
    // Connect containers based on user needs
    // Implement your logic here
    userNeeds.forEach((need) => {
      const container = getContainer(need);
      // Connect the container based on user needs
      if (container) {
        container.isActive = true;
      } else {
        notify({
          id: `${need}-connect-error`,
          message: `Failed to connect container for ${need}`,
          content: error.message,
          date: new Date(),
          type: NotificationTypeEnum.ERROR,
        });
      }
    });
  };

  return {
    getContainer,
    getActiveContainers,
    connectContainers,
  };
};

export default createContainer;

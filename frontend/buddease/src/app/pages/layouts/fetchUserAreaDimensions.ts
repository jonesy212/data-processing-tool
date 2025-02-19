import { NotificationTypeEnum } from '@/app/components/support/NotificationContext';

interface AreaDimensions {
  width: number;
  height: number;
}

interface FetchOptions {
  elementId?: string; 
  listenForResize?: boolean; 
  onChange?: (dimensions: AreaDimensions) => void; 
}

interface Area {
  prefix: string;
  name: string;
  type: NotificationTypeEnum;
  id: string;
  title: string;
  chatThreadName?: string; 
  chatMessageId?: string; 
  chatThreadId?: string; 
  dataDetails?: { [key: string]: any }; 
  generatorType?: string; 
  dimensions: AreaDimensions; 
}

export const fetchUserAreaDimensions = (options?: FetchOptions): AreaDimensions => {
  const { elementId, listenForResize, onChange } = options || {};

  const getDimensions = (): AreaDimensions => {
    if (elementId) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element with ID "${elementId}" not found.`);
        return { width: 0, height: 0 };
      }
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    } else {
      return { width: window.innerWidth, height: window.innerHeight };
    }
  };

  let dimensions = getDimensions();

  if (listenForResize) {
    window.addEventListener('resize', () => {
      dimensions = getDimensions();
      if (onChange) onChange(dimensions);
    });
  }

  return dimensions;
};

const getChatThreadName = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('/api/chat/threadName');
    const data = await response.json();
    return data.threadName; 
  } catch (error) {
    console.error('Error fetching chatThreadName:', error);
    return undefined;
  }
};

const getChatMessageId = async (): Promise<string | undefined> => {
  try {
    const messageId = sessionStorage.getItem('chatMessageId'); 
    return messageId || undefined;
  } catch (error) {
    console.error('Error fetching chatMessageId:', error);
    return undefined;
  }
};

const generateChatThreadId = (): string => {
  return `thread-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const getDataDetails = async (): Promise<{ [key: string]: any } | undefined> => {
  try {
    const response = await fetch('/api/data/details');
    const details = await response.json();
    return details; 
  } catch (error) {
    console.error('Error fetching dataDetails:', error);
    return undefined;
  }
};

const getGeneratorType = (): string | undefined => {
  const generatorTypes = ['TypeA', 'TypeB', 'TypeC'];
  const randomIndex = Math.floor(Math.random() * generatorTypes.length);
  return generatorTypes[randomIndex];
};

const initializeArea = async (): Promise<Area> => {
  const [chatThreadName, chatMessageId, dataDetails] = await Promise.all([
    getChatThreadName(),
    getChatMessageId(),
    getDataDetails()
  ]);

  const chatThreadId = generateChatThreadId();
  const generatorType = getGeneratorType();
  const dimensions = fetchUserAreaDimensions(); // ✅ Fix: Declare dimensions before usage

  const area: Area = {
    prefix: 'USER',
    name: 'JohnDoe',
    type: NotificationTypeEnum.UserID,
    id: '12345',
    title: 'UserAccount',
    dimensions, 
    ...(chatThreadName && { chatThreadName }),
    ...(chatMessageId && { chatMessageId }), 
    ...(chatThreadId && { chatThreadId }), 
    ...(dataDetails && { dataDetails }), 
    ...(generatorType && { generatorType }), 
  };

  console.log('Initialized Area:', area);

  const options: FetchOptions = {
    elementId: area.id, 
    listenForResize: true, 
    onChange: (dimensions) => {
      console.log(`Updated dimensions for area "${area.name}":`, dimensions);
    }
  };

  const areaDimensions = fetchUserAreaDimensions(options);
  console.log('Initial dimensions:', areaDimensions);

  return area;
};

initializeArea();

export type { Area };

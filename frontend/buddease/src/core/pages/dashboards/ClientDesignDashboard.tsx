// ClientDesignDashboard.tsx
import connectToChatWebSocket from '@/core/components/communications/WebSocket';
import { TodoList } from '@/core/components/lists/TodoList';
import InviteFriends from "@/core/components/referrals/InviteFriends";
import ColorPalette from "@/core/components/styling/ColorPalette";
import TaskManagerComponent from "@/core/components/tasks/TaskManagerComponent";
import NotificationManager from "@/core/features/support/NotificationManager";
import { NotificationType } from '@/core/features/support/UnifiedNotificationTypes';
import { ModalGenerator } from "@/core/generators/GenerateModal";
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { NotificationData } from '@/core/hooks/useNotificationSystem';
import { DesignDashboardBaseProps } from '@/core/pages/dashboards/DesignDashboard';
import useModalFunctions from '@/core/pages/dashboards/ModalFunctions';
import UserDashboard from "@/core/pages/dashboards/UserDashboard";
import PersonaBuilderDashboard from "@/core/pages/personas/recruiterDashboard/PersonaBuilderDashboard";
import ProjectManagementSimulation from "@/core/projects/projectManagement/ProjectManagementSimulation";
import Clipboard from "@/core/ts/clipboard";
import DynamicComponentWrapper from "@/utils/DynamicComponentWrapper";
import { useEffect, useState } from 'react';


interface ClientDesignDashboardProps extends DesignDashboardBaseProps {
    // Client-specific props
    onCloseFileUploadModal: () => void;
    onHandleFileUpload: (file: FileList | null) => void;
  }
  
  const ClientDesignDashboard: React.FC<ClientDesignDashboardProps> = ({
    colors,
    onColorChange,
    onCloseFileUploadModal,
    onHandleFileUpload,
  }) => {
    // Client-specific state
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const { isModalOpen, handleCloseModal, handleFileUpload } = useModalFunctions();
    const [isFileUploadModalOpen, setFileUploadModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
    // Client-specific handlers
    const notify = (message: string, type: NotificationType, content: any, date: Date) => {
      const newNotification: NotificationData = {
        id: UniqueIDGenerator.generateDashboardID(),
        date,
        type,
        message,
        content,
        createdAt: new Date(),
        sendStatus: "Error",
      };
      setNotifications(prev => [...prev, newNotification]);
    };
  
    // Client-specific effects
    useEffect(() => {
      const roomId = "your_room_id";
      const retryConfig = { enabled: true, maxRetries: 3, retryDelay: 1000 };
      const newSocket = connectToChatWebSocket(roomId, retryConfig) as WebSocket;
      if (newSocket) setSocket(newSocket);
  
      return () => {
        if (socket && [socket.OPEN, socket.CONNECTING].includes(0 || 1)) {
          socket.close();
        }
      };
    }, [socket]);
  
    const handleColorChange = (colorIndex: number, newColor: string): string[] => {
      const updatedColors = [...colors];
      updatedColors.splice(colorIndex, 1, newColor);
      onColorChange?.(updatedColors);
      return updatedColors;
    };
  
    return (
      <>
        <h1>Client Design Dashboard</h1>
        
        {/* Client-specific components */}
        <DynamicComponentWrapper
          component={<ProjectManagementSimulation />}
          dynamicProps={{
            condition: () => true,
            asyncEffect: () => Promise.resolve(),
          }}
        />
  
        <ChatRoom
          roomId={""}
          topics={[]}
          chatEvent={(newTitle: string) => newTitle}
        />
  
        <ModalGenerator
          isOpen={isModalOpen}
          closeModal={handleCloseModal}
          modalComponent={FileUploadModal}
          onFileUpload={onHandleFileUpload}
        />
  
        {/* UI Interaction Components */}
        <ColorPalette
          colors={colors}
          onChange={handleColorChange}
        />
  
        <TaskManagerComponent
          newTitle={(newTitle: string) => newTitle}
          task={{} as Task}
        />
  
        <NotificationManager
          notifications={notifications}
          setNotifications={setNotifications}
        />
  
        {/* Other client-only components */}
        <UserDashboard />
        <PersonaBuilderDashboard />
        <TodoList />
        <InviteFriends />
        <Clipboard />
      </>
    );
  };
  
  export default ClientDesignDashboard;
import InviteFriends from "@/app/components/referrals/InviteFriends";
import useModalFunctions from '@/app/pages/dashboards/ModalFunctions';
import UserDashboard from "@/app/pages/dashboards/UserDashboard";
import Clipboard from "@/app/ts/clipboard";
import ProjectManagementSimulation from "@/app/components/projects/projectManagement/ProjectManagementSimulation";
import  connectToChatWebSocket from '@/app/components/communications/WebSocket';
import PersonaBuilderDashboard from "../personas/recruiter_dashboard/PersonaBuilderDashboard";
import { TodoList } from '@app/components/lists/TodoList';
import NotificationManager from "@/app/components/support/NotificationManager";
import TaskManagerComponent from "@/app/components/tasks/TaskManagerComponent";
import DynamicComponentWrapper from "@/app/utils/DynamicComponentWrapper";
import { ModalGenerator } from "@/app/generators/GenerateModal";
import { useEffect } from 'react';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { NotificationType } from '@/app/context/NotificationContext';
import { NotificationData } from '@/app/components/support/NofiticationsSlice';
import { useState } from 'react';
import { DesignDashboardBaseProps } from '@/pages/dashboards/DesignDashboard'
import { ChatRoom } from "@/app/components/communications";
import ColorPalette from "@/app/components/styling/ColorPalette";


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
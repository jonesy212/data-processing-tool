CollaborationDashboard.tsx
import Stopwatch from "@/core/calendar/Stopwatch";
import { ChatRoom } from '@/core/communications/ChatRoom';
import EditorWithPrompt from "@/core/components/documents/EditorWithPrompt";
import ColorPalette from "@/core/components/styling/ColorPalette";
import PaletteManager from "@/core/components/styling/PaletteManager";
import UsageExamplesBox from "@/core/components/styling/UsageExamplesBox";
import ProjectTimelineDashboard from "@/core/dashboards/ProjectTimelineDashboard";
import { useThemeConfig } from "@/core/hooks/userInterface/ThemeConfigContext";
import ProjectManagementSimulation from "@/core/projects/projectManagement/ProjectManagementSimulation";
import { useAuth } from "@/core/state/context/AuthContext";
import { CollaborationProvider } from "@/core/state/context/CollaborationContext";
import { useNotification } from '@/core/state/context/NotificationContext';

import { SearchProvider, useSearch } from "@/core/state/context/SearchContext";
import DynamicNamingConventions from "@/utils/DynamicNamingConventions";
import { AquaConfig } from "@/utils/web3/webConfigs/aqua/AquaConfig";
import { useState } from "react";
import ChatDashboard from "./ChatDashboard";
import CollaborationPanel from "./CollaborationPanel";

const CollaborationDashboard = () => {
  const { searchQuery, updateSearchQuery } = useSearch();
  const { isDarkMode, primaryColor, fontSize } = useThemeConfig();
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  const {notify} = useNotification();
  const auth = useAuth();

const startBrainstorming = () => {
  // Check if the user is authenticated before starting brainstorming
  if (auth.state.isAuthenticated) {
    // Success notification using object format
    notify({
      id: `brainstorming_start_success_${Date.now()}`,
      message: "Brainstorming session started!",
      data: {
        entityType: 'brainstorming_session',
        action: 'start_session',
        userId: auth.state.userId,
        userEmail: auth.state.email,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_SUCCESS,
      level: 'success' as const,
      metadata: {
        sessionType: 'brainstorming',
        feature: 'collaboration',
        isCollaborative: true,
        authMethod: auth.state.authMethod
      }
    });
    // You can also start the Stopwatch or perform other actions related to brainstorming
  } else {
    // Error notification using object format
    notify({
      id: `brainstorming_auth_error_${Date.now()}`,
      message: "Authentication required",
      data: {
        entityType: 'brainstorming_session',
        action: 'start_session',
        authState: {
          isAuthenticated: auth.state.isAuthenticated,
          userId: auth.state.userId,
          userEmail: auth.state.email
        },
        errorType: 'AUTHENTICATION_ERROR',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      type: NotificationTypeEnum.OPERATION_ERROR,
      level: 'error' as const,
      metadata: {
        feature: 'brainstorming',
        requiresLogin: true,
        sessionType: 'collaboration'
      },
      action: {
        label: "Login Now",
        onClick: () => {
          // Navigate to login page or open login modal
          console.log("Navigate to login");
          // auth.login(); // If you have a login function
        }
      }
    });
  }
  // You can also start the Stopwatch or perform other actions related to brainstorming
};

  const openCollaborationPanel = () => {
    setShowCollaborationPanel(true);
  };

  const closeCollaborationPanel = () => {
    setShowCollaborationPanel(false);
  };



  // Function to handle search query updates
  const handleSearchQueryUpdate = (newSearchQuery: string) => {
    updateSearchQuery(newSearchQuery);
  };
  // Use searchQuery in your components or functions based on your requirements
  console.log("Search Query:", searchQuery);
    return (
    <SearchProvider>
      <CollaborationProvider>
        <div
          style={{
            background: isDarkMode ? "#333" : "#fff",
            color: isDarkMode ? "#fff" : "#333",
            fontSize,
          }}
        >
          
          <h1 style={{ color: primaryColor }}>Collaboration Dashboard</h1>
          {/* Project Timeline Dashboard */}
            <ProjectTimelineDashboard />
            


          {/* Project Management Simulation */}
          <ProjectManagementSimulation /> {/* Integrate the component here */}
          
          {/* Button to open the Collaboration Panel */}
          <button onClick={openCollaborationPanel}>
            Create Collaboration Panel
          </button>
          {/* Additional components and elements */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchQueryUpdate(e.target.value)}
            placeholder="Search..."
          />
          <h1>Collaboration Dashboard</h1>
          {/* Your existing components */}
          <button onClick={openCollaborationPanel}>
            Create Collaboration Panel
          </button>
          {/* Collaboration Panel */}
          {showCollaborationPanel && (
            <CollaborationPanel onClose={closeCollaborationPanel} />
          )}
          {/* Dynamic Color Palette Example */}
          <h2>Dynamic Color Palette Example</h2>
          <ColorPalette
            colorCodingEnabled={false}
            brandingSwatches={[]}
            swatches={[]}
          />
          {/* Dynamic Naming Conventions Example */}
          <h2>Dynamic Naming Conventions Example</h2>
          <DynamicNamingConventions dynamicContent />
          {/* Palette Manager Example */}
          <h2>Palette Manager Example</h2>
          <PaletteManager />
          {/* Usage Examples Box */}
          <h2>Usage Examples Box</h2>
          <UsageExamplesBox />
          {/* Dynamic Color Palette Example */}
          <h2>Dynamic Color Palette Example</h2>
          <ColorPalette
            //   dynamicContent
            colorCodingEnabled={false}
            brandingSwatches={[]}
            swatches={[]}
            //   colors={[]} // Add your desired colors or use a state to manage them
          />
          {/* Dynamic Naming Conventions Example */}
          <h2>Dynamic Naming Conventions Example</h2>
          <DynamicNamingConventions dynamicContent />
          {/* Palette Manager Example */}
          <h2>Palette Manager Example</h2>
          <PaletteManager />
          {/* Usage Examples Box */}
          <h2>Usage Examples Box</h2>
          <UsageExamplesBox />
          {/* Editor With Prompt */}
          <EditorWithPrompt userId="123" teamId="456" project="Project ABC" />
          {/* Chat Dashboard */}
          <ChatDashboard aquaConfig={{} as AquaConfig} />
          <h1>Collaboration Dashboard</h1>
          {/* ChatRoom component to display chat */}
            <ChatRoom
              roomId=""
              limit={10}
            />
            {/*Stopwatch */}
            <Stopwatch
              startTime={new Date()}
              endTime={new Date()}
            />
          {/* Start Brainstorming Button */}
          <button onClick={startBrainstorming}>Start Brainstorming</button>
        </div>
      </CollaborationProvider>
    </SearchProvider>
  );
};

export default CollaborationDashboard;

// CollaborationDashboard.tsx
import DynamicNamingConventions from "@/app/components/DynamicNamingConventions";
import { useAuth } from "@/app/components/auth/AuthContext";
import Stopwatch from "@/app/components/calendar/Stopwatch";
import { ChatRoom } from "@/app/components/communications";
import EditorWithPrompt from "@/app/components/documents/EditorWithPrompt";
import { useThemeConfig } from "@/app/components/hooks/userInterface/ThemeConfigContext";
import { CollaborationProvider } from "@/app/components/phases/collaborationPhase/CollaborationContext";
import ProjectManagementSimulation from "@/app/components/projects/projectManagement/ProjectManagementSimulation";
import ProjectTimelineDashboard from "@/app/components/projects/projectManagement/ProjectTimelineDashboard";
import ColorPalette from "@/app/components/styling/ColorPalette";
import PaletteManager from "@/app/components/styling/PaletteManager";
import UsageExamplesBox from "@/app/components/styling/UsageExamplesBox";
import { NotificationType, useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AquaConfig } from "@/app/components/web3/web_configs/AquaConfig";
import { useState } from "react";
import { SearchProvider, useSearch } from "../searchs/SearchContext";
import ChatDashboard from "./ChatDashboard";
import CollaborationPanel from "./CollaborationPanel";
import React from "react";
const CollaborationDashboard = () => {
  const { searchQuery, updateSearchQuery } = useSearch();
  const { isDarkMode, primaryColor, fontSize } = useThemeConfig();
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  const {notify} = useNotification();
  const auth = useAuth();

  const startBrainstorming = () => {
    const startBrainstorming = () => {
      // Check if the user is authenticated before starting brainstorming
      if (auth.state.isAuthenticated) {
        // Example: Notify users about the start of brainstorming activity
        notify(
          "startBrainstorming",
          "Brainstorming session started!",
          NOTIFICATION_MESSAGES.Brainstorming.SESSION_STARTED,
          new Date(),
          "BrainStormingSession" as NotificationType
        );
        // You can also start the Stopwatch or perform other actions related to brainstorming
      } else {
        // Notify users about the need to log in before starting the activity
        notify(
          "startBrainstormingErrorpa",
          "Please log in to start the brainstorming session.",
          NOTIFICATION_MESSAGES.Brainstorming.SESSION_STARTED,
          new Date(),
          "AuthenticationError" as NotificationType);
      }
      // You can also start the Stopwatch or perform other actions related to brainstorming
    };
    return startBrainstorming;
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
          <ChatRoom roomId="" limit={10} /> {/*Stopwatch */}
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

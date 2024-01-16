// DashboardFramework.tsx
import { ApiConfig } from "@/app/configs/ConfigurationService";
import ChatDashboard from "@/app/pages/dashboards/ChatDashboard";
import DataDashboard from "@/app/pages/dashboards/DataDashboard";
import Dashboard from "@/app/pages/dashboards/RecruiterSeekerDashboard";
import UserDashboard from "@/app/pages/dashboards/UserDashboard";
import { DashboardLayout } from "@/app/pages/layouts/DashboardLayout";
import React, { useRef } from "react";
import { processAutoGPTOutputWithSpaCy } from "../Inteigents/AutoGPTSpaCyIntegration";
import { AdminDashboard, AdminDashboardProps } from "../admin/AdminDashboard";
import { useMovementAnimations } from "../animations/movementAnimations/MovementAnimationActions";
import useResizablePanels from "../hooks/userInterface/useResizablePanels";
import { selectUserIdea } from '../state/redux/slices/DocumentSlice';
import DynamicSpacingAndLayout from "../styling/DynamicSpacingAndLayout";
import { AquaConfig } from "../web3/web_configs/AquaConfig";
import MeetingScheduler from "./../communications/scheduler/MeetingScheduler";
import { default as MeetingSchedulerToolbar, default as TeamOverview, default as TeamOverviewToolbar } from "./../communications/scheduler/TeamOverview";
import PhaseDashboard from "./PhaseDashboard";

interface DashboardFrameworkProps {
  children: React.ReactNode;
  activeDashboard: string;
}

const DashboardFramework: React.FC<DashboardFrameworkProps> = ({
  children,
  activeDashboard,
}) => {
  // Use the useResizablePanels hook to manage resizable panels
  const { panelSizes, handleResize } = useResizablePanels();
  const { slide, hide, isSliding, isDragging } = useMovementAnimations();
  const leftPaneRef = useRef<HTMLElement>(null);
  const rightPaneRef = useRef<HTMLElement>(null);
  const appTree = 

  const handleUserIdeaSubmission = async (userIdea: typeof selectUserIdea) => {
      const enhancedPrompt = await processAutoGPTOutputWithSpaCy(userIdea, appTree);

      // Rest of the code...
  }
    
    
  const handleFullscreenMode = () => {
    // Toggle full-screen mode
    const isFullscreen = document.fullscreenElement !== null;

    if (!isFullscreen) {
      // Enter fullscreen mode
      document.documentElement.requestFullscreen();
    } else {
      // Exit fullscreen mode
      document.exitFullscreen();
    }
  };

  const handleToggleLeftPane = () => {
    // Slide/hide the left pane
    const isHidden = leftPaneRef.current?.style.display === "none";

    if (isHidden) {
      slide(300, "left", leftPaneRef);
    } else {
      hide(leftPaneRef);
    }
  };

  const handleToggleRightPane = () => {
    // Slide/hide the right pane
    const isHidden = rightPaneRef.current?.style.display === "none";

    if (isHidden) {
      slide(300, "right", rightPaneRef);
    } else {
      hide(rightPaneRef);
    }
  };
  return (
    <DashboardLayout
      dashboardConfig={{ title: "DashboardFramework", content: children }}
    >
      {/* Additional dashboard-specific layout elements */}
      <aside ref={leftPaneRef}>
        {/* Left pane content */}
        <h3>Left Pane</h3>
        <DynamicSpacingAndLayout
          dynamicContent
          margin="10px"
          padding="20px"
          border="1px solid #ccc"
        />
      </aside>
      {/* Render common layout content and resizable panels */}
      <main>
        {/* Resizable panels with dynamic content */}
        <div style={{ display: "flex", height: "100%" }}>
          {/* Dynamic content for the active dashboard */}
          {activeDashboard === "Dashboard" && <Dashboard />}
          {activeDashboard === "dataDashboard" && <DataDashboard />}
          {activeDashboard === "userDashboard" && <UserDashboard />}
          {activeDashboard === "phaseDashboard" && <PhaseDashboard />}
          {activeDashboard === "phaseDashboard" && (
            <AdminDashboard
              {...({
                ...{},
                children,
                activeDashboard,
                apiConfig: {} as ApiConfig,
              } as AdminDashboardProps)}
            />
          )}
          {activeDashboard === "chatDashboard" && (
            <ChatDashboard aquaConfig={{} as AquaConfig} />
          )}
          {activeDashboard === "meetingScheduler" && <MeetingScheduler />}
          {activeDashboard === "teamOverview" && <TeamOverview />}

          <div style={{ flex: panelSizes[0], overflow: "auto" }}>
            <DynamicSpacingAndLayout
              dynamicContent
              margin="10px"
              padding="20px"
              border="1px solid #ccc"
            />
          </div>
          <div
            style={{
              width: "5px",
              cursor: "ew-resize",
              backgroundColor: "#ddd",
            }}
            onMouseDown={() =>
              handleResize([panelSizes[0] + 5, panelSizes[1], panelSizes[2]])
            }
          ></div>
          <div style={{ flex: panelSizes[1], overflow: "auto" }}>
            <DynamicSpacingAndLayout
              dynamicContent
              margin="10px"
              padding="20px"
              border="1px solid #ccc"
            />
          </div>
          <div
            style={{
              width: "5px",
              cursor: "ew-resize",
              backgroundColor: "#ddd",
            }}
            onMouseDown={() =>
              handleResize([panelSizes[0], panelSizes[1] + 5, panelSizes[2]])
            }
          ></div>
          <div style={{ flex: panelSizes[2], overflow: "auto" }}>
            <DynamicSpacingAndLayout
              dynamicContent
              margin="10px"
              padding="20px"
              border="1px solid #ccc"
            />
          </div>
        </div>
      </main>
      {/* Additional dashboard-specific layout elements */}
      <aside ref={rightPaneRef}>
        {/* Right pane content */}
        <h3>Right Pane</h3>
        <DynamicSpacingAndLayout
          dynamicContent
          margin="10px"
          padding="20px"
          border="1px solid #ccc"
        />
      </aside>
      {/* Additional dashboard-specific layout elements */}
      <footer>
        {/* Full-screen button */}
        <button onClick={handleFullscreenMode}>Toggle Fullscreen</button>
        {/* Toggle left pane button */}
        <button onClick={handleToggleLeftPane}>Toggle Left Pane</button>
        {/* Toggle right pane button */}
        <button onClick={handleToggleRightPane}>Toggle Right Pane</button>
      </footer>
      {/* Display feedback for sliding or dragging animations */}
      {isSliding && <p>Sliding...</p>}
      {isDragging && <p>Dragging...</p>}P{/* Render common layout content */}
      {children}
      {/* Additional toolbar for Meeting Scheduler */}
      {activeDashboard === "meetingScheduler" && <MeetingSchedulerToolbar />}
      {/* Additional toolbar for Team Overview */}
      {activeDashboard === "teamOverview" && <TeamOverviewToolbar />}
    </DashboardLayout>
  );
};

export default DashboardFramework;

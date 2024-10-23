// DashboardFramework.tsx
import {
    AppTree,
    generateInitialAppTree,
} from "@/app/generators/generateAppTree";
import ChatDashboard from "@/app/pages/dashboards/ChatDashboard";
import DataDashboard from "@/app/pages/dashboards/DataDashboard";
import Dashboard from "@/app/pages/dashboards/RecruiterSeekerDashboard";
import UserDashboard from "@/app/pages/dashboards/UserDashboard";
import { DashboardLayout } from "@/app/pages/layouts/DashboardLayout";
import { DocumentActions } from "@/app/tokens/DocumentActions";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AdminDashboard, AdminDashboardProps } from "../admin/AdminDashboard";
import useResizablePanels from "../hooks/userInterface/useResizablePanels";
import { processAutoGPTOutputWithSpaCy } from "../intelligence/AutoGPTSpaCyIntegration";
import { useMovementAnimations } from "../libraries/animations/movementAnimations/MovementAnimationActions";
import DynamicSpacingAndLayout from "../styling/DynamicSpacingAndLayout";
import { AquaConfig } from "../web3/web_configs/AquaConfig";
import MeetingScheduler from "./../communications/scheduler/MeetingScheduler";
import {
    default as MeetingSchedulerToolbar,
    default as TeamOverview,
    default as TeamOverviewToolbar,
} from "./../communications/scheduler/TeamOverview";
import PhaseDashboard from "./PhaseDashboard";
interface DashboardFrameworkProps {
  children: React.ReactNode;
  activeDashboard: string;
}

const DashboardFramework: React.FC<DashboardFrameworkProps> = ({
  children,
  activeDashboard,
}) => {
  const dispatch = useDispatch();
  // Use the useResizablePanels hook to manage resizable panels
  const { panelSizes, handleResize } = useResizablePanels();
  const { slide, hide, isSliding, isDragging } = useMovementAnimations();
  const leftPaneRef = useRef<HTMLElement>(null);
  const rightPaneRef = useRef<HTMLElement>(null);
  // Update appTree with the result from generateInitialAppTree
  const [appTree, setAppTree] = useState<AppTree | null>(null);
  const handleUserIdeaSubmission = async () => {
    const action = DocumentActions.selectUserIdea({
      //todo fix id 
      id: "1234567890",
      type: 'SOME_ACTION_TYPE'
    });

  dispatch(action);

  // Extract the user idea from the action object
  const userIdea = action.payload.type;

  const enhancedPrompt = await processAutoGPTOutputWithSpaCy(userIdea);

  
    if (enhancedPrompt) {
      // Perform actions with the enhanced prompt
      console.log("Enhanced Prompt:", enhancedPrompt);
  
      // Rest of the code...
    } else {
      console.log(
        "Prompt enhancement failed. Please provide a valid user idea."
      );
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      const tree = await generateInitialAppTree();
      setAppTree(tree);
    };

    fetchData();
  }, []);

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


      


      <Link to="/host-screen">Access Host Screen</Link>

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
              {...{} as AdminDashboardProps}
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
      {/* Footer Section */}
      <footer>
        {/* Full-screen button */}
        <button onClick={handleFullscreenMode}>Toggle Fullscreen</button>
        {/* Toggle Left Pane Button */}
        <button onClick={handleToggleLeftPane}>Toggle Left Pane</button>
        {/* Toggle Right Pane Button */}
        <button onClick={handleToggleRightPane}>Toggle Right Pane</button>
        {/* Additional Toolbars for Meeting Scheduler and Team Overview */}
        {appTree && (
          <>
            {activeDashboard === "meetingScheduler" && <MeetingSchedulerToolbar />}
            {activeDashboard === "teamOverview" && <TeamOverviewToolbar />}
          </>
        )}
        {/* Button for Idea Submission */}
        <button onClick={() => handleUserIdeaSubmission()}>Submit Idea</button>      
      </footer>




      {/* Display feedback for sliding or dragging animations */}
      {isSliding && <p>Sliding...</p>}
      {isDragging && <p>Dragging...</p>}
      {/* Render common layout content */}
      {children}
      {/* Additional toolbar for Meeting Scheduler */}
      {activeDashboard === "meetingScheduler" && <MeetingSchedulerToolbar />}
      {/* Additional toolbar for Team Overview */}
      {activeDashboard === "teamOverview" && <TeamOverviewToolbar />}
    </DashboardLayout>
  );
};

export default DashboardFramework;

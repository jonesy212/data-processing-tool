// DashboardComponent.tsx
// DashboardComponent.ts
import React from "react";

import MediaDashboard from "@/core/components/socialMedia/MediaDashboard";
import { DashboardSettings, DashboardTypeEnum } from "@/core/dashboards/DashboardSettings";
import AdapterDashboard from "@/core/pages/dashboards/AdapterDashboard";
import BugTrackingDashboard from "@/core/pages/dashboards/BugTrackingDashboard";
import ChatDashboard from "@/core/pages/dashboards/ChatDashboard";
import CollaborationDashboard from "@/core/pages/dashboards/CollaborationDashboard";
import DataDashboard from "@/core/pages/dashboards/DataDashboard";
import DesignDashboard from "@/core/pages/dashboards/DesignDashboard";
import RealTimeDashboardPage from "@/core/pages/dashboards/RealTimeDashboardPage";
import SearchableVisualFlowDashboard from "@/core/pages/dashboards/SearchableVisualFlowDashboard";
import UserDashboard from "@/core/pages/dashboards/UserDashboard";
import UserPreferencesDashboard from "@/core/pages/dashboards/UserPreferencesDashboard";
import VisualFlowDashboard from "@/core/pages/dashboards/VisualFlowDashboard";
import AnimatedDashboard from "@/core/pages/layouts/AnimatedDashboard";
import PricingDashboard from "./PricingDashboard";
import RecruiterSeekerDashboard from "./RecruiterSeekerDashboard";

interface Props {
  settings: DashboardSettings;
}

const DashboardComponent: React.FC<Props> = ({ settings }) => {
  const {
    dashboardType,
    id,
    label,
    onClick,
    aquaConfig,
    colors,
    frontendStructure,
    backendStructure,
    onCloseFileUploadModal,
    onHandleFileUpload,
    user,
    searchQuery,
    context,
    setState,
    forceUpdate,
    render,
    recruiterData,
    seekerData,
    onRecruiterAction,
    onSeekerAction,
  } = settings;

  switch (settings.dashboardType) {
    case DashboardTypeEnum.AnimatedDashboard:
      return <AnimatedDashboard
        id={id}
        label={label}
        onClick={onClick} />;
    case DashboardTypeEnum.AdapterDashboard:
      return <AdapterDashboard />;
    case DashboardTypeEnum.BugTrackingDashboard:
      return <BugTrackingDashboard />;
    case DashboardTypeEnum.ChatDashboard:
      return <ChatDashboard aquaConfig={aquaConfig} />;
    case DashboardTypeEnum.CollaborationDashboard:
      return <CollaborationDashboard />;
    case DashboardTypeEnum.DataDashboard:
      return <DataDashboard />;
    case DashboardTypeEnum.DesignDashboard:
      return (
        <DesignDashboard
          colors={colors}
          frontendStructure={frontendStructure}
          backendStructure={backendStructure}
          onCloseFileUploadModal={onCloseFileUploadModal}
          onHandleFileUpload={onHandleFileUpload}
        />
      );
    case DashboardTypeEnum.RealTimeDashboardPage:
      return <RealTimeDashboardPage user={user} />;
    case DashboardTypeEnum.RecruiterSeekerDashboard:
      return <RecruiterSeekerDashboard
      recruiterData={recruiterData}
      seekerData={seekerData}
      onRecruiterAction={onRecruiterAction}
      onSeekerAction={onSeekerAction}
      />;
    case DashboardTypeEnum.SearchableVisualFlowDashboard:
      return <SearchableVisualFlowDashboard />;
    case DashboardTypeEnum.UserDashboard:
      return <UserDashboard />;
    case DashboardTypeEnum.UserPreferencesDashboard:
      return <UserPreferencesDashboard />;
    case DashboardTypeEnum.VisualFlowDashboard:
      return <VisualFlowDashboard
        user={user}
        searchQuery={searchQuery}
      />;
    case DashboardTypeEnum.PricingDashboard:
      return (
        <PricingDashboard
          context={context}
          setState={setState}
          forceUpdate={forceUpdate}
          render={render}
        />
      );
    case DashboardTypeEnum.MediaDashboard:
      return <MediaDashboard />;
    default:
      return <div>Dashboard type not supported.</div>;
  }
};

export default DashboardComponent;

// DashboardComponent.ts
import React from "react";

import AdapterDashboard from "@/app/pages/dashboards/AdapterDashboard";
import BugTrackingDashboard from "@/app/pages/dashboards/BugTrackingDashboard";
import ChatDashboard from "@/app/pages/dashboards/ChatDashboard";
import CollaborationDashboard from "@/app/pages/dashboards/CollaborationDashboard";
import DataDashboard from "@/app/pages/dashboards/DataDashboard";
import DesignDashboard from "@/app/pages/dashboards/DesignDashboard";
import RealTimeDashboardPage from "@/app/pages/dashboards/RealTimeDashboardPage";
import SearchableVisualFlowDashboard from "@/app/pages/dashboards/SearchableVisualFlowDashboard";
import UserDashboard from "@/app/pages/dashboards/UserDashboard";
import UserPreferencesDashboard from "@/app/pages/dashboards/UserPreferencesDashboard";
import VisualFlowDashboard from "@/app/pages/dashboards/VisualFlowDashboard";
import AnimatedDashboard from "@/app/pages/layouts/AnimatedDashboard";
import MediaDashboard from "../socialMedia/MediaDashboard";
import { DashboardSettings, DashboardTypeEnum } from "./DashboardSettings";
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

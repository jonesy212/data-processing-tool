RealTimeDashboardPage.tsx
import UserProfileComponent from "@/core/components/community/UserProfileComponent";
import DataFilterForm from "@/core/components/models/data/DataFilterForm";
import NotificationComponent from "@/core/components/notifications/NotificationComponent";
import SearchBar from "@/core/components/routing/SearchBar";
import Sidebar from "@/core/libraries/toolbar/Sidebar";
 
import RealTimeChart from "@/core/components/models/realtime/RealTimeChart"; // Import a real-time chart component
import { User } from "@/core/users/User";
import React, { useState } from "react";
import VisualFlowDashboard from "./VisualFlowDashboard"; // Import your specific dashboard component
interface RealTimeDashboardPageProps {
  user: User; // User object representing the current user
}
interface RealTimeDashboardPageProps {
  user: User;
}

const RealTimeDashboardPage: React.FC<RealTimeDashboardPageProps> = ({
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterSelectionChange = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const userProfile = {
    id: "profileId",
    username: "profileUserName",
    email: "username@email.com",
    _id: "userId",
    tier: "free",
    uploadQuota: 2,
    fullName: "John Doe",
    bio: "Lorem ipsum...",
    userType: "admin",
    hasQuota: false,
    profilePicture: null,
    processingTasks: [],
    traits: null as any,
  };

  return (
      <div>
        <Sidebar>
          <UserProfileComponent userProfile={user} />
        </Sidebar>

        <div>
          <SearchBar onSearch={handleSearchQueryChange} />
          <DataFilterForm onSubmit={(filters, transform) => {}} options={{}} />
          <RealTimeChart
            user={user}
            searchQuery={searchQuery}
            selectedFilters={selectedFilters}
          />
          <VisualFlowDashboard user={user} searchQuery={searchQuery} />
          <NotificationComponent notifications={[]} />
        </div>
      </div>
  );
};

export default RealTimeDashboardPage;

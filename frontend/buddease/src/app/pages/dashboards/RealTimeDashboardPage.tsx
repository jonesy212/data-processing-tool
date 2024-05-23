// RealTimeDashboardPage.tsx
import RootLayout from "@/app/RootLayout";
import { User } from "@/app/components/users/User";
import React, { useState } from "react";
import RealTimeChart from "./RealTimeChart"; // Import a real-time chart component
import VisualFlowDashboard from "./VisualFlowDashboard"; // Import your specific dashboard component
 import DataFilterForm, {
  FilterOptions,
} from "@/app/components/models/data/DataFilterForm";
import Sidebar from "@/app/components/libraries/toolbar/Sidebar";
import NotificationComponent from "@/app/components/notifications/NotificationComponent";
import UserProfileComponent from "@/app/components/community/UserProfileComponent";
import SearchBar from "@/app/components/routing/SearchBar";
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
    <RootLayout>
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
    </RootLayout>
  );
};

export default RealTimeDashboardPage;

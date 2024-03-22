// RealTimeDashboardPage.tsx
import React, { useState } from 'react';
import VisualFlowDashboard from './VisualFlowDashboard'; // Import your specific dashboard component
import SearchBar from './SearchBar'; // Import a search bar component
import FilterOptions from './FilterOptions'; // Import a component for filter options
import RealTimeChart from './RealTimeChart'; // Import a real-time chart component
import Notifications from './Notifications'; // Import a notifications component
import Sidebar from './Sidebar'; // Import a sidebar component
import { User } from '@/app/components/users/User';
import { UserProfile } from '@/app/components/users/userSnapshotData';
import DetailsProps from '@/app/components/models/data/Details';
import { SupportedData } from '@/app/components/models/CommonData';
import CommonDetails from '@/app/components/models/CommonDetails';

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
        <UserProfile user={user} />
      </Sidebar>

      <div>
        <SearchBar onSearch={handleSearchQueryChange} />
        <FilterOptions onSelectFilters={handleFilterSelectionChange} />
        <RealTimeChart
          user={user}
          searchQuery={searchQuery}
          selectedFilters={selectedFilters}
        />
        <VisualFlowDashboard user={user} searchQuery={searchQuery} />
        <Notifications />
      </div>
    </div>
  );
};

export default RealTimeDashboardPage;

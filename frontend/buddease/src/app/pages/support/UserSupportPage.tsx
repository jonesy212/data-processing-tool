// UserSupportPage.tsx
import UserSupportPhaseComponent, { UserSupportPhase } from '@/app/components/libraries/ui/components/UserSupportPhaseComponent';
import React from 'react';




const UserSupportPage: React.FC = () => {
  return (
    <div>
      <h1>User Support Page</h1>
      <UserSupportPhaseComponent initialPhase={UserSupportPhase.PLANNING} />
    </div>
  );
};

export default UserSupportPage;

// UserSupportPage.tsx
import RootLayout from "@/app/RootLayout";
import UserSupportPhaseComponent, {
  UserSupportPhase,
} from "@/app/components/libraries/ui/components/UserSupportPhaseComponent";
import React from "react";

const UserSupportPage: React.FC = () => {
  return (
    <RootLayout>
      <div>
        <h1>User Support Page</h1>
        <UserSupportPhaseComponent initialPhase={UserSupportPhase.PLANNING} />
      </div>
    </RootLayout>
  );
};

export default UserSupportPage;

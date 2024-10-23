// routes/AppRoutes.tsx

import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ProfilePage from '@/app/pages/profile/ProfilePage';
import VerificationPage from '@/app/pages/profile/VerificationPage';
import TeamManagementPage

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/profile" component={ProfilePage} />
        <Route path="/verification" component={VerificationPage} />
        <Route path="/team-management" component={TeamManagementPage} /> {/* Add TeamManagementPage route */}
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default AppRoutes;

import { useAuth } from '@/app/components/auth/AuthContext';
import React from 'react';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const userPersona = state.user?.persona;

  return (
    <div>
      <h1>
        {userPersona === "recruiter" ? "Recruiter Dashboard" : ""}
        {userPersona === "job_seeker" ? "Job Seeker Dashboard" : ""}
      </h1>

      {/* Content based on user persona */}
      {userPersona && <RecruiterDashboardContent />}
      {userPersona && <JobSeekerDashboardContent />}
    </div>
  );
};

// Content components for each persona
const RecruiterDashboardContent: React.FC = () => {
  return (
    <div>
      {/* Content for recruiters */}
      <p>Recruiter-specific content goes here.</p>
    </div>
  );
};

const JobSeekerDashboardContent: React.FC = () => {
  return (
    <div>
      {/* Content for job seekers */}
      <p>Job seeker-specific content goes here.</p>
    </div>
  );
};

export default Dashboard;

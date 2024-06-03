// RecruiterSeekerDashboard.tsx
import React from 'react';

interface RecruiterSeekerDashboardProps {
  // Define any props that this component might need
  recruiterData: any;
  seekerData: any;
  onRecruiterAction: (id: string) => void;
  onSeekerAction: (id: string) => void;
}

const RecruiterSeekerDashboard: React.FC<RecruiterSeekerDashboardProps> = ({
  recruiterData,
  seekerData,
  onRecruiterAction,
  onSeekerAction,
}) => {
  return (
    <div className="recruiter-seeker-dashboard">
      <div className="recruiters-section">
        <h2>Recruiters</h2>
        {recruiterData.map((recruiter: any) => (
          <div key={recruiter.id} className="recruiter-card">
            <h3>{recruiter.name}</h3>
            <p>{recruiter.position}</p>
            <button onClick={() => onRecruiterAction(recruiter.id)}>Action</button>
          </div>
        ))}
      </div>
      <div className="seekers-section">
        <h2>Job Seekers</h2>
        {seekerData.map((seeker: any) => (
          <div key={seeker.id} className="seeker-card">
            <h3>{seeker.name}</h3>
            <p>{seeker.skills.join(', ')}</p>
            <button onClick={() => onSeekerAction(seeker.id)}>Action</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterSeekerDashboard;

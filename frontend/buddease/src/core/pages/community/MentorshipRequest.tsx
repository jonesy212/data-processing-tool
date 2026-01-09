MentorshipRequest.tsx
import React from "react";

interface MentorshipRequest {
    id: string;
    menteeId: string;
    mentorId: string;
    status: MentorshipStatus;
    requestDate: Date;
    mentorshipStartDate: Date;
    mentorshipEndDate: Date;
    description: string;
    // Add other properties relevant to mentorship requests
  }
  
  enum MentorshipStatus {
    Pending = 'Pending',
    Accepted = 'Accepted',
    Rejected = 'Rejected',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Cancelled = 'Cancelled'
  }


// Assuming MentorshipRequest interface exists somewhere
interface MentorshipRequest {
  menteeId: string;
  mentorId: string;
  status: string;
  requestDate: Date;
  description: string;
  mentorshipStartDate: Date;
  mentorshipEndDate: Date;
}

interface MentorshipRequestComponentProps {
  request: MentorshipRequest;
}

const MentorshipRequestComponent: React.FC<MentorshipRequestComponentProps> = ({ request }) => {
  const handleAccept = () => {
    console.log('Accept request:', request.menteeId);
    // Add your accept logic here
  };

  const handleReject = () => {
    console.log('Reject request:', request.menteeId);
    // Add your reject logic here
  };

  const handleInProgress = () => {
    console.log('Mark request as in progress:', request.menteeId);
    // Add your in-progress logic here
  };

  const handleCompleted = () => {
    console.log('Mark request as completed:', request.menteeId);
    // Add your completed logic here
  };

  return (
    <div className="mentorship-request p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-2">
        {request.menteeId} is requesting mentorship from {request.mentorId}
      </h3>
      
      <div className="space-y-2 mb-4">
        <p className="text-sm">
          <span className="font-medium">Status:</span>{' '}
          <span className={`px-2 py-1 rounded text-xs ${
            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
            request.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {request.status}
          </span>
        </p>
        
        <p className="text-sm">
          <span className="font-medium">Request Date:</span>{' '}
          {request.requestDate.toLocaleDateString()}
        </p>
        
        <p className="text-sm">
          <span className="font-medium">Description:</span>{' '}
          {request.description}
        </p>
        
        <p className="text-sm">
          <span className="font-medium">Start Date:</span>{' '}
          {request.mentorshipStartDate.toLocaleDateString()}
        </p>
        
        <p className="text-sm">
          <span className="font-medium">End Date:</span>{' '}
          {request.mentorshipEndDate.toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {request.status === 'pending' && (
          <>
            <button
              onClick={handleAccept}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
            >
              Reject
            </button>
          </>
        )}
        
        {request.status === 'accepted' && (
          <button
            onClick={handleInProgress}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            Mark as In Progress
          </button>
        )}
        
        {request.status === 'in-progress' && (
          <button
            onClick={handleCompleted}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm"
          >
            Mark as Completed
          </button>
        )}
        
        {/* Show status indicator for completed/rejected */}
        {(request.status === 'completed' || request.status === 'rejected') && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
            {request.status === 'completed' ? '✓ Completed' : '✗ Rejected'}
          </span>
        )}
      </div>
    </div>
  );
};

export default MentorshipRequestComponent;

export type { MentorshipRequest, MentorshipStatus };

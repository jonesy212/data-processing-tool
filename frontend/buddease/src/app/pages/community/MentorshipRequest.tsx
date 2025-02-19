// MentorshipRequest.tsx

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


export default function MentorshipRequestComponent({ request }: { request: MentorshipRequest }) {
    return (
        <div className="mentorship-request">
            <h3>{request.menteeId} is requesting mentorship from {request.mentorId}</h3>
            <p>Status: {request.status}</p>
            <p>Request Date: {request.requestDate.toDateString()}</p>
            <p>Description: {request.description}</p>
            <p>Mentorship Start Date: {request.mentorshipStartDate.toDateString()}</p>
            <p>Mentorship End Date: {request.mentorshipEndDate.toDateString()}</p>
            <button>Accept</button>
            <button>Reject</button>
            <button>In Progress</button>
            <button>Completed</button>
        </div>
    )

}

export type { MentorshipRequest, MentorshipStatus };

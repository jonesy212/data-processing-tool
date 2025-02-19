// BugStatusUpdate.tsx
import React from 'react';
import { useState } from 'react';

const BugStatusUpdate = ({ bug, onUpdateStatus }) => {
  const [status, setStatus] = useState(bug.status);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdateStatus(bug.id, status);
  };

  return (
    <div>
      <h2>Update Bug Status</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Status:
          <select value={status} onChange={handleStatusChange}>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </label>
        <button type="submit">Update Status</button>
      </form>
    </div>
  );
};

export default BugStatusUpdate;

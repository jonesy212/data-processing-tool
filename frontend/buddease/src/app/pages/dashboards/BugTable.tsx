// BugTable.tsx

import React from "react";

const BugTable = ({ bugs, onBugClick }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Status</th>
          <th>Assigned To</th>
        </tr>
      </thead>
      <tbody>
        {bugs.map((bug) => (
          <tr key={bug.id} onClick={() => onBugClick(bug)}>
            <td>{bug.id}</td>
            <td>{bug.title}</td>
            <td>{bug.status}</td>
            <td>{bug.assignedTo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BugTable;

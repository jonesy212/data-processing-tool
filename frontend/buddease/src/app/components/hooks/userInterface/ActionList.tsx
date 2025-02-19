import PropTypes from 'prop-types';
import React from 'react';

interface Action {
  name: string;
  description: string;
}

interface ActionListProps {
  actions: Action[];
}

const ActionList: React.FC<ActionListProps> = ({ actions }) => {
  return (
    <div>
      <h2>Action List</h2>
      <ul>
        {actions.map((action, index) => (
          <li key={index}>
            <strong>Name:</strong> {action.name}<br />
            <span><strong>Description:</strong> {action.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

ActionList.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
};

export default ActionList;

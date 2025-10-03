import React from 'react';
import { useDispatch } from 'react-redux';
import { ComponentActions } from './ComponentActions';

const DeleteComponent = () => {
  const dispatch = useDispatch();

  const handleDeleteComponent = () => {
    // Dispatch an action to delete the component
    dispatch(ComponentActions.removeComponent(1)); // Provide the ID of the component to delete
  };

  return (
    <div>
      <h3>Delete Component</h3>
      <p>Are you sure you want to delete this component?</p>
      <button onClick={handleDeleteComponent}>Delete Component</button>
    </div>
  );
};

export default DeleteComponent;

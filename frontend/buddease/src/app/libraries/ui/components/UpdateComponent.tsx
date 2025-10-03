// UpdateComponent.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ComponentActions } from './ComponentActions';

const UpdateComponent = () => {
  const dispatch = useDispatch();
  const [componentName, setComponentName] = useState('');

  const handleUpdateComponent = () => {
    // Dispatch an action to update the component
    dispatch(ComponentActions.updateComponent({ id: 1, updatedComponent: { name: componentName } }));
    // Reset the form after updating the component
    setComponentName('');
  };

  return (
    <div>
      <h3>Update Component Form</h3>
      <label>
        New Component Name:
        <input
          type="text"
          value={componentName}
          onChange={(e) => setComponentName(e.target.value)}
        />
      </label>
      <button onClick={handleUpdateComponent}>Update Component</button>
    </div>
  );
};

export default UpdateComponent;

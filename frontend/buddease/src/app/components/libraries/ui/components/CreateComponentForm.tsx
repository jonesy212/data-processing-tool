import React from "react";
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { ComponentActions } from './ComponentActions';

const CreateComponentForm = ({ ComponentActions: any }: { ComponentActions: typeof ComponentActions }) => { // Specify the correct type for ComponentActions
    const dispatch = useDispatch();
    const [componentName, setComponentName] = useState('');

    const handleCreateComponent = () => {
        // Dispatch an action to add the new component
        dispatch(ComponentActions.addComponent({ name: componentName }));
        // Reset the form after creating the component
        setComponentName('');
    };

    return (
        <div>
            <h3>Create Component Form</h3>
            <label>
                Component Name:
                <input
                    type="text"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                />
            </label>
            <button onClick={handleCreateComponent}>Create Component</button>
        </div>
    );
};

CreateComponentForm.propTypes = {
    ComponentActions: PropTypes.func.isRequired, // PropTypes should expect a function
};

export default CreateComponentForm;

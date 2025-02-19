// FormBuilder.tsx

import React, { useState } from 'react';
import FormInput from './FormInput';

const FormBuilder: React.FC = () => {
  const [formFields, setFormFields] = useState<{ [key: string]: string }>({});

  const handleInputChange = (name: string, value: string) => {
    setFormFields({ ...formFields, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission, you can use the formFields state here
    console.log('Form submitted:', formFields);
  };

  return (
    <div>
      <h1>Form Builder</h1>
      <form onSubmit={handleSubmit}>
        <FormInput
          label="First Name"
          name="firstName"
          value={formFields['firstName'] || ''}
          onChange={handleInputChange}
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={formFields['lastName'] || ''}
          onChange={handleInputChange}
        />
        {/* Add more FormInput components for additional form fields */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormBuilder;

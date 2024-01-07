import React, { useState } from 'react';

interface DynamicInputFieldsProps {
  fields: { label: string; type: string }[];
}

const DynamicInputFields: React.FC<DynamicInputFieldsProps> = ({ fields }) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});

  const handleInputChange = (label: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [label]: value }));
  };

  return (
    <div>
      <h2>Dynamic Input Fields</h2>
      <form>
        {fields.map((field, index) => (
          <div key={index}>
            <label>{field.label}</label>
            <input
              type={field.type}
              value={formData[field.label] || ''}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
            />
          </div>
        ))}
      </form>
      <div>
        <h3>Form Data:</h3>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
};

export default DynamicInputFields;

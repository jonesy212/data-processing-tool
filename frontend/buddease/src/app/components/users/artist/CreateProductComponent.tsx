import React, { useState } from 'react';

interface CreateProductComponentProps {
  onCreateProduct: (productData: any) => void;
}

const CreateProductComponent: React.FC<CreateProductComponentProps> = ({ onCreateProduct }) => {
  const [productData, setProductData] = useState<any>({
    // Initialize product data fields
    title: '',
    description: '',
    type: '',
    // Add more fields as needed for different product types
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreateProduct(productData);
    // Reset form fields after submission
    setProductData({
      title: '',
      description: '',
      type: '',
    });
  };

  return (
    <div>
      <h2>Create Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" name="title" value={productData.title} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea id="description" name="description" value={productData.description} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="type">Type:</label>
          <input type="text" id="type" name="type" value={productData.type} onChange={handleChange} required />
        </div>
        {/* Add more fields for other product types */}
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateProductComponent;

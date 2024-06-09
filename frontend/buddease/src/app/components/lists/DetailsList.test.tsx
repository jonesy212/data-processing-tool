// DetailsList.test.tsx

import React from "react";


import { fireEvent } from '@testing-library/react';
import DetailsList from './DetailsList';

describe('DetailsList component', () => {
  test('renders "Add Detail" button', () => {
      const { getByText } = render(<DetailsList
      
          items={[
            {
              title: 'Product Launch Details',
              description: 'Product launch data',
              data: {
                productId: 'prod123',
                productName: 'Exciting Product',
                productDescription: 'Description of the product launch',
                launchDate: new Date('2024-01-30'),
                price: 29.99,
                inventory: 100,
              },
            },
          ]}
      />);
    const addButton = getByText('Add Detail');
    expect(addButton).toBeInTheDocument();
  });

  test('adds a new detail when "Add Detail" button is clicked', () => {
      const { getByText } = render(<DetailsList
          items={["Detail Items"]}
         renderItem={(item) => (
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          )}
      />);
    const addButton = getByText('Add Detail');

    fireEvent.click(addButton);

    // You can add more assertions here to verify the behavior after clicking the button
  });
});




import { render } from '@testing-library/react';
import BlogList from './BlogList';
import { render } from '@testing-library/react';

describe('BlogList component', () => {
  test('renders blog list correctly', () => {
    // Test rendering logic of BlogList component
    const { getByTestId } = render(<BlogList />);
    const blogListElement = getByTestId('blog-list');
    expect(blogListElement).toBeInTheDocument();
  });

  // Add more test cases as needed to cover different scenarios
});

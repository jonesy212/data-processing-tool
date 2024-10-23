// BlogList.test.tsx
import { render,  } from '@testing-library/react';
import DetailsList from './DetailsList';
import React from "react";

import BlogList from './BlogList';

describe('BlogList component', () => {
  test('renders blog list correctly', () => {
    // Test rendering logic of BlogList component
      const { getByTestId } = render(<BlogList
      />);
    const blogListElement = getByTestId('blog-list');
    expect(blogListElement).toBeInTheDocument();
  });

  // Add more test cases as needed to cover different scenarios
});

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import CommonDetails from './CommonDetails'; // Corrected import path
import React from "react";

describe('CommonDetails', () => {
  it('renders without crashing', () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      details: {  // Add the 'details' property
        id: "1",
        title: 'Test Title',
        description: 'Test Description',
        updatedAt: new Date()
        // Add more data properties as needed
      },
    };

  
    render(<CommonDetails data={mockData} />); // Corrected prop names
    const toggleButton = screen.getByText('Toggle Details') as HTMLElement;
    expect(toggleButton).toBeInTheDocument();
  });
  
  it('toggles details visibility on button click', () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      // Ensure 'data' property is defined with appropriate types
      details: {  // Add the 'details' property
        id: "1",
        title: 'Test Title',
        description: 'Test Description',
        updatedAt: new Date()
        // Add more data properties as needed
      },
    };
  
    render(<CommonDetails data={mockData} />); // Corrected prop name
    const toggleButton = screen.getByText('Toggle Details') as HTMLElement;
    fireEvent.click(toggleButton);
  
    const detailsHeader = screen.getByText('Details') as HTMLElement;
    expect(detailsHeader).toBeInTheDocument();
  });
});

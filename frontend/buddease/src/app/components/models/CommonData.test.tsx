import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen } from '@testing-library/react';
import CommonDetails from './CommonData';

describe('CommonDetails', () => {
  it('renders without crashing', () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      data: {
        // Mock data object
      },
    };

    render(<CommonDetails data={mockData} />);
    const toggleButton = screen.getByText('Toggle Details') as HTMLElement;
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles details visibility on button click', () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      data: {
        // Mock data object
      },
    };

    render(<CommonDetails data={mockData} />);
    const toggleButton = screen.getByText('Toggle Details') as HTMLElement;
    fireEvent.click(toggleButton);

    const detailsHeader = screen.getByText('Details') as HTMLElement;
    expect(detailsHeader).toBeInTheDocument();
  });

  // Add more test cases as needed
});

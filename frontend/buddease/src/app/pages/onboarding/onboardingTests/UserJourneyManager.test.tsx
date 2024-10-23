// UserJourneyManager.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import UserJourneyManager from '../../personas/UserJourneyManager';

jest.mock('axios');

describe('UserJourneyManager', () => {
  it('should render the component and handle questionnaire submission', async () => {
    const mockUserData = { datasets: 'sample', tasks: 'sample', questionnaireResponses: {} };

    jest.mock('@/app/components/auth/AuthContext', () => ({
      useAuth: () => ({ state: { user: { data: mockUserData } } }),
    }));

    render(<UserJourneyManager />);

    // Assume the component starts in the REGISTER phase
    expect(screen.getByText('Email Confirmation')).toBeInTheDocument();

    // Change the phase to QUESTIONNAIRE
    fireEvent.click(screen.getByText('Start Questionnaire'));

    // Fill and submit the questionnaire
    fireEvent.change(screen.getByLabelText('What is your favorite color?'), { target: { value: 'Blue' } });
    fireEvent.click(screen.getByText('Submit'));

    // Wait for the transition to the OFFER phase
    await waitFor(() => expect(screen.getByText('Offer Page')).toBeInTheDocument());

    // Verify that axios.post was called with the correct data
    expect(axios.post).toHaveBeenCalledWith('/api/questionnaire-submit', {
      userResponses: { '1': 'Blue', '2': '', '3': '', '4': '', '5': '', '6': '', '7': '' },
    });
  });
});

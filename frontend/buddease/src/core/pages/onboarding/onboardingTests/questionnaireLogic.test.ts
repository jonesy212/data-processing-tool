questionnaireLogic.test.ts
import { initializeUserData } from "@/core/pages/onboarding/PersonaBuilderData";
import { handleSimpleQuestionnaireSubmit } from '@/core/pages/onboarding/questionnaireLogic';
import { OnboardingPhase } from '@/core/pages/personas/UserJourneyManager';
import axios from 'axios';

jest.mock('axios');

describe('questionnaireLogic', () => {
  const user = { data: { datasets: 'sample', tasks: 'sample' } };

  it('should initialize user data with questionnaire responses', () => {
    const userData = initializeUserData(user);

    expect(userData).toEqual({
      datasets: 'sample',
      tasks: 'sample',
      questionnaireResponses: { '1': '', '2': '', '3': '', '4': '', '5': '', '6': '', '7': '' },
    });
  });

  it('should handle questionnaire submission', async () => {
    const userResponses = { '1': 'Answer 1', '2': 'Answer 2', '3': 'Answer 3' };
    const userData = { 
      id: 'test-user-123',
      username: 'testuser',
      datasets: 'sample', 
      tasks: 'sample', 
      questionnaireResponses: {} 
    };
    const setCurrentPhase = jest.fn();

    // Mock the axios.post function
    (axios.post as jest.Mock).mockResolvedValue({ 
      status: 200, 
      data: { success: true, message: 'Questionnaire saved' } 
    });

    const result = await handleSimpleQuestionnaireSubmit(
      userResponses, 
      userData, 
      setCurrentPhase
    );

    // Verify function calls
    expect(setCurrentPhase).toHaveBeenCalledWith(OnboardingPhase.OFFER);
    expect(axios.post).toHaveBeenCalledWith('/api/questionnaire-submit', {
      userResponses,
      userId: 'test-user-123',
      timestamp: expect.any(String)
    });

    // Verify returned data
    expect(result.questionnaireResponses).toEqual(userResponses);
    expect(result.id).toBe('test-user-123');
    expect(result.username).toBe('testuser');
  });

  it('should handle questionnaire submission error', async () => {
    const userResponses = { '1': 'Answer 1' };
    const userData = { 
      id: 'test-user-123',
      questionnaireResponses: {} 
    };
    const setCurrentPhase = jest.fn();

    // Mock axios error
    (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(
      handleSimpleQuestionnaireSubmit(userResponses, userData, setCurrentPhase)
    ).rejects.toThrow('Network error');
  });
});
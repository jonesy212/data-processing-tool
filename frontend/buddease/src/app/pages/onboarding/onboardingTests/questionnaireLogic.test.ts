// questionnaireLogic.test.ts
import axios from 'axios';
import { handleQuestionnaireSubmit, initializeUserData } from './questionnaireLogic';

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
    const userData = { datasets: 'sample', tasks: 'sample', questionnaireResponses: {} };
    const setCurrentPhase = jest.fn();

    // Mock the axios.post function
    (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: {} });

    await handleQuestionnaireSubmit(userResponses, userData, setCurrentPhase);

    expect(setCurrentPhase).toHaveBeenCalledWith('OFFER');
    expect(axios.post).toHaveBeenCalledWith('/api/questionnaire-submit', {
      userResponses,
    });
  });
});

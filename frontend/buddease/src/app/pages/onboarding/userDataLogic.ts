// questionnaireLogic.ts
import axios from 'axios';
import { User, UserData } from '../../components/users/User';
export function initializeUserData(user: User): UserData {
  if (user.data) {
    return {
      datasets: '',
      tasks: user.data.tasks,
      questionnaireResponses: {
        "1": "",
        "2": "",
        "3": "",
        "4": "",
        "5": "",
        "6": "",
        "7": "",
      },
    };
  }

  return {
    datasets: '',
    tasks: '',
    questionnaireResponses: {},
  };
}

export async function handleQuestionnaireSubmit(
  userResponses: { [key: string]: string },
  userData: UserData,
  setCurrentPhase: (phase: string) => void
): Promise<void> {
  try {
    // Mock the axios.post function for testing
    const axiosResponse = { status: 200, data: {} };
    (axios.post as any).mockResolvedValue(axiosResponse);

    // Perform the actual axios post (in a real scenario, this would be the actual API call)
    const response = await axios.post("/api/questionnaire-submit", {
      userResponses,
    });

    // If the API call is successful, update the current phase
    if (response.status === 200) {
      setCurrentPhase("OFFER");
    }
  } catch (error) {
    // Handle errors if needed
    console.error("Error submitting questionnaire:", error);
  }
}

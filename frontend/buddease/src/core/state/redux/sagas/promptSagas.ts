// promptSagas.ts
import { generateDynamicPrompts } from '@/core/prompts/promptGenerator';
import { call, put, takeEvery } from 'redux-saga/effects';

export const FETCH_PROMPTS_REQUEST = 'FETCH_PROMPTS_REQUEST';

// Define the shape of the action payload
interface GeneratePromptsAction {
  type: typeof FETCH_PROMPTS_REQUEST;
  payload: {
    documentContent: string;
    documentType: string;
    userQuery?: string;
    userIdea?: string;
  };
}


const PROMPT_ACTION_TYPES = {
  FETCH_PROMPTS_SUCCESS: 'FETCH_PROMPTS_SUCCESS',
  FETCH_PROMPTS_FAILURE: 'FETCH_PROMPTS_FAILURE',
  OPERATION_SUCCESS: 'OPERATION_SUCCESS',
  OPERATION_FAILURE: 'OPERATION_FAILURE',
} as const;

// Saga worker function to handle generating prompts
function* handleGeneratePrompts(action: GeneratePromptsAction) {

  const { documentContent, documentType, userQuery, userIdea } = action.payload;

  try {
    // Generate prompts based on the provided parameters
    const prompts: string[] = yield call(
      generateDynamicPrompts,
      documentContent,
      documentType,
      userQuery,
      userIdea
    );

    // Dispatch success action with generated prompts
    yield put({ type: GeneratePromptsAction.FETCH_PROMPTS_SUCCESS, payload: { prompts } });
    yield put({ type: GeneratePromptsAction.OPERATION_SUCCESS, payload: { message: 'Prompts generated successfully' } });
  } catch (error: any) {
    // Dispatch failure action if an error occurs
    yield put({ type: GeneratePromptsAction.FETCH_PROMPTS_FAILURE, payload: { error: error.message } });
    yield put({ type: GeneratePromptsAction.OPERATION_FAILURE, payload: { message: 'Failed to generate prompts' } });
  }
}

// Saga watcher function to listen for FETCH_PROMPTS_REQUEST action
function* watchGeneratePrompts(): Generator {
  yield takeEvery(FETCH_PROMPTS_REQUEST, handleGeneratePrompts);
}

// Export the root saga function to be used in store configuration
export default function* promptSagas(): Generator {
  yield watchGeneratePrompts();
  // Add more saga watchers if needed
}

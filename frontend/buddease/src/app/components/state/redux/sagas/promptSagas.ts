import { call, put, takeEvery } from 'redux-saga/effects';
import { generateDynamicPrompts } from '@/app/components/prompts/promptGenerator';
import { NOTIFICATION_TYPES, FETCH_PROMPTS_REQUEST } from '@/app/components/support/NotificationTypes';

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

// Saga worker function to handle generating prompts
function* handleGeneratePrompts(
  action: GeneratePromptsAction
): Generator<
  ReturnType<typeof call> | ReturnType<typeof put>, // values that `yield` returns
  void,                                            // return type of the generator
  any                                              // type of values injected back (resolved promises)
> {
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
    yield put({ type: NOTIFICATION_TYPES.FETCH_PROMPTS_SUCCESS, payload: { prompts } });
    yield put({ type: NOTIFICATION_TYPES.OPERATION_SUCCESS, payload: { message: 'Prompts generated successfully' } });
  } catch (error: any) {
    // Dispatch failure action if an error occurs
    yield put({ type: NOTIFICATION_TYPES.FETCH_PROMPTS_FAILURE, payload: { error: error.message } });
    yield put({ type: NOTIFICATION_TYPES.OPERATION_FAILURE, payload: { message: 'Failed to generate prompts' } });
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

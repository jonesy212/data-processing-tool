import useApiUserPreferences from '@/app/api/preferences/ApiUserPreferences';
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { all, call, put } from 'redux-saga/effects';

import userPreferencesSagas from '../userPreferencesSaga';
import brandingPreferencesSaga from './brandingPreferencesSaga';
import { communicationPreferencesSaga } from './communicationPreferencesSaga';
import visualPreferencesSaga from './visualPreferencesSaga';
// Import other preference saga files...

// Worker Saga: Fetch User Preferences
export function* fetchUserPreferencesSaga(): Generator<any, void, any> {
    try {
        // Call the API to fetch user preferences
        const userPreferences = yield call(useApiUserPreferences().fetchUserPreferences);
        // Dispatch an action to update the store with fetched user preferences
        // yield put(UserPreferencesActions.fetchUserPreferencesSuccess(userPreferences));
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        // Dispatch an action to show error notification
        yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to fetch user preferences.' });
    }
}

export function* userPreferencesSagaManager() {
    try {
        yield all([
            communicationPreferencesSaga(),
            brandingPreferencesSaga(),
            visualPreferencesSaga(),
            userPreferencesSagas(),
            // Include other preference sagas...
        ]);
    } catch (error) {
        console.error('Error in preference sagas:', error);
        // Dispatch an action to show a generic error notification for all preference sagas
        yield put({ type: NOTIFICATION_MESSAGES.Preferences.PREFERENCE_SAGAS_ERROR, payload: 'An error occurred in preference sagas.' });
    }
}

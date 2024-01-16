// authorizationSagas.ts
import { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { authService } from '../services'; // Replace with your actual authentication service
import { loginSuccess, logout } from '../slices/authorizationSlice';

function* handleLogin(action: PayloadAction<{ username: string; password: string }>) {
  try {
    const { username, password } = action.payload;
    const response = yield call(authService.login, username, password);
    yield put(loginSuccess({ accessToken: response.accessToken }));
  } catch (error) {
    // Handle login error
  }
  return yield put({
    type: 'notification/show',
    payload: {
      message: 'Login failed. Please try again.',
      variant: 'error'
    }
  })
}

function* handleLogout() {
  // Handle logout logic, e.g., clear tokens, navigate to login page, etc.
  yield put(logout());
}

export function* watchAuthorization() {
  yield takeLatest('authorization/login', handleLogin);
  yield takeLatest('authorization/logout', handleLogout);
  // Other authorization-related sagas
}

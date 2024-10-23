// authorizationSagas.ts
import authService from '@/app/components/auth/AuthService';
import { PayloadAction } from '@reduxjs/toolkit';
import { Effect, call, put, takeLatest } from 'redux-saga/effects';
import { loginSuccess, logout } from '../slices/AuthorizationSlice';

function* handleLogin(action: PayloadAction<{ username: string; password: string }>): Generator<Effect, void, any> {
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

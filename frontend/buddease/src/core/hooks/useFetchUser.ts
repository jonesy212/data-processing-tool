// useFetchUser.ts
import { UserActions } from '@/core/actions/UserActions';
import { userService } from '@/core/api/ApiUser';
import isValidAuthToken from '@/core/server/security/AuthValidation';
import { sendNotification } from '@/core/state/redux/slices/UserSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useFetchUser = (userId: string, authToken: string) => { // Add authToken parameter
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isValidAuthToken(authToken)) {
      throw new Error('Invalid authentication token');
    }

    userService.fetchUser(userId, authToken) // Pass the authToken to the fetchUser function
      .then((userData) => {
        dispatch(UserActions.fetchUserSuccess({ user: userData }));
        sendNotification(`User with ID ${userId} fetched successfully`);
      })
      .catch((error) => {
        dispatch(UserActions.fetchUserFailure(error));
        sendNotification(`Error fetching user with ID ${userId}: ${error}`);
      });
  }, [dispatch, userId, authToken]); // Dependency array to ensure useEffect runs only once
};

export default useFetchUser;

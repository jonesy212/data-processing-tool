import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { UserActions } from '../users/UserActions';
import isValidAuthToken from '../security/AuthValidation';
import { userService } from '../users/ApiUser';
import { sendNotification } from '../users/UserSlice';

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

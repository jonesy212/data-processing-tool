// useUserProfile.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import useUserProfile from './useUserProfile';

describe('useUserProfile', () => {
  it('should update user profile', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile());

    const newProfileData = { name: 'John Doe' };

    // Update the user profile
    act(() => {
      result.current.updateProfile(newProfileData);
    });

    // Wait for the update to reflect in the state
    await waitForNextUpdate();

    expect(result.current.userProfile).toEqual(newProfileData);
  });

  it('should update user persona data', () => {
    const { result } = renderHook(() => useUserProfile());

    const newPersonaData = { age: 30, occupation: 'Engineer' };

    // Update user persona data
    act(() => {
      result.current.updatePersonaData(newPersonaData);
    });

    expect(result.current.userProfile.personaData).toEqual(newPersonaData);
  });

  it('should fetch user profile data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserProfile());

    // Fetch user profile data
    act(() => {
      result.current.getUserProfile();
    });

    // Wait for the data to be fetched and updated in the state
    await waitForNextUpdate();

    expect(result.current.userProfile).not.toBeNull();
  });
});

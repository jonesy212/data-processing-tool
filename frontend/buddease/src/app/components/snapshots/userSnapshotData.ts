// userSnapshotData.ts
import MyPromise from '../../utils/MyPromise';
import useUserProfile from '../hooks/useUserProfile';
import CommonDetails from '../models/CommonDetails';
import { User, UserData } from '../users/User';
import UserRoles from '../users/UserRoles';

export type UserProfile = UserData & User;

const saveProfile = (profileData: UserProfile) => {
  // Assuming an asynchronous operation to save profile data
  return new MyPromise((resolve: any, reject: any) => {
    // Implementation to save profile data asynchronously
    setTimeout(() => {
      console.log("Profile data saved:", profileData);
      resolve(profileData);
    }, 1000);
  });
};



// Use the useUserProfile hook
const userProfile = useUserProfile();

const myInitUserSnapshotData = {
  then: (onfulfilled: any, onrejected: any) => {
    return new MyPromise((resolve: any, reject: any) => {
      try {
        const result = onfulfilled ? onfulfilled(userProfile) : userProfile;
        resolve(result);
      } catch (error) {
        if (onrejected) { 
          onrejected(error);
        } else {
          reject(error);
        }
      }
    });
  },
  catch: (onrejected: any) => {
    return new MyPromise((resolve: any, reject: any) => {
      try {
        const result = onrejected ? onrejected(userProfile) : userProfile;
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  finally: (onfinally: any) => {
    return new MyPromise((resolve: any) => {
      try {
        const result = onfinally ? onfinally() : undefined;
        resolve(result);
      } catch (error) {
        console.error(error);
        resolve(undefined);
      }
    });
  },
  [Symbol.toStringTag]: '',
  // Add a then method to return a promise
  // Adjust this based on the actual behavior you want

};

const myProfileData: UserProfile = {
  id: 'profileId',
  username: 'profileUserName',
  email: 'username@email.com',
  _id: 'userId',
  tier: 'free',
  uploadQuota: 2,
  fullName: 'John Doe',
  bio: 'Lorem ipsum...',
  userType: 'admin',
  hasQuota: false,
  profilePicture: null,
  processingTasks: [],
  role: UserRoles.Member,
  traits: {} as typeof CommonDetails,
};

const myGenericData = {
  _id: '',
  id: '',
  title: '',
  status: 'pending',
  isActive: false,
  tags: [],
  then: (onfulfilled: any, onrejected: any) => {
    return new MyPromise((resolve: any, reject: any) => {
      try {
        const result = onfulfilled ? onfulfilled(userProfile) : userProfile;
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  analysisType: '',
  analysisResults: [],
};

// Usage
const profileData = myInitUserSnapshotData.then(
  (data: any): Promise<void> => {
    if (data) {
      return data;
    } else {
      throw new Error("No profile data");
    }
  },
  (error: any) => {
    console.error(error);
    throw error;
  }
);

saveProfile(profileData as MyPromise & UserProfile);

export default myInitUserSnapshotData;

export { myGenericData, myInitUserSnapshotData, myProfileData, saveProfile };

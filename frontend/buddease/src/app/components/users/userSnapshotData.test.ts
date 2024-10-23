// userSnapshotData.test.ts
import useUserProfile from "../hooks/useUserProfile";
import { myInitUserSnapshotData } from "../snapshots/userSnapshotData";

jest.mock("../hooks/useUserProfile");

const mockUseUserProfile = useUserProfile as jest.Mock;

describe("User Snapshot Data Tests", () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    mockUseUserProfile.mockReset();
  });

  test("Empty Profile Data", async () => {
    // Mock useUserProfile to return empty profile data
    mockUseUserProfile.mockReturnValueOnce(null);

    // Execute myInitUserSnapshotData.then()
    const result = myInitUserSnapshotData.then(
      (data: any) => {
        // No need for onrejected in this scenario
        // Convert id to string
        if (data) {
          data.id = data.id.toString();
        }

        return data;
      },
      (error: any) => {
        console.error(error);
        throw error;
      }
    );

    // Ensure that the result is null, as the profile data is empty
    await expect(result).resolves.toBeNull();
  });

  test("Different Data Types", async () => {
    // Mock useUserProfile to return profile data with different data types
    mockUseUserProfile.mockReturnValueOnce({
      id: 1,
      username: "profileUserName",
      email: "username@email.com",
      tier: "free",
      uploadQuota: 2,
      fullName: "John Doe",
      bio: "Lorem ipsum...",
      userType: "admin",
      hasQuota: false,
      profilePicture: null,
      processingTasks: [],
    });

    // Execute myInitUserSnapshotData.then()
    const result = myInitUserSnapshotData.then(
      (data: any) => {
        // No need for onreject in this scenario
        // Convert id to string
        if (data) {
          data.id = data.id.toString();
        }

        return data;
      },
      (error: any) => {
        console.error(error);
        throw error;
      }
    );

    expect(result).toEqual({
      id: "1",
      username: "profileUserName",
      email: "username@email.com",
      tier: "free",
      uploadQuota: 2,
      fullName: "John Doe",
      bio: "Lorem ipsum...",
      userType: "admin",
      hasQuota: false,
      profilePicture: null,
      processingTasks: [],
    });
  });

  test("Error Handling - Invalid Data", async () => {
    // Mock useUserProfile to return invalid profile data
    mockUseUserProfile.mockReturnValueOnce({
      id: 'invalidId',
      username: 123, // Invalid data type
      email: "invalid@email.com",
      tier: "free",
      uploadQuota: 2,
      fullName: "Invalid User",
      bio: "Lorem ipsum...",
      userType: "admin",
      hasQuota: false,
      profilePicture: null,
      processingTasks: [],
    });

    // Execute myInitUserSnapshotData.then()
    const result = myInitUserSnapshotData.then(
      (data: any) => {
        // No need for onreject in this scenario
        // Convert id to string
        if (data) {
          data.id = data.id.toString();
        }

        return data;
      },
      (error: any) => {
        console.error(error);
        throw error;
      }
    );

    // Ensure that the result is an error due to invalid data
    await expect(result).rejects.toThrowError("Invalid data type");
  });

  // Add more tests for other scenarios as needed
});

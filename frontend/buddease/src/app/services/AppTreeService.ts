import { fetchUserIdsFromDatabase } from "../api/ApiDatabase";
import { getUserData, getUsersData } from "../api/UsersApi";
import { useTaskManagerStore } from "../components/state/stores/TaskStore ";

class AppTreeService {
  // Function to fetch user IDs from the database
  static async getUserIds(): Promise<string[]> {
    try {
      const taskId = useTaskManagerStore().taskId
      // Fetch user IDs from the database
      const userIds = await fetchUserIdsFromDatabase(String(taskId));
      return userIds;
    } catch (error) {
      console.error("Error fetching user IDs:", error);
      return []; // Return an empty array or handle as needed
    }
  }

  // Fetch single user data
  static async getTree() {
    try {
      const userIds = await this.getUserIds(); // Get user IDs
      if (userIds.length === 0) {
        throw new Error("No user IDs found.");
      }

      // Fetch data for the first user ID as an example
      const usersData = await getUserData(userIds[0]);
      return usersData;
    } catch (error) {
      console.error("Error fetching app tree:", error);
      return null;
    }
  }

  // Fetch data for multiple users
  static async getTrees() {
    try {
      const userIds = await this.getUserIds(); // Get user IDs
      if (userIds.length === 0) {
        throw new Error("No user IDs found.");
      }

      // Fetch data for all user IDs
      const usersData = await getUsersData(userIds);
      return usersData;
    } catch (error) {
      console.error("Error fetching app trees:", error);
      return null;
    }
  }
}

export default AppTreeService;

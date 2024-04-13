// AppTreeService.ts
import { getUserData, getUsersData } from "../api/UsersApi";
import { userId } from "../components/users/ApiUser";

class AppTreeService {
  static async getTree() {
    try {

      const usersData = await getUserData(String(userId)); // Call getUsersData function instead of generateInitialAppTree
      return usersData;
    } catch (error) {
      console.error("Error fetching app tree:", error);
      return null;
    }
  }


  static async getTrees() {
    try {

      const userIds = [userId1, userId2, userId3]; // Get list of user IDs
      const usersData = await getUsersData(userIds);
      return usersData;

    } catch (error) {
      console.error("Error fetching app trees:", error);
      return null;
    }
  }
}
export default AppTreeService;

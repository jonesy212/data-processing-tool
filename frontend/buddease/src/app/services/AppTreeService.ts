// AppTreeService.ts
import { getUsersData } from "../api/UsersApi";
import { generateInitialAppTree } from "../generators/generateAppTree";

class AppTreeService {
  static async getTree() {
    try {
      const initialAppTree = await generateInitialAppTree();
      return initialAppTree;
    } catch (error) {
      console.error("Error fetching app tree:", error);
      return null;
    }
  }
}

export default AppTreeService;
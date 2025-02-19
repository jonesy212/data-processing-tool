// Client.ts
import MemberData from "../models/teams/TeamMembers";
import  { Project } from "../projects/Project";

interface Client extends MemberData {
    name: string;
    company: Company;
    projects: Project[];
    // Add other client-specific properties here
}
  
  export default Client;
  
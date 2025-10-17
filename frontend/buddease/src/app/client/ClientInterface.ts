// ClientInterface.ts

import { Company } from '@/app/client/Company';
import { Project } from "@/app/models/projects/Project";
import MemberData from "@/app/models/teams/TeamMembers";

interface Client extends MemberData {
    name: string;
    company: Company;
    projects: Project[];
    // Add other client-specific properties here
}
  
  export default Client;
  
// ClientInterface.ts

import { Company } from '@/core/client/Company';
import { Project } from "@/core/models/projects/Project";
import MemberData from "@/core/models/teams/TeamMembers";

interface Client extends MemberData {
    name: string;
    company: Company;
    projects: Project[];
    // Add other client-specific properties here
}
  
  export default Client;
  
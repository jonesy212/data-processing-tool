// SenderTypes.ts

import { Sender } from "../communications/chat/Communication";

interface StudentSender extends Sender {
    studentDetails: {
      school: string;
      grade: string;
    };
  }
  
  interface CryptoSender extends Sender {
    cryptoDetails: {
      walletAddress: string;
      tokenBalance: number;
    };
  }
  
  interface ProjectOwnerSender extends Sender {
    ownerDetails: {
      projectsManaged: number;
      isPremium: boolean;
    };
  }
  
  interface ClientSender extends Sender {
    clientDetails: {
      companyName: string;
      contractEndDate: string;
    };
  }
  
  interface FreelancerSender extends Sender {
    freelancerDetails: {
      skills: string[];
      availability: string; // e.g., "Full-time", "Part-time", "Freelance"
    };
  }
  
  interface EducatorSender extends Sender {
    educatorDetails: {
      subjects: string[];
      institution: string;
    };
  }
  
  interface ResearchAnalystSender extends Sender {
    researchDetails: {
      focusArea: string;
      publishedPapers: number;
    };
  }

  interface StudentDetails {
    school: string;
    grade: string;
  }
  
  interface CryptoDetails {
    walletAddress: string;
    tokenBalance: number;
  }

export type { StudentSender,
    CryptoSender,
    ProjectOwnerSender,
    ClientSender,
    FreelancerSender,
    EducatorSender,
    ResearchAnalystSender,
    StudentDetails,
    CryptoDetails,
 }






// Example usage:
const sender1: StudentSender = {
    id: "123",
    username: "student123",
    firstName: "Alice",
    lastName: "Smith",
    email: "alice.smith@example.com",
    tags: ["student", "math"],
    isUserMessage: true,
    tier: "basic",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    studentDetails: {
      school: "High School X",
      grade: "10th",
    },
  };
  
  const sender2: CryptoSender = {
    id: "456",
    username: "cryptoKing",
    firstName: "Bob",
    lastName: "Jones",
    email: "bob.jones@example.com",
    tags: ["crypto", "NFT"],
    isUserMessage: true,
    tier: "pro",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cryptoDetails: {
      walletAddress: "0x1234abcd",
      tokenBalance: 100,
    },
  };
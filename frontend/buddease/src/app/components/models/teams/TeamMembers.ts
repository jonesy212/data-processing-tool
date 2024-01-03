export interface TeamMember {
    id: number;
    username: string;
    email: string;
    password: string;
    tier: string;
    upload_quota: number;
    user_type: string;
    // Add other TeamMember-related fields as needed
  }
  
  // Example usage:
  const teamMember: TeamMember = {
    id: 1,
    username: "user1",
    email: "user1@example.com",
    password: "password1",
    tier: "free",
    upload_quota: 0,
    user_type: "individual",
    // Add other TeamMember-related field values
  };
  
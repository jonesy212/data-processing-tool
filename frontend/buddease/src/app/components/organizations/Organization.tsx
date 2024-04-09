interface Organization {
    id: string;
    name: string;
    description: string;
    location: string;
    members: string[]; // Array of member IDs
    // Add other organization-specific properties here
  }
  
  class OrganizationManager {
    private organization: Organization;
  
    constructor(organization: Organization) {
      this.organization = organization;
    }
  
    public getOrganization(): Organization {
      return this.organization;
    }
  
    public addMember(memberId: string): void {
      if (!this.organization.members.includes(memberId)) {
        this.organization.members.push(memberId);
        console.log(`Member with ID ${memberId} added to the organization.`);
      } else {
        console.log(`Member with ID ${memberId} is already a member of the organization.`);
      }
    }
  
    public removeMember(memberId: string): void {
      const index = this.organization.members.indexOf(memberId);
      if (index !== -1) {
        this.organization.members.splice(index, 1);
        console.log(`Member with ID ${memberId} removed from the organization.`);
      } else {
        console.log(`Member with ID ${memberId} is not found in the organization.`);
      }
    }
  
    // Add other organization management methods as needed
  }
  
  // Example usage:
  const organization: Organization = {
    id: 'org123',
    name: 'Example Organization',
    description: 'A sample organization for demonstration purposes',
    location: 'City, Country',
    members: ['member1', 'member2'] // Initial members
  };
  
  const organizationManager = new OrganizationManager(organization);
  console.log('Current organization:', organizationManager.getOrganization());
  
  // Add a new member
  organizationManager.addMember('newMember');
  console.log('Updated organization:', organizationManager.getOrganization());
  
  // Remove an existing member
  organizationManager.removeMember('member2');
  console.log('Updated organization:', organizationManager.getOrganization());
  
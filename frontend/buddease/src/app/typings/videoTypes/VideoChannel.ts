// Define the VideoChannel interface
interface VideoChannel {
    id: string;
    name: string;
    description: string;
    members: string[]; // Array of member IDs
    isPrivate: boolean;
    createdAt: Date;
    // Additional properties
    createdBy: string; // ID of the user who created the channel
    updatedAt: Date; // Date when the channel was last updated
    // Add more properties as needed
  }
  
  // Define the VideoChannel class
  class VideoChannel {
    constructor(
      public id: string,
      public name: string,
      public description: string,
      public members: string[],
      public isPrivate: boolean,
      public createdAt: Date,
      public createdBy: string,
      public updatedAt: Date
    ) {}
    
    // Method to add a member to the channel
    addMember(memberId: string) {
      if (!this.members.includes(memberId)) {
        this.members.push(memberId);
      }
    }
    
    // Method to remove a member from the channel
    removeMember(memberId: string) {
      this.members = this.members.filter(id => id !== memberId);
    }
    
    // Method to update channel information
    updateChannel(name: string, description: string, isPrivate: boolean) {
      this.name = name;
      this.description = description;
      this.isPrivate = isPrivate;
      this.updatedAt = new Date();
    }
    
    // Other methods for managing the video channel
  }
  
  export default VideoChannel;
  
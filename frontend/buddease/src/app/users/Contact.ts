// Contact.ts
interface Contact {
    id: number;
    name: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    // Add other contact-specific properties here
  }
  
  // Example usage
  const contacts: Contact[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "123-456-7890",
      address: "123 Main St, City, Country"
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com"
    }
  ];
  
  // Function to display contact details
  const displayContactDetails = (contact: Contact) => {
    console.log(`Contact Details for ${contact.name}:`);
    console.log(`Email: ${contact.email}`);
    if (contact.phoneNumber) {
      console.log(`Phone Number: ${contact.phoneNumber}`);
    }
    if (contact.address) {
      console.log(`Address: ${contact.address}`);
    }
  };
  
  // Display details for each contact
  contacts.forEach(contact => {
    displayContactDetails(contact);
  });
  
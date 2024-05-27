interface Language {
  code: string;
  name: string;
  // Add any other properties as needed
}



interface TimeZone {
    id: string;
    offset: string;
    name: string;
  }
  
  interface CrossCulturalCommunication {
    userId: string;
    preferences: {
      language: string;
      timeZone: string;
    };
  }


  export type { CrossCulturalCommunication, Language, TimeZone };


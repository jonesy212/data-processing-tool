// generateDraftJSON.tsx
const generateDraftJSON = (draft: any): string => {
    try {
      // Convert the draft object to JSON string
      const draftJSON = JSON.stringify(draft);
      
      // Return the JSON string
      return draftJSON;
    } catch (error) {
      console.error("Error generating draft JSON:", error);
      throw error;
    }
  };
  
  export default generateDraftJSON;
  
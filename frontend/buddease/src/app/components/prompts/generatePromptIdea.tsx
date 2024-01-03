// Function to generate a prompt based on the user's idea
const generatePrompt = (userIdea: any) => {
    // Ensure the user's idea is not empty
    if (!userIdea) {
      console.error('Invalid user idea. Cannot generate prompt.');
      return null; // You can handle this error case as needed
    }
  
    // Construct a dynamic prompt using the user's idea
    const prompt = `You are a professional at ${userIdea}. You have the expertise and experiences to answer any questions.`;
  
    return prompt;
  };
  
  // Example usage:
  const userIdea = 'web development'; // Replace with the actual user's idea
  const generatedPrompt = generatePrompt(userIdea);
  
  if (generatedPrompt) {
    console.log(generatedPrompt);
  } else {
    console.log('Prompt generation failed. Please provide a valid user idea.');
  }
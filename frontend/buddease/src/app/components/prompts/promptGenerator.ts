// promptGenerator.ts
export const generatePrompt = (userIdea: any): string | null => {
    if (!userIdea) {
      console.error('Invalid user idea. Cannot generate prompt.');
      return null;
    }
    const prompt = `You are a professional at ${userIdea}. You have the expertise and experiences to answer any questions.`;
    return prompt;
  };
  
// wordCount.js

// Function to calculate the word count in the editor content
const calculateWordCount = (editorContent) => {
    // Split the content into words using whitespace as the delimiter
    const words = editorContent.trim().split(/\s+/);
    // Return the number of words
    return words.length;
  };
  
  // Export the function for external use
  export default calculateWordCount;
  
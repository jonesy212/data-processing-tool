/**
 * Extracts text between start and end offsets from the given input text.
 * @param inputText - The input text from which to extract the substring.
 * @param startOffset - The start offset of the substring.
 * @param endOffset - The end offset of the substring.
 * @returns The extracted text between the specified offsets.
 */

const getTextBetweenOffsets = (
    inputText: string,
    startOffset: number,
    endOffset: number
  ): string => {
    // Ensure startOffset is within bounds
    const adjustedStartOffset = Math.max(0, startOffset);
  
    // Ensure endOffset is within bounds
    const adjustedEndOffset = Math.min(inputText.length, endOffset);
  
    // Extract the substring based on the adjusted offsets
    const extractedText = inputText.substring(adjustedStartOffset, adjustedEndOffset);
  
    return extractedText;
  };
  
  // Example usage:
  const inputText = "This is an example text.";
  const startOffset = 5;
  const endOffset = 12;
  
  const result = getTextBetweenOffsets(inputText, startOffset, endOffset);
  console.log(result); // Output: "is an ex"
  
  export { getTextBetweenOffsets };

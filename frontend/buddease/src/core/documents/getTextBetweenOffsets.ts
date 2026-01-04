getTextBetweenOffsets.ts
/**
 * Extracts text between start and end offsets from the given input text.
 * @param inputText - The input text from which to extract the substring.
 * @param startOffset - The start offset of the substring.
 * @param endOffset - The end offset of the substring.
 * @returns The extracted text between the specified offsets.
 */
app/utils/string/offsetUtils.ts

/**
 * Extracts text between start and end offsets with bounds checking
 */
export const getTextBetweenOffsets = (
  inputText: string,
  startOffset: number,
  endOffset: number
): string => {
  const adjustedStart = Math.max(0, Math.min(startOffset, inputText.length));
  const adjustedEnd = Math.max(adjustedStart, Math.min(endOffset, inputText.length));
  
  return inputText.substring(adjustedStart, adjustedEnd);
};

/**
 * Alternative implementation with more options
 */
export const extractText = (
  text: string,
  start: number,
  end: number,
  options: { clampBounds?: boolean } = { clampBounds: true }
): string => {
  if (!options.clampBounds && (start < 0 || end > text.length)) {
    throw new Error('Offset out of bounds');
  }
  
  const safeStart = Math.max(0, start);
  const safeEnd = Math.min(text.length, end);
  
  return text.substring(safeStart, safeEnd);
};
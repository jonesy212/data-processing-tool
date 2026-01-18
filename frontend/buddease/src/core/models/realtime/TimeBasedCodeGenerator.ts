// TimeBasedCodeGenerator.ts
const generateTimeBasedCode = () => {
    // Get the current timestamp in milliseconds
    const currentTimestamp = new Date().getTime();
    
    // Extract the last 6 digits of the timestamp
    const timeBasedCode = currentTimestamp.toString().slice(-6);

    return timeBasedCode;
};

export default generateTimeBasedCode;

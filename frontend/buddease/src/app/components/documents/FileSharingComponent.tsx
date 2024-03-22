// FileSharingComponent.tsx

// import {
//   Box,
//   Button,
//   Divider,
//   FormControl,
//   Input,
//   InputLabel,
//   Typography,
// } from "@material-ui/core";


import React, { useState } from "react";
import { SupportedData } from "../models/CommonData";
import { DataDetailsComponent } from "../models/teams/Team";
import DynamicTypography from "../styling/DynamicTypography";

// FileSharingComponent functional component
const FileSharingComponent: React.FC = () => {
  // State for handling file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Define state variables
  const [realtimeData, setRealtimeData] = useState<SupportedData[]>([]);



  // Implement the update callback function
  const updateCallback = (
    data: Data[],
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<Snapshot<Data>>,
    dataItems: RealtimeDataItem[]
  ) => {
    // Your update logic here
    console.log("Updated data:", data);
    console.log("Updated events:", events);
    console.log("Snapshot store:", snapshotStore);
    console.log("Realtime data items:", dataItems);
    
    // Update the state with the new data
    setRealtimeData(data);
  };
  // Implement the useRealtimeData hook
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch updated data from the server via HTTP
        const response = await axios.get("/api/data");

        // Update the state with the new data
        setRealtimeData(response.data);

        // Dispatch an action to update Redux store state
        dispatch({ type: "UPDATE_REALTIME_DATA", payload: response.data });

        // Emit the updated data to the frontend via WebSocket
        const socket = socketIOClient(ENDPOINT);
        socket.emit("updateData", response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Initial fetch
    fetchData();

    // Interval for periodic updates
    const intervalId = setInterval(fetchData, 5000); // Fetch data every 5 seconds (adjust as needed)

    return () => {
      // Cleanup: Stop the interval
      clearInterval(intervalId);
    };
  }, [dispatch]);

  




  // Function to handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Function to handle file upload
  const handleFileUpload = () => {
    // Upload logic here
    console.log("Uploading file:", selectedFile);
    // Reset selected file state after upload
    setSelectedFile(null);
  };

  return (
    <>
      <Box>
        <DynamicTypography variant="h5">File Sharing and Collaboration</DynamicTypography>
        <Divider />
        <Box mt={2}>
          <FormControl fullWidth>
            <InputLabel htmlFor="file-upload">Select File</InputLabel>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
              onChange={handleFileSelect}
            />
          </FormControl>
          <Box mt={2}>
            {selectedFile && (
              <Typography variant="body1">
                Selected File: {selectedFile.name}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload File
            </Button>
          </Box>
        </Box>
      </Box>
      <h1>File Sharing Component</h1>
      {/* Render the DataDetailsComponent with the fetched realtimeData */}
      {realtimeData.map((data) => (
        <DataDetailsComponent key={data.id} data={data} />
      ))}



            {/* Example usage of Input and InputLabel */}
            <InputLabel label="Enter your name:" />
      <Input
        type="text"
        placeholder="Type here..."
        value={inputValue}
        onChange={handleInputChange}
      />
    <h1>File Sharing Component</h1>
      {realtimeData.map((data) => (
        <div key={data.id}>
          {/* Render custom typography with dynamic content */}
          <CustomTypography
            dynamicContent={true}
            dynamicFont="Arial, sans-serif"
            dynamicColor="#000000"
          >
            {/* Use data.title and data.description as dynamic content */}
            <h2>{data.title}</h2>
            <p>{data.description}</p>
          </CustomTypography>
          {/* Render custom button with dynamic content */}
          <CustomButton
            label="Click Me"
            onClick={() => {
              // Handle button click event
              console.log("Button clicked!");
            }}
          />
        </div>
      ))}
    </>
  );
};

export default FileSharingComponent;

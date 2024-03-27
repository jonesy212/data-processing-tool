// FileSharingComponent.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import FormControl from "@/app/pages/forms/FormControl";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import { RealtimeDataItem } from "../../../../models/realtime/RealtimeData";
import CustomBox from "../containers/CustomBox";
import useFileUpload from "../hooks/commHooks/useFileUpload";
import DynamicInputFields from '../hooks/userInterface/DynamicInputFieldsProps';
import InputLabel, { Input } from "../hooks/userInterface/InputFields";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { SupportedData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { DataDetailsComponent } from "../models/teams/Team";
import { brandingSettings } from "../projects/branding/BrandingSettings";
import router from "../projects/projectManagement/ProjectManagementSimulator";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import DynamicTypography from "../styling/DynamicTypography";

const API_BASE_URL = endpoints;
// FileSharingComponent functional component
const FileSharingComponent: React.FC = () => {
  // State for handling file upload
  const [inputValue, setInputValue] = useState<typeof Input>();
  // Define state variables
  const [uploadError, setUploadError] = useState<string | null>(null); // State to store upload error message
  const [realtimeData, setRealtimeData] = useState<SupportedData[]>([]);
  const { selectedFile, handleFileChanges, uploadFile } = useFileUpload({
    inputValue,
    handleInputChanges: (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    }
  }
  );

  const dispatch = useDispatch();

  // Implement the update callback function
  const updateCallback = (
    data: SupportedData[],
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
        const response = await axiosInstance.get("/api/data");

        // Update the state with the new data
        setRealtimeData(response.data);

        // Dispatch an action to update Redux store state
        dispatch({ type: "UPDATE_REALTIME_DATA", payload: response.data });

        // Emit the updated data to the frontend via WebSocket
        const socket = socketIOClient(API_BASE_URL);
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







  // Function to handle file upload
  const handleFileUpload = async () => {
    // Upload logic here
    if (!selectedFile) {
      setUploadError("Please select a file."); // Display error message if no file is selected
      return;
    }
    // Upload file to server
    try {
      const response = await axiosInstance.post("/api/upload", formData);
      console.log("File uploaded successfully:", response.data);
      
    } catch (err: any) {
      console.error("Error uploading file:", err);
      setUploadError(err);
    }
    console.log("Uploading file:", selectedFile);
    // Reset selected file state after upload
    setSelectedFile(null);
  };

  const formID = useRef<HTMLFormElement>(null);

  const handleformId = () => {
    // Upload logic here
    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
  };

  return (
    <>
      <CustomBox>
        <DynamicTypography variant="h5">
          File Sharing and Collaboration
        </DynamicTypography>
        <Divider />
        <CustomBox mt={2}>
          <FormControl formID={formID} fullWidth>
            <InputLabel htmlFor="file-upload">Select File</InputLabel>
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
              onChange={handleFileChanges} // Use handleFileChanges from useFileUpload hook
            />
          </FormControl>
          <CustomBox mt={2}>
            {selectedFile && (
              <DynamicTypography variant="body1">
                Selected File: {selectedFile.name}
              </DynamicTypography>
            )}
            <ReusableButton
              variant="contained"
              label="Upload File"
              color="primary"
              onClick={() => {
                handleformId(); // Call handleformId here
                { uploadFile }
              }
            }
              disabled={!selectedFile}
              style={{ marginLeft: "16px" }}
              router={router}
              brandingSettings={brandingSettings} // Pass brandingSettings prop
            >
              Upload File
            </ReusableButton>
          </CustomBox>
        </CustomBox>
      </CustomBox>
      <h1>File Sharing Component</h1>
      {/* Render the DataDetailsComponent with the fetched realtimeData */}
      {realtimeData.map((data: any) => (
        <DataDetailsComponent key={data.id} data={data} />
      ))}

      {/* Example usage of Input and InputLabel */}
      <InputLabel
        htmlFor=""
        // label="Enter your name:"
      />
      <Input
        type="text"
        placeholder="Type here..."
        value={inputValue}
        onChange={handleInputChange}
      />
      <h1>File Sharing Component</h1>
      {realtimeData.map((data: any) => (
        <div key={data.id}>
          {/* Render custom typography with dynamic content */}
          <DynamicTypography
            dynamicContent={true}
            fontSize={data.fontSize}
            fontFamily={data.fontFamily}
            dynamicFont={data.dynamicFont}
            dynamicColor="#000000"
          >
            {/* Use data.title and data.description as dynamic content */}
            <h2>{data.title}</h2>
            <p>{data.description}</p>
          </DynamicTypography>
          {/* Render custom button with dynamic content */}
          <ReusableButton
            label="Click Me"
            onClick={() => {
              // Handle button click event
              console.log("Button clicked!");
            }}
            router={router}
            brandingSettings={brandingSettings}
          />
        </div>
      ))}

      <DynamicInputFields
        fields={[
          { label: "Field 1", type: "text" },
          { label: "Field 2", type: "number" },
        ]}
      />
    </>
  );
};

export default FileSharingComponent;

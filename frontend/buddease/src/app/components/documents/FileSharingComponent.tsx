// FileSharingComponent.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { ExtendedRouter } from "@/app/pages/MyAppWrapper";
import FormControl from "@/app/pages/forms/FormControl";
import MenuDivider from "antd/es/menu/MenuDivider";
import { Router, useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import socketIOClient from "socket.io-client";
import CustomBox from "../containers/CustomBox";
import useFileUpload from "../hooks/commHooks/useFileUpload";
import DynamicInputFields from "../hooks/userInterface/DynamicInputFieldsProps";
import InputLabel, { Input } from "../hooks/userInterface/InputFields";
import ReusableButton from "../libraries/ui/buttons/ReusableButton";
import { SupportedData } from "../models/CommonData";
import { RealtimeDataItem } from "../models/realtime/RealtimeData";
import { DataDetailsComponent } from "../models/teams/Team";
import { brandingSettings } from "../projects/branding/BrandingSettings";
import SnapshotStore from "../snapshots/SnapshotStore";
import DynamicTypography from "../styling/DynamicTypography";
 
const API_BASE_URL = endpoints;
// FileSharingComponent functional component
const FileSharingComponent: React.FC = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>() => {
  // State for managing selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Ensure that inputValue is a string state
  const [inputValue, setInputValue] = useState<string>("");
  // Define state variables
  const [uploadError, setUploadError] = useState<string | null>(null); // State to store upload error message
  const [realtimeData, setRealtimeData] = useState<SupportedData<T>[]>([]);
  const { handleFileChanges, uploadFile } = useFileUpload({
    inputValue,
    handleInputChange: (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    },
  });

  const dispatch = useDispatch();
  const router = useRouter(); // Get the router object using useRouter hook

  // Implement the update callback function
  const updateCallback = <T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    data: SupportedData<T>[],
    events: Record<string, CalendarEvent[]>,
    snapshotStore: SnapshotStore<T, K>,
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
      const formData = new FormData();
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
      <CustomBox
        mt={2}
        handleFileSelect={handleformId}
        handleFileUpload={handleFileUpload}
        sizes={[]}
        onResize={(newSizes: number[]): void => {
          throw new Error("Function not implemented.");
        }}
        onResizeStop={(newSizes: number[]): void => {
          throw new Error("Function not implemented.");
        }}
      >
        <DynamicTypography
          variant="h5"
          dynamicFont={"Aria, sans-serif"}
          dynamicColor={"#000000"}
          fontSize=""
          fontFamily=""
        >
          File Sharing and Collaboration
        </DynamicTypography>
        <MenuDivider />
        <CustomBox
          mt={2}
          handleFileSelect={handleformId}
          handleFileUpload={handleFileUpload}
          sizes={[]}
          onResize={(newSizes: number[]): void => {
            throw new Error("Function not implemented.");
          }}
          onResizeStop={(newSizes: number[]): void => {
            throw new Error("Function not implemented.");
          }}
        >
          <FormControl formID={formID} fullWidth>
            <InputLabel htmlFor="file-upload">Select File</InputLabel>
            <Input
              id="file-upload"
              type="file"
              value={inputValue}
              accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
              onChange={handleFileChanges} // Use handleFileChanges from useFileUpload hook
            />
          </FormControl>
          <CustomBox
            mt={2}
            handleFileSelect={handleformId}
            handleFileUpload={handleFileUpload}
            sizes={[]}
            onResize={(newSizes: number[]): void => {
              throw new Error("Function not implemented.");
            }}
            onResizeStop={(newSizes: number[]): void => {
              throw new Error("Function not implemented.");
            }}
          >
            {selectedFile && (
              <DynamicTypography
                dynamicFont={"Aria, sans-serif"}
                dynamicColor={"#000000"}
                variant="body1"
                fontSize=""
                fontFamily=""
              >
                Selected File: {selectedFile.name}
              </DynamicTypography>
            )}
            {uploadError && ( // Display upload error if it exists
              <DynamicTypography
                variant="body1"
                fontSize="12px"
                fontFamily="Arial, Helvetica, sans-serif"
                dynamicFont={"Aria, sans-serif"}
                dynamicColor={"#000000"}
              >
                {uploadError}
              </DynamicTypography>
            )}
            <ReusableButton
              variant="contained"
              label="Upload File"
              color="primary"
              onClick={() => {
                handleformId(); // Call handleformId here
                {
                  uploadFile;
                }
              }}
              disabled={!selectedFile}
              style={{ marginLeft: "16px" }}
              router={router as ExtendedRouter & Router}
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
        id="file-upload"
        type="text"
        placeholder="Type here..."
        value={inputValue}
        onChange={handleFileChanges}
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
            router={router as ExtendedRouter & Router}
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

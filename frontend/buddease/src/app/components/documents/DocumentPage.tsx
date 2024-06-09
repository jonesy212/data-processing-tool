// DocumentPage.tsx
import { DocumentBuilderConfig } from "@/app/configs/DocumentBuilderConfig";
import { ReactNode, useState } from "react";
import DocumentBuilder from "./DocumentBuilder";
import { DocumentOptions, getDefaultDocumentOptions } from "./DocumentOptions";
import RootLayout from "@/app/RootLayout";
import React from "react";

interface DynamicHooks {
  [key: string]: {
    hook: () => ReactNode;
  };
}

const dynamicHooks: DynamicHooks = {
  authentication: {
    hook: () => {
      return <h1>{`Authentication Page`}</h1>; // return react node
    },
  },
  jobSearch: {
    hook: () => {
      return null; // return react node
    },
  },
  recruiterDashboard: {
    hook: () => {
      return null; // return react node
    },
  },
};




const DocumentPage = () => {
  const [options, setOptions] = useState<DocumentOptions>(
    getDefaultDocumentOptions()
  );

  const handleOptionsChange = (newOptions: DocumentOptions) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      ...newOptions,
    }));
  };

  const handleConfigChange = (newConfig: DocumentBuilderConfig) => {
    setOptions((prevOptions) => ({
      ...prevOptions,
      config: newConfig,
    }));
  };


  // Define the setOptions function
  const setOptionsHandler = (newOptions: DocumentOptions) => {
    setOptions(newOptions);
  };
  
  return (
    <RootLayout>

    <div>
      <h1>Your Document Page</h1>

      <DocumentBuilder
        options={options}
        onOptionsChange={handleOptionsChange}
        onConfigChange={handleConfigChange} 
        isDynamic={true}
        documentPhase={""}
        version={""}
        setOptions={setOptionsHandler}
        documents={[]}
      />

      {Object.keys(dynamicHooks).map((key) => (
        <div key={key}>
          {dynamicHooks[key].hook()}
        </div>
      ))}
      </div>
      </RootLayout>

  );
};

export default DocumentPage;

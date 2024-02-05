// DataDashboard.tsx
import { Data } from "@/app/components/models/data/Data";
import DataFilterForm, {
  DataFilterFormProps,
} from "@/app/components/models/data/DataFilterForm";
import axios from "axios";
import React, { useEffect, useState } from "react";

const DataDashboard: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTest, setSelectedTest] = useState<string>("t-test");

  const [filteredData, setFilteredData] = useState<Data[]>([]); // Initialize with an empty array
  const [loading, setLoading] = useState(false);
  const [dataframeInfo, setDataframeInfo] = React.useState<any | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar" | "histogram">(
    "line"
  );

  const handleUpload = () => {
    // Implement your file upload logic here using the selectedFile state
    if (selectedFile) {
      // Your file upload logic goes here
      console.log("File uploaded:", selectedFile);
    } else {
      console.log("No file selected for upload.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleTestChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const testType = event.target.value;
    setSelectedTest(testType);
  };

  const handleChartTypeChange = (type: "line" | "bar" | "histogram") => {
    setChartType(type);
  };

  const handleDataFrameInfoButtonClick = () => {
    // Make API call to retrieve DataFrame information
    axios
      .get("/api/dataframe/info")
      .then((response) => {
        setDataframeInfo(response.data);
      })
      .catch((error) => {
        console.error("Error retrieving DataFrame information:", error);
      });
  };

  const handleSortButtonClick = () => {
    // Make API call to sort DataFrame by region and family_members
    axios
      .get("/api/dataframe/sort", {
        params: {
          columns: ["region", "family_members"],
          ascending: [true, false],
        },
      })
      .then((response) => {
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error("Error sorting DataFrame:", error);
      });
  };

  const handleFilterButtonClick = () => {
    // Make API call to filter DataFrame for family_members < 1000 and region is Pacific
    axios
      .get("/api/dataframe/filter", {
        params: {
          conditions: [
            { column: "family_members", operator: "<", value: 1000 },
            { column: "region", operator: "==", value: "Pacific" },
          ],
        },
      })
      .then((response) => {
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error("Error filtering DataFrame:", error);
      });
  };

  const handleSubsetButtonClick = () => {
    // Make API call to subset DataFrame for individuals and state columns
    axios
      .get("/api/dataframe/subset", {
        params: {
          columns: ["individuals", "state"],
        },
      })
      .then((response) => {
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error("Error subsetting DataFrame:", error);
      });
  };

  const handleMojaveFilterButtonClick = () => {
    // Make API call to filter DataFrame for Mojave Desert states
    axios
      .get("/api/dataframe/mojave", {
        params: {
          states: ["California", "Arizona", "Nevada", "Utah"],
        },
      })
      .then((response) => {
        setFilteredData(response.data);
      })
      .catch((error) => {
        console.error(
          "Error filtering DataFrame for Mojave Desert states:",
          error
        );
      });
  };

  const fetchData = async (
    filters: Record<string, { operation: string; value: string | number }>,
    transform: string,
    options: any
  ) => {
    try {
      setLoading(true);
      // You need to replace 'your_api_endpoint' with your actual API endpoint
      const response = await axios.post("your_api_endpoint", {
        filters,
        transform,
        options,
      });
      setFilteredData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTest = () => {
    // Implement your hypothesis testing logic here using the selectedTest state
    console.log("Running test:", selectedTest);
  };

  useEffect(() => {
    // Fetch initial data or any other initialization logic
    // ...

    // Example: Fetch data with default filters
    fetchData(
      {
        column: {
          operation: "==",
          value: "defaultColumn",
        },
      },
      "none",
      { limit: 10 }
    );
  }, []); // Empty dependency array to run the effect only once on mount

  return (
    <div>
      <h1>Data Dashboard</h1>

      {/* Button to retrieve DataFrame information */}
      <button onClick={handleDataFrameInfoButtonClick}>
        Get DataFrame Info
      </button>

      {/* Button to sort DataFrame */}
      <button onClick={handleSortButtonClick}>Sort DataFrame</button>

      {/* Button to filter DataFrame */}
      <button onClick={handleFilterButtonClick}>Filter DataFrame</button>

      {/* Button to subset DataFrame */}
      <button onClick={handleSubsetButtonClick}>Subset DataFrame</button>

      {/* Button to filter DataFrame for Mojave Desert states */}
      <button onClick={handleMojaveFilterButtonClick}>
        Filter for Mojave Desert States
      </button>

      {/* Display DataFrame information or filtered data */}
      {dataframeInfo && (
        <div>
          <h2>DataFrame Information</h2>
          <pre>{JSON.stringify(dataframeInfo, null, 2)}</pre>
        </div>
      )}

      {filteredData && (
        <div>
          <h2>Filtered Data</h2>
          <pre>{JSON.stringify(filteredData, null, 2)}</pre>
        </div>
      )}
      {/* Form for data filtering */}
      <DataFilterForm
        onSubmit={fetchData as unknown as DataFilterFormProps["onSubmit"]}
        options={{}}
      />

      {/* Buttons for selecting chart type */}
      <div>
        <button
          onClick={() => handleChartTypeChange("line")}
          className={chartType === "line" ? "active" : ""}
        >
          Line Chart
        </button>
        <button
          onClick={() => handleChartTypeChange("bar")}
          className={chartType === "bar" ? "active" : ""}
        >
          Bar Chart
        </button>
        <button
          onClick={() => handleChartTypeChange("histogram")}
          className={chartType === "histogram" ? "active" : ""}
        >
          Histogram
        </button>
      </div>

      {/* Display filtered data */}
      {loading && <p>Loading...</p>}
      {!loading && filteredData.length > 0 && (
        <div>
          <h2>Filtered Data</h2>
          <ul>
            {filteredData.map((item) => (
              <li key={item.id}>{/* Display data as needed */}</li>
            ))}
          </ul>
        </div>
      )}
      {!loading && filteredData.length === 0 && (
        <p>No data found with the specified filters.</p>
      )}
      <form onSubmit={handleUpload}>
        <label htmlFor="dataset">Upload Dataset:</label>
        <input
          type="file"
          name="dataset"
          id="dataset"
          onChange={handleFileChange}
        />
        <button type="submit">Upload</button>
      </form>

      <form onSubmit={handleRunTest}>
        <label htmlFor="test-type">Select Hypothesis Test:</label>
        <select
          name="test-type"
          id="test-type"
          value={selectedTest}
          onChange={handleTestChange}
        >
          <option value="t-test">T-Test</option>
          <option value="chi-squared">Chi-Squared</option>
          <option value="z-test">Z-Test</option>
        </select>
        <button type="submit">Run Hypothesis Test</button>
      </form>

      {/* File upload section */}
      <div>
        <h2>File Upload</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload File</button>
      </div>

      {/* Hypothesis testing section */}
      <div>
        <h2>Hypothesis Testing</h2>
        <select value={selectedTest} onChange={handleTestChange}>
          {/* Add options based on your available tests */}
          <option value="t-test">T-Test</option>
          {/* Add more options as needed */}
        </select>
        <button onClick={handleRunTest}>Run Test</button>
      </div>
      {/* Visualization section */}
      <div id="visualization">
        {/* Visualization charts will be displayed here */}
      </div>
    </div>
  );
};

export default DataDashboard;

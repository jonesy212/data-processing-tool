// DataFilterForm.tsx
import processSnapshotList from "@/app/generators/processSnapshotList";
import {
  DataAnalysisAction,
  DataAnalysisDispatch,
} from "@/app/typings/dataAnalysisTypes";
import { Dispatch } from "@reduxjs/toolkit";
import { DataFrame } from "data-forge";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useRealtimeData from "../../hooks/commHooks/useRealtimeData";
import { Snapshot, snapshotStore } from "../../snapshots/SnapshotStore";
import { updateCallback } from "../../state/stores/CalendarEvent";
import userService from "../../users/ApiUser";
import { Data } from "./Data";
// import  DataFrameAPI  from '@/app/api/DataframeApi';
// import DataFrameComponent from './DataFrameComponent';
import { Phase } from '@/app/components/phases/Phase';
import ListGenerator from "@/app/generators/ListGenerator";
import { shuffleArray } from "@/app/utils/shuffleArray";
import SnapshotList from "../../snapshots/SnapshotList";
import { DetailsItem } from "../../state/stores/DetailsListStore";

interface DataFilterFormProps {
  onSubmit: (
    filters: Record<string, { operation: string; value: string | number }>,
    transform: string
  ) => void;
  options: FilterOptions;
}

interface FilterOptions {
  sort?: string; // Sorting option
  limit?: number; // Dataset limit
  random?: boolean; // Return random data
  topN?: number; // Fetch top N results
}

const DataFilterForm: React.FC<DataFilterFormProps> = async ({ onSubmit }) => {
  const [filters, setFilters] = useState<
    Record<string, { operation: string; value: string | number }>
  >({});
  const [transform, setTransform] = useState("none");
  const [options, setOptions] = useState<FilterOptions>({});

  const [column, setColumn] = useState("");
  const [operation, setOperation] = useState("==");
  const [value, setValue] = useState("");
  const { realtimeData, fetchData } = useRealtimeData(
    snapshotStore,
    updateCallback
  );
  // Use processed snapshot data in your component logic
  const [snapshotList, setSnapshotList] = useState<SnapshotList>(
    new SnapshotList()



  );
  
  
  const snapshotDetails: DetailsItem<Data> = {
    label: "",
    value: "",
    id: "",
    title: "",
    status: "pending",
    description: "",
    phase: {} as Phase
    // Add other properties as needed
  }

  const snapshotListArray: DetailsItem<Data>[] = Array.from(snapshotList).map(
    (snapshot: Snapshot<Data>) => ({
      ...snapshotDetails,
      label: snapshot.data.label,
      value: snapshot.data.value,
      // Add other properties as needed
    })
  );
  

  const dispatch: DataAnalysisDispatch =
    useDispatch<Dispatch<DataAnalysisAction>>();

  const userId = ""; // Your user ID here
  const user = await userService.fetchUser(userId);
  const addFilter = () => {
    if (
      column.trim() === "" ||
      operation.trim() === "" ||
      value.trim() === ""
    ) {
      alert("Column, Operation, and Value cannot be empty");
      return;
    }

    const newFilter = {
      operation,
      value: isNaN(Number(value)) ? value : Number(value),
    };

    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: newFilter, // use columnName instead of column
    }));

    // Clear form fields
    setColumn("");
    setOperation("==");
    setValue("");

    const clearAllFilters = () => {
      setFilters({});
      setTransform("none");
    };

    onSubmit(filters, transform);

    // Clear all filters
    clearAllFilters();
  };

  const streamDataToBackend = () => {
    const stream = new EventSource("/stream_data");

    stream.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);
      // Process the received data as needed
      console.log("Received data:", receivedData);
    };

    stream.onerror = (error) => {
      console.error("Error with SSE:", error);
      stream.close();
    };

    return stream; // Return the stream object for cleanup
  };

  // Usage in useEffect
  useEffect(() => {
    // Process raw data and generate snapshot list
    const generator = new SnapshotListGenerator();
    const rawData = fetchData(userId, dispatch); // Fetch raw data from API or local storage
    const processedSnapshotList = generator.generateSnapshotList(rawData);

    // Perform data transformation actions
    processSnapshotList(processedSnapshotList);

    // Update component state with processed snapshot data
    setSnapshotList(processedSnapshotList);

    // Start streaming when the component mounts
    const stream = streamDataToBackend();

    // Clean up the EventSource when the component unmounts
    return () => {
      stream.close();
    };
  }, []);

  const clearAllFilters = () => {
    setFilters({});
    setTransform("none");
  };

  const clearOptions = () => {
    setOptions({});
  };

  const handleSubmit = () => {
    if (Object.keys(filters).length === 0) {
      alert("At least one filter is required");
      return;
    }

    onSubmit(filters, transform);

    // Clear all filters
    clearAllFilters();
    clearOptions();
  };

  //  Convert filters to data-forge query object
  const query = Object.keys(filters).reduce((queryObj: any, columnName) => {
    queryObj[columnName] = {
      [filters[columnName].operation]: filters[columnName].value,
    };
    return queryObj;
  }, {});
// Fetch data using data-forge DataFrame
const dataFrame = new DataFrame([]); // Replace this with your actual data frame

// Apply filters
let filteredDataFrame = dataFrame
  .where(query)
  .map((row: any) => {
    // Apply transformations if needed
    return row;
  });

// Apply options
if (options.sort) {
  filteredDataFrame = filteredDataFrame.orderBy((row: any) => row[options.sort as keyof any]);
}

if (options.limit) {
  filteredDataFrame.head(options.limit);
}
// Continue with other options...


if (options.random) {
  const dataArray = filteredDataFrame.toArray(); // Convert DataFrame to an array
  shuffleArray(dataArray); // Shuffle the array
  filteredDataFrame = new DataFrame(dataArray); // Convert the shuffled array back to a DataFrame
}

  if (options.topN) {
    filteredDataFrame.tail(options.topN);
  }

  // Convert data-forge DataFrame to an array of objects
  const filteredData: Record<string, { operation: string; value: string | number; }> = filteredDataFrame.toArray()[0];

  onSubmit(filteredData, transform);

  // Clear all filters
  clearAllFilters();

  setFilters((prevFilters) => {
    const updatedFilters = { ...prevFilters };
    updatedFilters[column] = {
      operation: "==",
      value: "",
    } as { operation: string; value: string | number };
    return updatedFilters;
  });

  // Clear form fields
  setColumn("");
  setOperation("==");
  setValue("");

  const removeFilter = (columnName: string) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      delete updatedFilters[columnName];
      return updatedFilters;
    });
  };

  return (
    <div>
      <h2>Data Filter Form</h2>
      {Object.keys(filters).map((columnName) => (
        <div key={columnName}>
          <span>
            {columnName} {filters[columnName].operation}{" "}
            {filters[columnName].value}{" "}
            <button type="button" onClick={() => removeFilter(columnName)}>
              Remove
            </button>
          </span>
        </div>
      ))}
      <label>
        Column:
        <input
          type="text"
          value={column}
          onChange={(e) => setColumn(e.target.value)}
        />
      </label>
      <label>
        Operation:
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value="<">{"<"}</option>
          <option value=">">{">"}</option>
          {/* Add more operators as needed */}
        </select>
      </label>
      <label>
        Value:
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <br />
      <button onClick={addFilter}>Add Filter</button>
      <br />
      <label>
        Transformation:
        <select
          value={transform}
          onChange={(e) => setTransform(e.target.value)}
        >
          <option value="none">None</option>
          <option value="sum">Sum</option>
          <option value="mean">Mean</option>
          <option value="count">Count</option>
          {/* Add more transformations as needed */}
        </select>
      </label>
      <br />

      <label>
        Sorting:
        <select
          value={options.sort || "none"}
          onChange={(e) => setOptions({ ...options, sort: e.target.value })}
        >
          <option value="none">None</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </label>
      <br />
      <label>
        Dataset Limit:
        <input
          type="number"
          value={options.limit || ""}
          onChange={(e) =>
            setOptions({ ...options, limit: Number(e.target.value) })
          }
        />
      </label>
      <br />
      <label>
        Return Random Data:
        <input
          type="checkbox"
          checked={options.random || false}
          onChange={(e) => setOptions({ ...options, random: e.target.checked })}
        />
      </label>
      <br />
      <label>
        Top N Results:
        <input
          type="number"
          value={options.topN || ""}
          onChange={(e) =>
            setOptions({ ...options, topN: Number(e.target.value) })
          }
        />
      </label>
      <br />
      {/* Use 'realtimeData' in your component logic */}
      <div>
        <h3>Real-time Data:</h3>
        {realtimeData.map((dataPoint: any, index: any) => (
          <div key={index}>{JSON.stringify(dataPoint)}</div>
        ))}
      </div>
      <br />
      <div>
        <ListGenerator items={snapshotListArray} />
      </div>
      <br />
      <button onClick={clearAllFilters}>Clear All Filters</button>
      <br />
      <button onClick={handleSubmit}>Apply Filters</button>
    </div>
  );
};

export default DataFilterForm;
export type { DataFilterFormProps };

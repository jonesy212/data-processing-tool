// DataFilterForm.tsx
import userService, { userId } from "@/core/api/ApiUser";
import ListGenerator from "@/core/generators/ListGenerator";
import processSnapshotList from "@/core/generators/processSnapshotList";
import SnapshotListGenerator from "@/core/generators/SnapshotListGenerator";
import useRealtimeData from "@/core/hooks/commHooks/useRealtimeData";
import type { Data } from "@/core/models/data/Data";
import type { Phase } from '@/core/models/phases/Phase';
import { updateCallback } from "@/core/pages/blog/UpdateCallbackUtils";
import { authToken } from "@/core/server/auth/authToken";
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotList from "@/core/snapshots/SnapshotList";
import snapshotStore from "@/core/snapshots/SnapshotStore";
import type { DetailsItem } from "@/core/state/stores/DetailsListStore";
import type { SnapshotAttachment, SnapshotEntity, SnapshotExcludedFields, SnapshotIncludedFields, SnapshotK, SnapshotMeta } from '@/core/typings/entities/SnapshotEntity';
import type { DataAnalysisAction } from '@/core/typings/phases/dataAnalysisTypes';
import type { DataAnalysisDispatch } from '@/core/typings/phases/dataAnalysisTypes';

import { shuffleArray } from "@/utils/shuffleArray";
import type { Dispatch } from "@reduxjs/toolkit";
import { DataFrame } from "data-forge";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface DataFilterFormProps {
  onSubmit: (
    filters: Record<string, { operation: string; value: string | number }>,
    transform: string
  ) => void;
  options: FilterOptions;
  onSearch: (
    filters: Record<string, { operation: string; value: string | number }>,
    transform: string
  ) => Promise<void>
}

interface FilterOptions {
  sort?: string; // Sorting option
  limit?: number; // Dataset limit
  random?: boolean; // Return random data
  topN?: number; // Fetch top N results
}

const DataFilterForm: React.FC<DataFilterFormProps> = ({ onSubmit }) => { // Removed async from component
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
  
  const [snapshotList, setSnapshotList] = useState<SnapshotList<
    SnapshotEntity,
    SnapshotK,
    SnapshotMeta,
    SnapshotAttachment,
    SnapshotExcludedFields,
    SnapshotIncludedFields
  >>(new SnapshotList());
  
  const [snapshotListArray, setSnapshotListArray] = useState<DetailsItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const dispatch: DataAnalysisDispatch = useDispatch<Dispatch<DataAnalysisAction>>();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await userService.fetchUser(String(userId), authToken);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    
    loadUserData();
  }, []);

  // Process data and generate snapshot list
  useEffect(() => {
    const processData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Fetch raw data - handle the Promise properly
        const rawData = await fetchData(userId, dispatch); // Add await here
        
        if (rawData && Array.isArray(rawData)) {
          const generator = new SnapshotListGenerator();
          const processedSnapshotList = generator.generateSnapshotList(rawData);
          
          // Process the snapshot list
          await processSnapshotList(processedSnapshotList);
          
          // Update component state with processed snapshot data
          setSnapshotList(processedSnapshotList);
          
          // Convert snapshot list to array for display
          const snapshotArray: DetailsItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>[] = Array.from(processedSnapshotList).map(
            (value: unknown) => {
              const snapshot = value as Snapshot<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> | null;
              const snapshotDetails: DetailsItem<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> = {
                id: snapshot?.id || "",
                title: snapshot?.title || "",
                label: snapshot?.label || "",
                value: snapshot?.value || "",
                status: snapshot?.status || "pending",
                description: snapshot?.description || "",
                subtitle: snapshot?.subtitle || "",
                phase: snapshot?.phase as Phase<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields> || {} as any,
                updatedAt: snapshot?.updatedAt || undefined
              };
              
              if (snapshot?.data && typeof snapshot.data === 'object') {
                const data = snapshot.data as Data;
                snapshotDetails.label = data.label || snapshotDetails.label;
                snapshotDetails.value = data.value || snapshotDetails.value;
              }
              
              return snapshotDetails;
            }
          );
          
          setSnapshotListArray(snapshotArray);
        }
      } catch (error) {
        console.error("Error processing data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    processData();
  }, [userId, dispatch, fetchData]);

  // Start streaming when the component mounts
  useEffect(() => {
    const streamDataToBackend = () => {
      const stream = new EventSource("/stream_data");

      stream.onmessage = (event) => {
        const receivedData = JSON.parse(event.data);
        console.log("Received data:", receivedData);
      };

      stream.onerror = (error) => {
        console.error("Error with SSE:", error);
        stream.close();
      };

      return stream;
    };
    
    const stream = streamDataToBackend();
    
    // Clean up the EventSource when the component unmounts
    return () => {
      stream.close();
    };
  }, []);

  // Rest of your component functions remain the same...
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
      [column]: newFilter,
    }));

    // Clear form fields
    setColumn("");
    setOperation("==");
    setValue("");

    onSubmit(filters, transform);
  };

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

  const removeFilter = (columnName: string) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      delete updatedFilters[columnName];
      return updatedFilters;
    });
  };

  // Filter processing logic (separate from UI)
  const processFilterData = () => {
    // Convert filters to data-forge query object
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

    if (options.random) {
      const dataArray = filteredDataFrame.toArray();
      shuffleArray(dataArray);
      filteredDataFrame = new DataFrame(dataArray);
    }

    if (options.topN) {
      filteredDataFrame.tail(options.topN);
    }

    // Convert data-forge DataFrame to an array of objects
    const filteredData = filteredDataFrame.toArray();

    return filteredData;
  };

  return (
    <div>
      <h2>Data Filter Form</h2>
      
      {isLoading && <div>Loading data...</div>}
      
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
      
      {/* Display realtime data */}
      <div>
        <h3>Real-time Data:</h3>
        {realtimeData.length > 0 ? (
          realtimeData.map((dataPoint: any, index: any) => (
            <div key={index}>{JSON.stringify(dataPoint)}</div>
          ))
        ) : (
          <div>No real-time data available</div>
        )}
      </div>
      <br />
      
      {/* Display snapshot list */}
      <div>
        <h3>Snapshot List:</h3>
        {snapshotListArray.length > 0 ? (
          <ListGenerator items={snapshotListArray} />
        ) : (
          <div>No snapshot data available</div>
        )}
      </div>
      <br />
      
      <button onClick={clearAllFilters}>Clear All Filters</button>
      <br />
      <button onClick={handleSubmit}>Apply Filters</button>
    </div>
  );
};

export default DataFilterForm;
export type { DataFilterFormProps, FilterOptions };

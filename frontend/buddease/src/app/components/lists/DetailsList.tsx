import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import CommonDetails from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Phase } from "../phases/Phase";
import axiosInstance from "../security/csrfToken";
import {
  DetailsItem,
  useDetailsListStore,
} from "../state/stores/DetailsListStore";
import { Snapshot } from "../state/stores/SnapshotStore";


interface DetailsListInterface{
  items: string[];
  renderItem: (item: DetailsItem<Data>) => JSX.Element;
}

const DetailsList: React.FC<DetailsListInterface> = observer(() => {
  const detailsListStore = useDetailsListStore(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/api/details");
        const details = response.data; // Adjust based on your API response structure

        // Assuming details is an array of objects with id, title, and other properties
        detailsListStore.setDetails(details);
      } catch (error) {
        console.error("Error fetching details:", error);
        // Handle the error as needed
      }
    };

    fetchData();
  }, [detailsListStore]);

  const handleUpdateTitle = (id: string, newTitle: string) => {
    detailsListStore.updateDetailsTitle(id, newTitle);
  };

  const handleToggle = (id: string) => {
    detailsListStore.toggleDetails(id);
  };

  const handleAdd = () => {
    const newDetailId = "detail_" + Math.random().toString(36).substr(2, 9);
    const newDetail: Data = {
      _id: "",
      id: newDetailId,
      title: "A new detail",
      status: "pending",
      isActive: true,
      tags: [],
      phase: {} as Phase,
      then: function (callback: (newData: Snapshot<Data>) => void): void {
        detailsListStore.snapshotStore.subscribe(callback);
      },
      analysisType: "Analysis Type",
      analysisResults: [],
      videoData: {} as VideoData,
    };

    detailsListStore.addDetail(newDetail);
    handleUpdateTitle(newDetailId, "A new detail");
  };

  return (
    <div>
      <ul>
        {Object.values(detailsListStore.details).map(
          (detailsArray: DetailsItem<Data>[]) =>
            detailsArray.map((detail: DetailsItem<Data>) => (
              <li key={detail.id}>
                {detail.title} - {detail.status ? "Done" : "Not Done"}
                <button onClick={() => handleToggle(detail.id)}>Toggle</button>
                <CommonDetails data={{ title: "Title", description: "Description", data: detail }} />
              </li>
            ))
        )}
      </ul>

      <button onClick={handleAdd}>Add Detail</button>
    </div>
  );
});

export default DetailsList;

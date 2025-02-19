import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import CommonDetails from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Phase } from "../phases/Phase";
import axiosInstance from "../security/csrfToken";
import { useDetailsListStore } from "../state/stores/DetailsListStore";

interface DetailsListInterface {
  items: string[];
  renderItem: (item: DetailsItem<Data>) => JSX.Element;
}

const DetailsList: React.FC<DetailsListInterface> = observer(() => {
  const detailsListStore = useDetailsListStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/api/details");
        const details: Record<string, DetailsItem<Data>[]> =
          response.data.reduce(
            (acc: Record<string, DetailsItem<Data>>, detail: any) => {
              acc[detail.id] = {
                ...detail,
                id: String(detail.id),
              };
              return acc;
            },
            {}
          );
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
    const newDetail: DetailsItem<Data> = {
      _id: newDetailId,
      id: newDetailId,
      title: "A new detail",
      status: "pending",
      description: "A new detail description",
      phase: {} as Phase,
    };

    // Extract the Data object from newDetail
    const newData: Data = newDetail.data as Data;

    detailsListStore.addDetail(newData); // Pass the Data object to addDetail
    handleUpdateTitle(newDetailId, "A new detail");
  };

  return (
    <div>
      <ul>
        {Object.values(detailsListStore.details).map(
          (detailArray: DetailsItem<Data>[]) =>
            detailArray.map((detail: DetailsItem<Data>) => (
              <li key={detail.id}>
                {detail.title} - {detail.status ? "Done" : "Not Done"}
                <button onClick={() => handleToggle(detail.id)}>Toggle</button>
                <CommonDetails
                  details={{ ...detail, data: undefined } as DetailsItem<never>}
                  data={undefined}
                />
              </li>
            ))
        )}
      </ul>

      <button onClick={handleAdd}>Add Detail</button>
    </div>
  );
});

export default DetailsList;

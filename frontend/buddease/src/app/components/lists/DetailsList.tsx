import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import CommonDetails from '../models/CommonData';
import { useDetailsListStore } from '../state/stores/DetailsListStore';
import axiosInstance from '../security/csrfToken';
import Details from '../models/data/Details';

const DetailsList: React.FC = observer(() => {
  const detailsListStore = useDetailsListStore(); // Update to your actual store

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
    const newDetail = {
      id: newDetailId,
      title: "A new detail",
      // Add more properties as needed
    };

    detailsListStore.addDetail(newDetail);
    handleUpdateTitle(newDetailId, "A new detail");
  };

  return (
    <div>
      <ul>
        {detailsListStore.details.map((detail: Details) => (
          <li key={detail.id}>
            {detail.title} - {detail.done ? "Done" : "Not Done"}
            <button onClick={() => handleToggle(detail.id)}>Toggle</button>
            <CommonDetails data={detail} />
          </li>
        ))}
      </ul>

      <button onClick={handleAdd}>Add Detail</button>
    </div>
  );
});

export default DetailsList;

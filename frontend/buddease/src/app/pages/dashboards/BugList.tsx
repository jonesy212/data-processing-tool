// BugList.ts
import React from 'react';
import { DetailsItem } from "../components/state/stores/DetailsListStore";
import { Data } from "../components/models/data/Data";
import ListGenerator from './ListGenerator'; // Import the ListGenerator component

interface BugListProps {
  bugs: DetailsItem<Data>[]; // Assuming 'bugs' contain DetailsItem with Data type
  onClick: (bug: DetailsItem<Data>) => void; // onClick function to handle bug selection
}

const BugList: React.FC<BugListProps> = ({ bugs, onClick }) => {
  return (
    <div>
      <h2>Bug List</h2>
      {/* Render the ListGenerator component with the bug details */}
      <ListGenerator items={bugs} />
    </div>
  );
};

export default BugList;

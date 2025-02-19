// EventFilterComponent.ts
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import FilterComponent, { Filter } from './Filter';
import { SortingOption } from './SearchOptions';
import { selectFilteredEvents } from './eventActions'; // Assuming the action is imported from eventActions

const EventFilterComponent: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedSortingOption, setSelectedSortingOption] = useState<SortingOption | undefined>(undefined);

  const handleFilterEvents = (selectedOption: SortingOption | undefined) => {
    if (selectedOption) {
      // Dispatch action with the selected sorting option's field
      dispatch(selectFilteredEvents([selectedOption.field]));
    } else {
      // Handle case when no sorting option is selected
      dispatch(selectFilteredEvents([]));
    }
  };

  const handleFilterChange = (selectedOption: SortingOption | undefined, field: string) => {
    setSelectedSortingOption(selectedOption); // Update the state with the selected sorting option
    handleFilterEvents(selectedOption); // Trigger the filtering action
  };

  // Define the filter configuration
  const filterConfig: Filter = {
    label: 'Event Filter',
    options: ['Name', 'Date', 'Location'], // Example options
    onChange: handleFilterChange,
    field: 'eventField', // Example field
    placeholder: 'Select a filter option',
  };

  return (
    <div>
      <h3>Filter Events</h3>
      {/* Use the FilterComponent to handle event filtering */}
      <FilterComponent
        label={filterConfig.label}
        options={filterConfig.options}
        onChange={filterConfig.onChange}
        field={filterConfig.field}
      />
    </div>
  );
};

export default EventFilterComponent;

// useSorting.tsx
import { useState } from 'react';
import SortCriteria from '../../pages/searchs/SortCriteria';
import { CalendarEvent } from '../state/stores/CalendarEvent';
const useSorting = () => {
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>(SortCriteria.Date);

  const sortEvents = (events: CalendarEvent[]) => {
    return events.slice().sort((a, b) => {
      if (sortCriteria === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortCriteria === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });
  };

  const setSortByTitle = () => setSortCriteria(SortCriteria.Title);
  const setSortByDate = () => setSortCriteria(SortCriteria.Date);

  return { sortEvents, setSortByTitle, setSortByDate };
};

export default useSorting;

// useSorting.tsx
import { useState } from 'react';

const useSorting = () => {
  const [sortCriteria, setSortCriteria] = useState<"title" | "date">("date");

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

  const setSortByTitle = () => setSortCriteria("title");
  const setSortByDate = () => setSortCriteria("date");

  return { sortEvents, setSortByTitle, setSortByDate };
};

export default useSorting;

// useSorting.tsx
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { useState } from 'react';
import { SortCriteria } from '../settings/SortCriteria';
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


  const sortMessages = (messages: Message[]) => {
    return messages.slice().sort((a, b) => {
      if (sortCriteria === "sender") {
        return (a.sender?.username || "").localeCompare(
          b.sender?.username || ""
        );
      }
      if (sortCriteria === "receiver") {
        return (a.receiver?.username || "").localeCompare(
          b.receiver?.username || ""
        );
      }
      if (sortCriteria === "timestamp") {
        return (
          new Date(a.timestamp || "").getTime() -
          new Date(b.timestamp || "").getTime()
        );
      }
      if (sortCriteria === "message") {
        return (a.content || "").localeCompare(b.content || "");
      }
      if (sortCriteria === "tags") {
        return (a.tags.join(",") || "").localeCompare(b.tags.join(",") || "");
      }
      return 0;
    });
  }
  
  const setSortByTitle = () => setSortCriteria(SortCriteria.Title);
  const setSortByDate = () => setSortCriteria(SortCriteria.Date);

  return { sortEvents, setSortByTitle, setSortByDate, sortMessages };
};

export default useSorting;

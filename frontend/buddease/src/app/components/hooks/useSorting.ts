// useSorting.tsx
import { useState } from 'react';
import SortCriteria from '../../pages/searchs/SortCriteria';
import { CalendarEvent } from '../state/stores/CalendarEvent';
import { Message } from '@/app/generators/GenerateChatInterfaces';
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
        return (a.sender.username || "").localeCompare(b.sender.username || "");
      }
      if (sortCriteria === "receiver") {
        return (a.receiver.username || "").localeCompare(b.receiver.username || "");
      }
      if (sortCriteria === "timestamp") {
        return (
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
      if (sortCriteria === "message") {
        return (a.content || "").localeCompare(b.content || "");
      }
      if (sortCriteria === "tags") {
        return (a.tags || "").localeCompare(b.tags || "");
      }
      if (sortCriteria === "wordSearch") {
        return (
          (a.content || "").toLowerCase().indexOf(wordSearch || "") -
          (b.content || "").toLowerCase().indexOf(wordSearch || "")
        );
      }
      return 0;
    });
  }
  
  const setSortByTitle = () => setSortCriteria(SortCriteria.Title);
  const setSortByDate = () => setSortCriteria(SortCriteria.Date);

  return { sortEvents, setSortByTitle, setSortByDate };
};

export default useSorting;

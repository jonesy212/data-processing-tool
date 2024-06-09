import React from "react";
import { useEffect, useState } from "react";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { CalendarEvent } from "../state/stores/CalendarEvent";
import { CommonCalendarProps } from "./Calendar";
import { useCryptoManager } from "../crypto/CryptoManager";
import { Month, MonthInfo } from "./Month";

interface CalendarMonthProps extends CommonCalendarProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  tasks: Task[];
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  year,
  month,
  events,
  tasks,
  milestones,
  selectedProject,
  cryptoHoldings,
  onTaskClick,
  onTaskDoubleClick,
  onTaskContextMenu,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskResizingStart,
  onTaskResizingEnd,
  onTaskResize,
  onTaskDrop,
  onTaskChange,
  onTaskCreate,
  onTaskDelete,
  onTaskTitleChange,
  onTaskStatusChange,
  onTaskProgressChange,
  onTaskDependencyChange,
  onTaskFilterChange,
  onTaskLabelChange,
  onTaskParentChange,
  onTaskExpandedChange,
  onTaskLinkAdd,
  onTaskLinkRemove,
  onTaskDependencyAdd,
  onTaskDependencyRemove,
  onTaskProgressAdd,
  onTaskProgressRemove,
  onTaskLabelAdd,

  onAudioCallStart,
  onVideoCallStart,
  onMessageSend,
  onMilestoneClick,
  onCryptoTransaction,
  isDarkMode,
  onThemeToggle,
  contentPosts,
  onContentPostClick,
  onContentPostCreate,
  onContentPostDelete,
  onContentPostEdit,
  onContentPostSchedule,
  onContentPostPublish,
  onContentPostPerformanceTrack,
}) => {
  const cryptoManager = useCryptoManager();

  useEffect(() => {
    // Example: Initialize some holdings
    cryptoManager.addHolding({
      id: "1",
      name: "BTC",
      amount: 0.5,
      valuePerUnit: 30000,
      currency: "",
      value: 0,
      ticker: "",
    });
    cryptoManager.addHolding({
      id: "2",
      name: "ETH",
      amount: 2,
      valuePerUnit: 2000,
      currency: "",
      value: 0,
      ticker: "",
    });
  }, [cryptoManager]);

  return (
    <div className={isDarkMode ? "dark-mode" : "light-mode"}>
      <h4>
        {month}/{year}
      </h4>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            onClick={() => onTaskClick(task)}
            onDoubleClick={() => onTaskDoubleClick(task)}
            onContextMenu={(e) => {
              e.preventDefault();
              onTaskContextMenu(task);
            }}
            draggable
            onDragStart={() => onTaskDragStart(task)}
            onDragEnd={() => onTaskDragEnd(task)}
          >
            {task.name}
          </li>
        ))}
        {events.map((event) => (
          <li key={event.id}>{event.name}</li>
        ))}
      </ul>
      <ul>
        {milestones.map((milestone) => (
          <li key={milestone.id} onClick={() => onMilestoneClick(milestone)}>
            {milestone.title}
          </li>
        ))}
      </ul>
      <div>
        <h4>Crypto Holdings</h4>
        <ul>
          {cryptoHoldings.map((holding) => (
            <li key={holding.id}>
              {holding.name}: {holding.amount}
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            onCryptoTransaction({
              id: "",
              amount: 1,
              currency: "BTC",
              timestamp: undefined,
              fromAddress: "",
              toAddress: "",
              valuePerUnit: 0,
              type: "BUY",
              status: "PENDING",
            })
          }
        >
          Buy BTC
        </button>
      </div>
      <div>
        <h4>Content Posts</h4>
        <ul>
          {contentPosts.map((post) => (
            <li key={post.id} onClick={() => onContentPostClick(post)}>
              {post.title} ({post.status})
              <button onClick={() => onContentPostEdit(post)}>Edit</button>
              <button onClick={() => onContentPostDelete(post)}>Delete</button>
              {post.status === "draft" && (
                <>
                  <button onClick={() => onContentPostSchedule(post)}>
                    Schedule
                  </button>
                  <button onClick={() => onContentPostPublish(post)}>
                    Publish
                  </button>
                </>
              )}
              {post.performance && (
                <div>
                  <p>Views: {post.performance.views}</p>
                  <p>Likes: {post.performance.likes}</p>
                  <p>Comments: {post.performance.comments}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={() =>
            onContentPostCreate({
              id: "new",
              title: "",
              content: "",
              scheduledDate: new Date(),
              status: "draft",
            })
          }
        >
          Create New Post
        </button>
      </div>
    </div>
  );
};

export const month: MonthInfo[] = [
  {
    id: Month.January, // Use enum value as ID
    name: "January",
    color: "#333",
    description: "First month of the year",
  },
  {
    id: Month.February.toString(),
    name: "February",
    color: "#333",
    description: "Second month of the year",
  },
  // Add other months as needed
];

export { month };
export default CalendarMonth;

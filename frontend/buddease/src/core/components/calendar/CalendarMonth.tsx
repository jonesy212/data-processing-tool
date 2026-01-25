// CalendarMonth.tsx
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import type { CommonCalendarProps } from "@/core/components/calendar/Calendar";
import { YearInfo } from "@/core/components/calendar/CalendarYear";
import type { MonthInfo } from '@/core/components/calendar/Month';
import { Month } from '@/core/components/calendar/Month';
import { useCryptoManager } from "@/core/components/crypto/CryptoManager";
import { Task } from "@/core/components/models/tasks/Task";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import React, { useEffect } from "react";

interface CalendarMonthProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends CommonCalendarProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  year?: YearInfo[] | number;
  month?: MonthInfo[] | number;
  events: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
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
      category: "",
    });
    cryptoManager.addHolding({
      id: "2",
      name: "ETH",
      amount: 2,
      valuePerUnit: 2000,
      currency: "",
      value: 0,
      ticker: "",
      category: "",
    });
  }, [cryptoManager]);

  return (
    <div className={isDarkMode ? "dark-mode" : "light-mode"}>
      <h4>
        {typeof month === 'number' ? month : ''}/{typeof year === 'number' ? year : ''}
      </h4>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            onClick={() => onTaskClick(task)}
            onDoubleClick={() => onTaskDoubleClick(task)}
            onContextMenu={(event) => {
              event.preventDefault();
              onTaskContextMenu(task, event);
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
    index: 0,
  },
  {
    id: Month.February,
    name: "February",
    color: "#333",
    description: "Second month of the year",
    index: 1,
  },
  // Add other months as needed
];

export default CalendarMonth;

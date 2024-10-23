// DatePicker.ts
import React from "react";

import { useState } from "react";
import Calendar from "./Calendar"; // Assuming Calendar is another component used for date selection
import CryptoTransaction from "../crypto/CryptoTransaction";
import { ContentPost } from "../models/content/ContentPost";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { RootState } from "../state/redux/slices/RootSlice";
import Milestone from "./CalendarSlice";


interface DatePickerProps {
  selectedDate: string;
  onSelectDate: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => {
    setShowCalendar((prevShowCalendar) => !prevShowCalendar);
  };

  const handleDateSelect = (date: Date) => {
    onSelectDate(date);
    toggleCalendar();
  };

  return (
    <div className="date-picker">
      <input
        type="text"
        value={selectedDate}
        readOnly
        onClick={toggleCalendar}
        className="date-picker-input"
      />
      {showCalendar && (
        <div className="date-picker-calendar">
          <Calendar
            projectId={""}
            onDateSelect={handleDateSelect}
            view={""}
            container={undefined}
            speed={0}
            onChangeSpeed={function (newSpeed: number): void {
              throw new Error("Function not implemented.");
            } } selectedProject={function (state: RootState, projectId: string): Project | null {
              throw new Error("Function not implemented.");
            }}
            dependencies={undefined}
            progress={undefined}
            label={undefined}
            month={[]}
            year={[]}
            labels={[]}
            resources={[]}
            events={[]}
            tasks={[]}
            milestones={[]}
            projects={[]}
            onTaskClick={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskDoubleClick={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskContextMenu={function (task: Task, event: React.MouseEvent<Element, MouseEvent>): void {
              throw new Error("Function not implemented.");
            } } onTaskDragStart={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskDragEnd={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskResizingStart={function (task: Task, newSize: number): void {
              throw new Error("Function not implemented.");
            } } onTaskResizingEnd={function (task: Task, newSize: number): void {
              throw new Error("Function not implemented.");
            } } onTaskResize={function (task: Task, newSize: number): void {
              throw new Error("Function not implemented.");
            } } onTaskDrop={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskCreate={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskDelete={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskTitleChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskStatusChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskProgressChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskDependencyChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskFilterChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskLabelChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskParentChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskExpandedChange={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskLinkAdd={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskLinkRemove={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskDependencyAdd={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskDependencyRemove={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskProgressAdd={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskProgressRemove={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onTaskLabelAdd={function (task: Task): void {
              throw new Error("Function not implemented.");
            } } onAudioCallStart={function (participantIds: string[]): void {
              throw new Error("Function not implemented.");
            } } onVideoCallStart={function (participantIds: string[]): void {
              throw new Error("Function not implemented.");
            } } onMessageSend={function (message: string, participantIds: string[]): void {
              throw new Error("Function not implemented.");
            } } onMilestoneClick={function (milestone: Milestone): void {
              throw new Error("Function not implemented.");
            }}
            cryptoHoldings={[]}
            onCryptoTransaction={function (transaction: CryptoTransaction): void {
              throw new Error("Function not implemented.");
            }}
            isDarkMode={false}
            onThemeToggle={function (): void {
              throw new Error("Function not implemented.");
            }}
            contentPosts={[]}
            onContentPostClick={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            } } onContentPostCreate={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            } } onContentPostDelete={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            } } onContentPostEdit={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            } } onContentPostSchedule={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            } } onContentPostPublish={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            } } onContentPostPerformanceTrack={function (post: ContentPost): void {
              throw new Error("Function not implemented.");
            }}






















            kMode={false}
            cryptoHoldings={[]}
            dependencies={undefined}
            label={label}
            progress={progress}
            onTaskClick={onTaskClick}
            onChangeSpeed={onChangeSpeed}
            selectedProject={selectedProject}
            onTaskDoubleClick={onTaskDoubleClick}
            onTaskContextMenu={onTaskContextMenu}
            onTaskDragStart={onTaskDragStart}
            onTaskDragEnd={onTaskDragEnd}
            onTaskResizingStart={onTaskResizingStart}
            onTaskResizingEnd={onTaskResizingEnd}
            onTaskResize={onTaskResize}
            onTaskDrop={onTaskDrop}
            onTaskChange={onTaskChange}
            onTaskCreate={onTaskCreate}
            onTaskDelete={onTaskDelete}
            onTaskTitleChange={onTaskTitleChange}
            onTaskStatusChange={onTaskStatusChange}
            onTaskProgressChange={onTaskProgressChange}
            onTaskDependencyChange={onTaskDependencyChange}
            onTaskFilterChange={onTaskFilterChange}
            onTaskLabelChange={onTaskLabelChange}
            onTaskParentChange={onTaskParentChange}
            onTaskExpandedChange={onTaskExpandedChange}
            onTaskLinkAdd={onTaskLinkAdd}
            onTaskLinkRemove={onTaskLinkRemove}
            onTaskDependencyAdd={onTaskDependencyAdd}
            onTaskDependencyRemove={onTaskDependencyRemove}
            onTaskProgressAdd={onTaskProgressAdd}
            onTaskProgressRemove={onTaskProgressRemove}
            onTaskLabelAdd={onTaskLabelAdd}
            onAudioCallStart={onAudioCallStart}
            onVideoCallStart={onVideoCallStart}
            onMessageSend={onMessageSend}
            onMilestoneClick={onMilestoneClick}
            onCryptoTransaction={onCryptoTransaction}
            onThemeToggle={onThemeToggle}
            onContentPostClick={onContentPostClick}
            onContentPostCreate={onContentPostCreate}
            onContentPostDelete={onContentPostDelete}
            onContentPostEdit={onContentPostEdit}
            onContentPostSchedule={onContentPostSchedule}
            onContentPostPublish={onContentPostPublish}
            onContentPostPerformanceTrack={onContentPostPerformanceTrack}
          
          
          
          
          
          
          
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;

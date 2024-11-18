// DatePicker.ts
import React from "react";
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { Label } from "../projects/branding/BrandingSettings";
import { useState } from "react";
import Calendar, {CommonCalendarProps} from "./Calendar"; // Assuming Calendar is another component used for date selection
import CryptoTransaction from "../crypto/CryptoTransaction";
import { ContentPost } from "../models/content/ContentPost";
import { Task } from "../models/tasks/Task";
import { Project } from "../projects/Project";
import { RootState } from "../state/redux/slices/RootSlice";
import Milestone from "./CalendarSlice";


interface DatePickerProps extends CommonCalendarProps{
  selectedDate: string;
  onSelectDate: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onSelectDate,

  milestones,
  projectId,
  projects,
  onChangeSpeed,
  selectedProject,
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
  onAudioCallEnd,
  onVideoCallStart,
  onVideoCallEnd,
  onMessageSend,
  onMilestoneClick,
  onCryptoTransaction,
  onThemeToggle,
  onContentPostClick,
  onContentPostCreate,
  onContentPostDelete,
  onContentPostEdit,
  onContentPostSchedule,
  onContentPostPublish,
  onContentPostPerformanceTrack,
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
            onChangeSpeed={onChangeSpeed} 
            selectedProject={selectedProject}
            dependencies={undefined}
            progress={{} as Progress}
            label={{} as Label}
            month={[]}
            year={[]}
            labels={[]}
            resources={[]}
            events={[]}
            tasks={[]}
            milestones={[]}
            projects={[]}
            onTaskClick={onTaskClick}
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
            contentPosts={[]}
            onContentPostClick={onContentPostClick}
            onContentPostCreate={onContentPostCreate} 
            onContentPostDelete={onContentPostDelete} 
            onContentPostEdit={onContentPostEdit} 
            onContentPostSchedule={onContentPostSchedule} 
            onContentPostPublish={onContentPostPublish} 
            onContentPostPerformanceTrack={onContentPostPerformanceTrack} 

            isDarkMode={false}
            cryptoHoldings={[]}
            onAudioCallEnd={onVideoCallEnd} 
            onVideoCallEnd={onAudioCallEnd}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;

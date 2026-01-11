// YearView.tsx
import { CommonCalendarProps } from '@/core/components/calendar/Calendar';
import MonthView from '@/core/components/calendar/CalendarMonthView';
import { YearInfo } from '@/core/components/calendar/CalendarYear';
import { Month } from '@/core/components/calendar/Month';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Project } from '@/core/models/projects/Project';
import { RootState } from '@/core/state/redux/slices/RootSlice';
import React, { Fragment } from "react";


interface YearViewProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
> extends CommonCalendarProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  year: YearInfo[];
  getSelectedProject: (state: RootState, projectId: string) => Project | null;
}

const YearView: React.FC<YearViewProps> = ({ tasks, events, milestones, selectedProject, year, projects,  projectId, ...taskHandlers}) => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getEventsForMonth = (month: number) => {
    return events.filter(event => new Date(event.date).getMonth() + 1 === month);
  };

    const getTasksForMonth = (month: number) => {
        return tasks.filter((task) =>
            task.startDate ? new Date(task.startDate).getMonth() + 1 === month : false
        );
    }
      
      const getProjectForMonth = (month: number) => {
    return projects.filter((project) =>
      project.startDate ? new Date(project.startDate).getMonth() + 1 === month : false
    );
  };

  const getMilestonesForMonth = (month: number) => {
    return milestones.filter((milestone) =>
      milestone.startDate ? new Date(milestone.startDate).getMonth() + 1 === month : false
    );
  };
  return (
    <div>
      <h2>Year View</h2>
      <p>Year:</p>
      {year.map((yearInfo, index) => (
        <Fragment key={index}>
          <p>{yearInfo.value}</p> {/* Adjust how you want to render the year information */}
          {months.map((month) => (
            <MonthView
              key={month}
              month={[{
                name: '',
                index: month,
                id: Month.January,
                color: '',
                description: ''
              }]}
              year={[yearInfo]} // Pass the current year as an array
              tasks={getTasksForMonth(month)}
              events={getEventsForMonth(month)}
              projects={getProjectForMonth(month)}
              milestones={milestones}
              selectedProject={selectedProject}
              projectId={projectId}
              {...taskHandlers}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
  
};

export default YearView;

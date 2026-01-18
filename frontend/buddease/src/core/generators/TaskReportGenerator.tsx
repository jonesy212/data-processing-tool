// TaskReportGenerator.tsx

import { Task } from "@/core/components/models/tasks/Task";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';

// Define the structure of the task report
export interface TaskReport {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  // Define the properties of the task report
}

class TaskReportGenerator {
  // Generate task report based on task data
  static generateTaskReport<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]): TaskReport {
    // Implement logic to generate task report
    const taskReport: TaskReport = {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    taskReport.totalTasks = totalTasks;
    taskReport.completedTasks = completedTasks;
    taskReport.completionRate = completionRate;

    return taskReport;
  }
}

export default TaskReportGenerator;

// DayView.jsx
import { TodoList } from '@app/components/lists/TodoList';
import { TaskList } from '@/app/components/lists/TaskList';
import CalendarDay from './CalendarDay';

const DayView = ({ date, events, tasks, projects , todos}) => {
  const selectedProject = null; //set this based on user interaction
  return (
    <div>
      <h2>Day View - {date.toDateString()}</h2>

      {selectedProject ? (
        // Render project details
        <div>
          <h3>Project: {selectedProject.name}</h3>
          <p>Project: {selectedProject.description}</p>
        </div>
      ) : (
          // Render tasks for the day
          <div>
            <h3>Task for {date.toDateString()}</h3>
            {/* Map over tasks array and display each */}
            <TaskList tasks={tasks}/>
          </div>
      )
      }
      {/* Display events for the day */}
      <CalendarDay date={date} events={events} />

      {/* Display project-specific information (e.g., tasks, members, etc.) */}
      <h3>Project:{projects.name}</h3>
      {/* Display tasks for the day */}
      <CalendarDay date={date} tasks={tasks} />
      {/* Display milestones for the day */}
      <CalendarDay date={date} milestones={milestones} />
    </div>
  );
};

export default DayView;

//CalendarEvents.jsx
const transformTasksToEvents = async (tasks) => {
  return Promise.all(
    tasks.map(async (task) => {
      const event = {
        id: task.id,
        title: task.title,
        start: task.startDate,
        end: task.endDate,
        allDay: false,
        elRef: task,
        extendedProps: {
          task,
        },
        calendar: null,
        handleCustomRendering: null,
        resizeId: null,
        isUpdating: false,
        isUnmounting: false,
        render: null,
        componentDidMount: null,
        componentDidUpdate: null,
        componentWillUnmount: null,
        requestResize: () => undefined,
        doResize: () => undefined,
        cancelResize: () => undefined,
        getApi: null,
      };

      return event;
    })
  );
};


const transformTodosToEvents = (todos) => {
  return todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    start: todo.dueDate,
    end: todo.dueDate,
    allDay: false,
    elRef: todo,
    extendedProps: {
      todo,
    },
    calendar: null,
    handleCustomRendering: null,
    resizeId: null,
    isUpdating: false,
    isUnmounting: false,
    state: null,
    render: null,
    componentDidMount: null,
    componentDidUpdate: null,
    componentWillUnmount: null,
    requestResize: null,
    doResize: null,
    cancelResize: null,
    getApi: null,
    // Add more properties as needed
  }));
};

export { transformTasksToEvents, transformTodosToEvents };

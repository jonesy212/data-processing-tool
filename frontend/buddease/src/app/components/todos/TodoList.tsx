import axios from "axios";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import CommonDetails, { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { Phase } from "../phases/Phase";
import { DataAnalysisResult } from "../projects/DataAnalysisPhase/DataAnalysisResult";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";
import useTodoManagerStore from "../state/stores/TodoStore";
import { VideoData } from "../video/Video";
import { Todo } from "./Todo";

type MappedTodo = Pick<Todo, "id" | "title" | "done">;
type MappedAndTodo = Todo & MappedTodo;

const TodoList: React.FC = observer(() => {
  const todoStore = useTodoManagerStore();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get("/api/todos");
        const todos = response.data as Todo[];

        const mappedTodos: Todo[] = todos.map((todo: Todo) => {
          return {
            ...todo,
            id: todo.id as string,
            title: todo.title as string,
            done: todo.done as boolean,
          } as Todo;
        });

        const todoSnapShotData = {} as SnapshotStore<Snapshot<Data>>;

        todoStore.addTodos(mappedTodos, todoSnapShotData); // Remove the unnecessary cast
      } catch (error) {
        console.error("Error fetching todos:", error);
        // Handle the error as needed
      }
    };

    fetchTodos();
  }, [todoStore]);

  const handleUpdateTitle = (id: string, newTitle: string) => {
    todoStore.updateTodoTitle({ id: id, newTitle: newTitle });
  };
  const handleToggle = (id: string) => {
    todoStore.toggleTodo(id as keyof typeof todoStore.todos);
  };

  const handleCompleteAll = () => {
    setTimeout(() => {
      todoStore.completeAllTodos();
    }, 1000);
  };


  const videoData: VideoData = {
    resolution: "",
    aspectRatio: "",
    language: "",
    subtitles: false,
    duration: 0,
    campaignId: 0,
    id: ""
  }

  const handleAdd = () => {
    const newTodoId = "todo_" + Math.random().toString(36).substr(2, 9);
    const addRecurringTodo = () => {
      const newTodo: Todo = {
        id: newTodoId,
        title: "A new todo",
        done: false,
        status: "pending",
        todos: [],
        description: "",
        dueDate: null,
        priority: "low",
        assignedTo: null,
        assignee: null,
        assignedUsers: [],
        collaborators: [],
        labels: [],
        comments: [],
        attachments: [],
        subtasks: [],
        isArchived: false,
        isCompleted: false,
        isBeingEdited: false,
        isBeingDeleted: false,
        isBeingCompleted: false,
        isBeingReassigned: false,
        save: function (): Promise<void> {
          throw new Error("Function not implemented.");
        },
        _id: "",
        isActive: false,
        tags: [],
        then: (callback: (newData: Snapshot<Data>) => void) => callback,

        analysisType: {} as AnalysisTypeEnum,
        analysisResults: {} as DataAnalysisResult[] ,
        phase: {} as Phase,
        videoData: {} as VideoData,
        isDeleted: false,
        isRecurring: false,
        recurringRule: "",
        recurringEndDate: new Date(),
        recurringFrequency: "",
        recurringCount: 0,
        recurringDaysOfWeek: [],
        recurringDaysOfMonth: [],
        recurringMonthsOfYear: [],
        snapshot: {} as Snapshot<Data>,
        entities: [],
        videoUrl: "",
        videoThumbnail: "",
        videoDuration: 0
      }; // Remove the unnecessary cast
      todoStore.addTodo(newTodo);
    };
    handleUpdateTitle(newTodoId, "A new todo");
  };

  return (
    <div>
      <ul>
        {Object.values(todoStore.todos).map(
          (todo: MappedAndTodo & CommonData<Data>) => (
            <li key={todo.id}>
              {todo.title} - {todo.done ? "Done" : "Not Done"}
              <button onClick={() => handleToggle(todo.id as string)}>
                Toggle
              </button>
              <CommonDetails
                data={{}}
                details={{
                  id: todo.id as string,
                  title: todo.title,
                  status: todo.status,
                  importance: todo.priority,
                  startDate: todo.startDate,
                  dueDate: todo.dueDate || undefined,
                }}
              />
            </li>
          )
        )}
      </ul>

      <button onClick={handleAdd}>Add Todo</button>
      <button onClick={handleCompleteAll}>Complete All</button>
    </div>
  );
});

export default TodoList;

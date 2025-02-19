import axios from "axios";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import CommonDetails, { CommonData } from "../models/CommonData";
import { Data } from "../models/data/Data";
import { PriorityTypeEnum, StatusType } from "../models/data/StatusType";
import { AnalysisTypeEnum } from "../projects/DataAnalysisPhase/AnalysisType";
import { Snapshot } from "../snapshots/LocalStorageSnapshotStore";
import SnapshotStore from "../snapshots/SnapshotStore";
import useTodoManagerStore from "../state/stores/TodoStore";
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

        const todoSnapShotData = {} as SnapshotStore<Snapshot<Data, Data>>;

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

  const handleAdd = () => {
    const newTodoId = "todo_" + Math.random().toString(36).substr(2, 9);
    const addRecurringTodo = () => {
      const newTodo: Todo = {
        id: newTodoId,
        title: "A new todo",
        done: false,
        status: StatusType.Pending,
        todos: [],
        description: "This is a description of the new todo item.",
        dueDate: new Date(), // Set a specific due date if needed
        priority: PriorityTypeEnum.Low,
        assignedTo: {
          id: "User123",
          username: "john_doe",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          fullName: "<NAME>",
          avatarUrl: "http://example.com/avatar.jpg"
        },
        assignee: {
          id: "User123",
          username: "john_doe",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          fullName: "John Doe",
          avatarUrl: "http://example.com/avatar.jpg"
        },
        assigneeId: "User123",
        assignedUsers: ["User123"],
        collaborators: [],
        labels: ["urgent", "work"],
        comments: [
          {
            id: "Comment1",
            text: "This is a comment",
            author: "Jane Doe",
            timestamp: new Date().toISOString(),
            postId: "newTodoId",
            pinned: false,
            postedId: "User123",
          },
        ],
        attachments: [],
        subtasks: [],
        isArchived: false,
        isCompleted: false,
        isBeingEdited: false,
        isBeingDeleted: false,
        isBeingCompleted: false,
        isBeingReassigned: false,
        save: function (): Promise<void> {
          return Promise.resolve();
        },
        _id: "newTodoId",
        isActive: true,
        tags: ["task", "example"],
        analysisType: AnalysisTypeEnum.DEFAULT,
        analysisResults: [],
        videoData: {
          url: "http://example.com/video.mp4",
          title: "Example Video",
          description: "This is an example video description.",
          duration: 120,
          isPrivate: false,
          thumbnail: "http://example.com/thumbnail.jpg",
          thumbnailUrl: "http://example.com/thumbnail.jpg",
          isProcessing: false,
          isCompleted: true,
          isUploading: false,
          isDownloading: false,
          isDeleting: false,
          resolution: "1080p",
          size: "500MB",
          aspectRatio: "16:9",
          language: "English",
          subtitles: ["English", "Spanish"],
          codec: "H.264",
          frameRate: 30,
          campaignId: 123,
          id: "video123",
          updatedAt: new Date(),
          uploadedBy: "Uploader",
          viewsCount: 1000,
          likesCount: 150,
          videoDislikes: 10,
          dislikesCount: 10,
          commentsCount: 50,
          videoAuthor: "Author Name",
          videoDurationInSeconds: 120,
          uploadDate: new Date(),
          category: "Tutorial",
          closedCaptions: [],
          license: "Standard YouTube License",
          isLive: false,
          isUnlisted: false,
          isProcessingCompleted: true,
          isProcessingFailed: false,
          isProcessingStarted: true,
          channel: "Example Channel",
          channelId: "channel123",
          isLicensedContent: false,
          isFamilyFriendly: true,
          isEmbeddable: true,
          isDownloadable: true,
          playlists: ["Playlist1", "Playlist2"],
          videoSubtitles: ["English", "Spanish"],
          videoLikes: 150,
          videoViews: 1000,
          videoComments: 50,
          videoThumbnail: "http://example.com/thumbnail.jpg",
          videoUrl: "http://example.com/video.mp4",
          videoTitle: "Example Video",
          videoDescription: "This is an example video description.",
          videoTags: ["example", "tutorial"],
        },
        isDeleted: false,
        isRecurring: false,
        recurringRule: "",
        recurringEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        recurringFrequency: "Weekly",
        recurringCount: 0,
        recurringDaysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
        recurringDaysOfMonth: [],
        recurringMonthsOfYear: [],
        snapshot: {} as Snapshot<Data, Data>,
        entities: [],
        timestamp: new Date().toISOString(),
        category: "Task",
      };      
      // Remove the unnecessary cast
      todoStore.addTodo(newTodo);
    };
    handleUpdateTitle(newTodoId, "A new todo");
  };

  return (
    <div>
      <ul>
        {Object.values(todoStore.todos).map(
          (todo: MappedAndTodo & CommonData) => (
            <li key={todo.id}>
              {todo.title} - {todo.done ? "Done" : "Not Done"}
              <button onClick={() => handleToggle(todo.id as string)}>
                Toggle
              </button>
              <CommonDetails
                data={{
                  id: todo.id as string,
                  title: todo.title,
                  description: todo.description,
                }}
                details={{
                  id: todo.id as string,
                  status: todo.status,
                  importance: todo.priority,
                  startDate: todo.startDate,
                  dueDate: todo.dueDate || undefined,
                  updatedAt: todo.updatedAt,
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

// // TodoList.tsx
// import { observer } from "mobx-react-lite";
// import React from "react";
// import { Link } from "react-router-dom";
// import TodoList from '@/app/components/todos/TodoList'; // Correct the import statement

// interface TodoListProps {
//   todoists?: TodoList[]; // Correct the type for todoists
//   onRemoveTodoList?: (todoist: TodoList) => void;
//   onCompleteTodoList?: (todoist: TodoList) => void;
//   onUpdateTodoListTitle?: (todoistId: string, updatedTitle: string) => void;
//   onUpdateTodoListDescription?: (todoist: TodoList) => void;
//   onUpdateTodoListStatus?: (todoist: TodoList) => void;
// }

// const TodoList: React.FC<TodoListProps> = observer(({ todoists = [] }) => {
//   return (
//     <div>
//       <h2>TodoList List</h2>
//       <ul>
//         {todoists.map((todoist) => ( // Remove explicit type annotation for todoist
//           <li key={todoist.id}>
//             <Link to={`/todoist-details/${todoist.id}`}>
//               {todoist.title} - {todoist.status}
//             </Link>
//             {todoist.details && <TodoDetails todoist={todoist} />}{" "}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// });

// export default TodoList;

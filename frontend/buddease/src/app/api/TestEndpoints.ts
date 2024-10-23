import { endpoints } from "./ApiEndpoints";

const singleTaskEndpoint = (taskId: number): string => `https://nofomoe/api/tasks/${taskId}`;
const removeTaskEndpoint = (taskId: number): string => `https://nofomoe/api/tasks/${taskId}`;
const updateTaskEndpoint = (taskId: number): string => `https://nofomoe/api/tasks/${taskId}`;
const toggleTaskEndpoint = (taskId: number): string => `https://nofomoe/api/tasks/${taskId}/toggle`;
const assignTaskEndpoint = (taskId: number, teamId: number): string => `https://nofomoe/api/tasks/${taskId}/assign/${teamId}`;
const unassignTaskEndpoint = (taskId: number): string => `https://nofomoe/api/todos/${taskId}/unassign`;
const assignTodoEndpoint = (todoId: number, teamId: number): string => `https://nofomoe/api/tasks/${todoId}/assign/${teamId}`;
const unassignTodoEndpoint = (todoId: number): string => `https://nofomoe/api/todos/${todoId}/unassign`;

describe('API Endpoints', () => {
  test('Tasks Endpoints', () => {
    const taskId = 123;
    const teamId = 456;

    // Test tasks endpoints
    expect(endpoints.tasks.list).toBe('https://nofomoe/api/tasks');
    expect(endpoints.tasks.add).toBe('https://nofomoe/api/tasks');
    expect(singleTaskEndpoint(taskId)).toBe(`https://nofomoe/api/tasks/${taskId}`);
    expect(removeTaskEndpoint(taskId)).toBe(`https://nofomoe/api/tasks/${taskId}`);
    expect(updateTaskEndpoint(taskId)).toBe(`https://nofomoe/api/tasks/${taskId}`);
    expect(toggleTaskEndpoint(taskId)).toBe(`https://nofomoe/api/tasks/${taskId}/toggle`);
    expect(assignTaskEndpoint(taskId, teamId)).toBe(`https://nofomoe/api/tasks/${taskId}/assign/${teamId}`);
    expect(unassignTaskEndpoint(taskId)).toBe(`https://nofomoe/api/todos/${taskId}/unassign`);
    expect(endpoints.tasks.completeAll).toBe('https://nofomoe/api/tasks/complete-all');
    expect(endpoints.tasks.removeMultiple).toBe('https://nofomoe/api/tasks/remove-multiple');
    expect(endpoints.tasks.toggleMultiple).toBe('https://nofomoe/api/tasks/toggle-multiple');
    expect(endpoints.tasks.bulkAssign).toBe('https://nofomoe/api/tasks/bulk-assign');
    expect(endpoints.tasks.bulkUnassign).toBe('https://nofomoe/api/tasks/bulk-unassign');
  });

  test('Todos Endpoints', () => {
    const todoId = 789;
    const teamId = 456;

    // Test todos endpoints
    expect(assignTodoEndpoint(todoId, teamId)).toBe(`https://nofomoe/api/tasks/${todoId}/assign/${teamId}`);
    expect(unassignTodoEndpoint(todoId)).toBe(`https://nofomoe/api/todos/${todoId}/unassign`);
    expect(endpoints.todos.bulkAssign).toBe('https://nofomoe/api/todos/bulk-assign');
    expect(endpoints.todos.bulkUnassign).toBe('https://nofomoe/api/todos/bulk-unassign');
  });

  // Add tests for other sections as needed

});

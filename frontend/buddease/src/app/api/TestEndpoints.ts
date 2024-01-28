import { endpoints } from "./ApiEndpoints";

describe('API Endpoints', () => {
  test('Tasks Endpoints', () => {
    const taskId = 123;
    const teamId = 456;

    // Test tasks endpoints
    expect(endpoints.tasks.list).toBe('https://your-api-base-url/api/tasks');
    expect(endpoints.tasks.single(taskId)).toBe(`https://your-api-base-url/api/tasks/${taskId}`);
    expect(endpoints.tasks.add).toBe('https://your-api-base-url/api/tasks');
    expect(endpoints.tasks.remove(taskId)).toBe(`https://your-api-base-url/api/tasks/${taskId}`);
    expect(endpoints.tasks.update(taskId)).toBe(`https://your-api-base-url/api/tasks/${taskId}`);
    expect(endpoints.tasks.completeAll).toBe('https://your-api-base-url/api/tasks/complete-all');
    expect(endpoints.tasks.toggle(taskId)).toBe(`https://your-api-base-url/api/tasks/${taskId}/toggle`);
    expect(endpoints.tasks.removeMultiple).toBe('https://your-api-base-url/api/tasks/remove-multiple');
    expect(endpoints.tasks.toggleMultiple).toBe('https://your-api-base-url/api/tasks/toggle-multiple');
    expect(endpoints.tasks.assign(taskId, teamId)).toBe(`https://your-api-base-url/api/tasks/${taskId}/assign/${teamId}`);
    expect(endpoints.tasks.unassign(taskId)).toBe(`https://your-api-base-url/api/todos/${taskId}/unassign`);
    expect(endpoints.tasks.bulkAssign).toBe('https://your-api-base-url/api/tasks/bulk-assign');
    expect(endpoints.tasks.bulkUnassign).toBe('https://your-api-base-url/api/tasks/bulk-unassign');
  });

  test('Todos Endpoints', () => {
    const todoId = 789;
    const teamId = 456;

    // Test todos endpoints
    expect(endpoints.todos.assign(todoId, teamId)).toBe(`https://your-api-base-url/api/tasks/${todoId}/assign/${teamId}`);
    expect(endpoints.todos.unassign(todoId)).toBe(`https://your-api-base-url/api/todos/${todoId}/unassign`);
    expect(endpoints.todos.bulkAssign).toBe('https://your-api-base-url/api/todos/bulk-assign');
    expect(endpoints.todos.bulkUnassign).toBe('https://your-api-base-url/api/todos/bulk-unassign');
  });

  // Add tests for other sections as needed

});

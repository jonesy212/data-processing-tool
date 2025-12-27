// TodoComponent.tsx
import React, { useState, useEffect } from 'react';
import useDynamicNavigation from "@/app/hooks/useDynamicNavigation";
import useTodoManagerStore from "@/app/state/stores/TodoStore";
import TodoList from "@/app/todos/TodoList";
import TodoProgress from "@/app/todos/TodoProgress";
import { Todo } from "@/app/todos/Todo";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { PriorityTypeEnum, StatusType } from "@/app/models/data/StatusType";
import { observer } from "mobx-react-lite";
import { Button, Card, Spin, Alert, Tabs, Space, Statistic, Progress as AntProgress } from '@/app/models/tracker/ProgressBar';
import { CheckCircleOutlined, PlusOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

interface TodoComponentProps {
  initialFilter?: StatusType;
  showArchived?: boolean;
  onTodoSelect?: (todo: Todo) => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const TodoComponent: React.FC<TodoComponentProps> = observer(({
  initialFilter = StatusType.Pending,
  showArchived = false,
  onTodoSelect,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
}) => {
  const todoStore = useTodoManagerStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  
  // Use dynamic navigation if no todos
  const shouldNavigate = todoStore.todoList.length === 0;
  useDynamicNavigation(shouldNavigate, '/no-todos');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
    
    if (autoRefresh) {
      const interval = setInterval(fetchTodos, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Calculate statistics
  const stats = {
    total: todoStore.todoList.length,
    completed: todoStore.todoList.filter(todo => todo.status === StatusType.Completed).length,
    pending: todoStore.todoList.filter(todo => todo.status === StatusType.Pending).length,
    inProgress: todoStore.todoList.filter(todo => todo.status === StatusType.InProgress).length,
    archived: todoStore.todoList.filter(todo => todo.isArchived).length,
    completionRate: todoStore.todoList.length > 0 
      ? Math.round((todoStore.todoList.filter(todo => todo.status === StatusType.Completed).length / todoStore.todoList.length) * 100)
      : 0,
  };

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      await todoStore.fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTodoSelect = (todo: Todo) => {
    setSelectedTodo(todo);
    if (onTodoSelect) {
      onTodoSelect(todo);
    }
  };

  const handleCreateTodo = () => {
    const newTodo: Todo = {
      _id: `todo_${Date.now()}`,
      id: `todo_${Date.now()}`,
      title: 'New Todo',
      description: '',
      status: StatusType.Pending,
      done: false,
      priority: PriorityTypeEnum.Medium,
      todos: [],
      assignedTo: null,
      assignee: null,
      assigneeId: '',
      assignedUsers: [],
      collaborators: [],
      labels: [],
      comments: [],
      attachments: [],
      subtasks: [],
      entities: [],
      analysisType: AnalysisTypeEnum.DEFAULT,
      analysisResults: [],
      videoData: undefined,
      isDeleted: false,
      isArchived: false,
      isCompleted: false,
      isRecurring: false,
      isBeingDeleted: false,
      isBeingEdited: false,
      isBeingCompleted: false,
      isBeingReassigned: false,
      recurringRule: '',
      recurringEndDate: new Date(),
      recurringFrequency: '',
      recurringCount: 0,
      recurringDaysOfWeek: [],
      recurringDaysOfMonth: [],
      recurringMonthsOfYear: [],
      save: async () => {
        console.log('Saving todo...');
      },
      snapshot: {} as any,
      timestamp: new Date().toISOString(),
      category: 'Task',
    };

    todoStore.addTodo(newTodo);
    setSelectedTodo(newTodo);
  };

  const handleUpdateProgress = (todo: Todo, newProgress: number) => {
    setProgressValue(newProgress);
    // Update todo progress logic here
    console.log(`Updating progress for todo ${todo.id} to ${newProgress}%`);
  };

  const handleTodoClick = async (todoId: Todo['id']) => {
    const todo = todoStore.todoList.find(t => t.id === todoId);
    if (todo) {
      handleTodoSelect(todo);
    }
  };

  const handleMarkComplete = (todoId: string) => {
    todoStore.toggleTodo(todoId);
  };

  const handleArchiveTodo = (todoId: string) => {
    todoStore.archiveTodo(todoId);
  };

  const handleDeleteTodo = (todoId: string) => {
    todoStore.deleteTodo(todoId);
  };

  const handleRefresh = () => {
    fetchTodos();
  };

  const filteredTodos = todoStore.todoList.filter(todo => {
    if (activeTab === 'completed') return todo.status === StatusType.Completed;
    if (activeTab === 'pending') return todo.status === StatusType.Pending;
    if (activeTab === 'in-progress') return todo.status === StatusType.InProgress;
    if (activeTab === 'archived') return todo.isArchived;
    return true; // 'all' tab
  });

  if (loading && todoStore.todoList.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading todos..." />
      </div>
    );
  }

  return (
    <div className="todo-component">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>Todo Dashboard</h2>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateTodo}
              >
                New Todo
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                onClick={handleRefresh}
                loading={loading}
              >
                Refresh
              </Button>
            </Space>
          </div>

          <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
            <Statistic 
              title="Total Todos" 
              value={stats.total} 
              prefix={<CheckCircleOutlined />}
            />
            <Statistic 
              title="Completed" 
              value={stats.completed} 
              valueStyle={{ color: '#3f8600' }}
            />
            <Statistic 
              title="Pending" 
              value={stats.pending} 
              valueStyle={{ color: '#cf1322' }}
            />
            <Statistic 
              title="In Progress" 
              value={stats.inProgress} 
            />
          </Space>

          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Overall Progress</span>
              <span>{stats.completionRate}%</span>
            </div>
            <AntProgress percent={stats.completionRate} status="active" />
          </div>
        </Card>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="All Todos" key="all">
          <Card>
            <TodoList />
          </Card>
        </TabPane>
        <TabPane tab={`Pending (${stats.pending})`} key="pending">
          <Card>
            {filteredTodos.length === 0 ? (
              <Alert
                message="No pending todos"
                description="All caught up! Create a new todo or check other tabs."
                type="info"
                showIcon
              />
            ) : (
              <TodoList />
            )}
          </Card>
        </TabPane>
        <TabPane tab={`In Progress (${stats.inProgress})`} key="in-progress">
          <Card>
            {filteredTodos.length === 0 ? (
              <Alert
                message="No todos in progress"
                description="Start working on some todos!"
                type="info"
                showIcon
              />
            ) : (
              <TodoList />
            )}
          </Card>
        </TabPane>
        <TabPane tab={`Completed (${stats.completed})`} key="completed">
          <Card>
            {filteredTodos.length === 0 ? (
              <Alert
                message="No completed todos"
                description="Complete some todos to see them here."
                type="info"
                showIcon
              />
            ) : (
              <TodoList />
            )}
          </Card>
        </TabPane>
        {showArchived && (
          <TabPane tab={`Archived (${stats.archived})`} key="archived">
            <Card>
              {filteredTodos.length === 0 ? (
                <Alert
                  message="No archived todos"
                  description="Archive some todos to see them here."
                  type="info"
                  showIcon
                />
              ) : (
                <TodoList />
              )}
            </Card>
          </TabPane>
        )}
      </Tabs>

      {selectedTodo && (
        <div style={{ marginTop: 24 }}>
          <Card title="Selected Todo Details">
            <TodoProgress
              todoProgress={[]} // Pass actual progress data
              newProgress={progressValue}
              selectedTodo={selectedTodo}
              onUpdateProgress={handleUpdateProgress}
              onTodoClick={handleTodoClick}
            />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Button 
                  type="primary" 
                  onClick={() => handleMarkComplete(selectedTodo.id)}
                  disabled={selectedTodo.status === StatusType.Completed}
                >
                  {selectedTodo.status === StatusType.Completed ? 'Completed' : 'Mark Complete'}
                </Button>
                <Button 
                  onClick={() => handleArchiveTodo(selectedTodo.id)}
                  disabled={selectedTodo.isArchived}
                >
                  {selectedTodo.isArchived ? 'Archived' : 'Archive'}
                </Button>
                <Button 
                  danger
                  onClick={() => handleDeleteTodo(selectedTodo.id)}
                >
                  Delete
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      )}

      {todoStore.todoList.length === 0 && !loading && (
        <Card style={{ marginTop: 24 }}>
          <Alert
            message="No Todos Found"
            description={
              <>
                <p>You don't have any todos yet. Create your first todo to get started!</p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleCreateTodo}
                  style={{ marginTop: 8 }}
                >
                  Create First Todo
                </Button>
              </>
            }
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        </Card>
      )}
    </div>
  );
});

export default TodoComponent;

// Optional: Create a simpler version for specific use cases
export const SimpleTodoComponent: React.FC = observer(() => {
  const todoStore = useTodoManagerStore();
  const shouldNavigate = todoStore.todoList.length === 0;
  useDynamicNavigation(shouldNavigate, '/no-todos');

  return (
    <div>
      <TodoList />
    </div>
  );
});

// Optional: Todo dashboard component
export const TodoDashboard: React.FC = () => {
  return (
    <div style={{ padding: 24 }}>
      <TodoComponent 
        autoRefresh={true}
        refreshInterval={60000}
        showArchived={true}
      />
    </div>
  );
};
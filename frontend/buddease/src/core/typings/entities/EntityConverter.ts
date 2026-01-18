// EntityConverter.ts
import { useSecureUserId } from '@/core/hooks/useSecureUserId';
import { getUserData, getUsersData, processUserData } from '@/core/api/UsersApi';

import { UserEntityFactory } from '@/utils/userEntityHelpers'
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { ApiEntity } from '@/core/typings/entities/ApiEntity';
import type { SnapshotStorageEntity } from '@/core/typings/entities/SnapshotStorageOptionsEntity';
import type { AppEntity } from '@/core/typings/entities/AppEntity';
import type { AppMetadataEntity } from '@/core/typings/entities/AppMetadataEntity';
import type { ArticleEntity } from '@/core/typings/entities/ArticleEntity';
import type { AuthEntity } from '@/core/typings/entities/AuthEntity';
import type { BlogEntity } from '@/core/typings/entities/BlogEntity';
import type { CalendarEntity } from '@/core/typings/entities/CalendarEntity';
import type { ChatEntity } from '@/core/typings/entities/ChatEntity';
import type { ChatRoomEntity } from '@/core/typings/entities/ChatRoomEntity';
import type { CommonEntities } from '@/core/typings/entities/CommonEntities';
import type { ConfigEntity } from '@/core/typings/entities/ConfigEntity';
import type { ContentEntity } from '@/core/typings/entities/ContentEntity';
import type { DataEntity } from '@/core/typings/entities/DataEntity';
import type { DocumentEntity } from '@/core/typings/entities/DocumentEntity';
import type { DrawingEntity } from '@/core/typings/entities/DrawingEntity';
import { conversionRules } from '@/core/typings/entities/EntityConversionRules';
import type { EntityConversionRules } from '@/core/typings/entities/EntityConversionRules';
import type { EventEntity } from '@/core/typings/entities/EventEntity';
import type { ExampleEntity } from '@/core/typings/entities/ExampleEntity';
import type { ExtendedDappEntity } from '@/core/typings/entities/ExtendedDappEntity';
import type { FileEntity } from '@/core/typings/entities/FileEntity';
import type { FilterEntity } from '@/core/typings/entities/FilterEntity';
import type { LogEntity } from '@/core/typings/entities/LogEntity';
import type { MeetingEntity } from '@/core/typings/entities/MeetingEntity';
import type { MemberEntity } from '@/core/typings/entities/MemberEntity';
import type { MessageEntity } from '@/core/typings/entities/MessageEntity';
import type { MetaEntity } from '@/core/typings/entities/MetaEntity';
import type { NoteEntity } from '@/core/typings/entities/NoteEntity';
import type { NotificationEntity } from '@/core/typings/entities/NotificationEntity';
import type { PhaseEntity } from '@/core/typings/entities/PhaseEntity';
import type { ProductEntity } from '@/core/typings/entities/ProductEntity';
import type { ProjectEntity } from '@/core/typings/entities/ProjectEntity';
import type { ProjectManagementEntity } from '@/core/typings/entities/ProjectManagementEntity';
import type { ProjectManagerEntity } from '@/core/typings/entities/ProjectManagerEntity';
import type { SenderEntity } from '@/core/typings/entities/SenderEntity';
import type { SnapshotContainerEntity } from '@/core/typings/entities/SnapshotContainerEntity';
import type { SnapshotEntity } from '@/core/typings/entities/SnapshotEntity';
import type { StorePropEntity } from '@/core/typings/entities/StorePropEntity';
import type { TagEntity } from '@/core/typings/entities/TagEntity';
import type { TaskEntity } from '@/core/typings/entities/TaskEntity';
import type { TeamEntity } from '@/core/typings/entities/TeamEntity';
import type { TrackerEntity } from '@/core/typings/entities/TrackerEntity';
import type { UserEntity, SecureUserEntity } from '@/core/typings/entities/UserEntity';
import type { VersionEntity } from '@/core/typings/entities/VersionEntity';
import type { VersionHistoryEntity } from '@/core/typings/entities/VersionHistoryEntity';
import type { VideoEntity } from '@/core/typings/entities/VideoEntity';

import type { Attachment } from '@/core/documents/attachment/Attachment';

// --------------------
// Step 1: Define a simplified entity mapping without generics
// --------------------

// Create a base interface that all entities extend
interface BaseEntity {
  id: string | number;
  [key: string]: any;
}

// Simplified mapping without generics
type EntityConversionMap = {
  ApiEntity: ApiEntity;
  AppEntity: AppEntity;
  AppMetadataEntity: AppMetadataEntity;
  ArticleEntity: ArticleEntity;
  AuthEntity: AuthEntity;
  BlogEntity: BlogEntity;
  CalendarEntity: CalendarEntity;
  ChatEntity: ChatEntity;
  ChatRoomEntity: ChatRoomEntity;
  CommonEntities: CommonEntities;
  ConfigEntity: ConfigEntity;
  ContentEntity: ContentEntity;
  DataEntity: DataEntity;
  DocumentEntity: DocumentEntity;
  DrawingEntity: DrawingEntity;
  EventEntity: EventEntity;
  ExampleEntity: ExampleEntity;
  FilterEntity: FilterEntity;
  ExtendedDappEntity: ExtendedDappEntity;
  FileEntity: FileEntity;
  LogEntity: LogEntity;
  MeetingEntity: MeetingEntity;
  MemberEntity: MemberEntity;
  MessageEntity: MessageEntity;
  MetaEntity: MetaEntity;
  NoteEntity: NoteEntity;
  NotificationEntity: NotificationEntity;
  PhaseEntity: PhaseEntity;
  ProductEntity: ProductEntity;
  ProjectEntity: ProjectEntity;
  ProjectManagementEntity: ProjectManagementEntity;
  ProjectManagerEntity: ProjectManagerEntity;
  SenderEntity: SenderEntity;
  SnapshotContainerEntity: BaseEntity; // Simplified - use BaseEntity
  SnapshotEntity: SnapshotEntity;
  SnapshotStorageEntity: SnapshotStorageEntity;
  StorePropEntity: StorePropEntity;
  TaskEntity: TaskEntity;
  TrackerEntity: TrackerEntity;
  UserEntity: UserEntity;
  VersionEntity: VersionEntity;
  VersionHistoryEntity: VersionHistoryEntity;
  VideoEntity: VideoEntity;
  TagEntity: TagEntity;
  TeamEntity: TeamEntity;
}& {
  [RuleKey in keyof typeof conversionRules]: ReturnType<typeof conversionRules[RuleKey]>;
};

// --------------------
// Step 2: Define conversion rules
// --------------------

export const entityConversionRules: Record<keyof EntityConversionMap, (source: any) => any> = {
    UserEntity: (source: UserEntity): SecureUserEntity => {
    // NEVER include password or secret in converted output
    const { password, secret, ...safeData } = source;
    
    return {
      ...safeData,
      teams: source.teams?.map((t: Team) => ({ ...t })) ?? [],
      // Ensure dates are properly handled
      createdAt: source.createdAt instanceof Date ? source.createdAt : new Date(source.createdAt),
      updatedAt: source.updatedAt instanceof Date ? source.updatedAt : new Date(source.updatedAt),
    };
  },
  MemberEntity: (source: MemberEntity) => ({ ...source }),
  TaskEntity: (source: TaskEntity) => ({ ...source }),
  ProjectEntity: (source: ProjectEntity) => ({ ...source }),
  ProjectManagementEntity: (source: ProjectManagementEntity) => ({ ...source }),
  DocumentEntity: (source: DocumentEntity) => ({ ...source }),
  NoteEntity: (source: NoteEntity) => ({ ...source }),
  AppEntity: (source: AppEntity) => ({ ...source }),
  ArticleEntity: (source: ArticleEntity) => ({ ...source }),
  CalendarEntity: (source: CalendarEntity) => ({ ...source }),
  ChatEntity: (source: ChatEntity) => ({ ...source }),
  ChatRoomEntity: (source: ChatRoomEntity) => ({ ...source }),
  ExtendedDappEntity: (source: ExtendedDappEntity) => ({ ...source }),
  FileEntity: (source: FileEntity) => ({ ...source }),
  LogEntity: (source: LogEntity) => ({ ...source }),
  MeetingEntity: (source: MeetingEntity) => ({ ...source }),
  MessageEntity: (source: MessageEntity) => ({ ...source }),
  MetaEntity: (source: MetaEntity) => ({ ...source }),
  NotificationEntity: (source: NotificationEntity) => ({ ...source }),
  PhaseEntity: (source: PhaseEntity) => ({ ...source }),
  ProductEntity: (source: ProductEntity) => ({ ...source }),
  SenderEntity: (source: SenderEntity) => ({ ...source }),
  
  // Use 'any' for complex generic types
  SnapshotContainerEntity: (source: any) => ({ ...source }),
  
  SnapshotEntity: (source: SnapshotEntity) => ({ ...source }),
  SnapshotStorageEntity: (source: SnapshotStorageEntity) => ({ ...source }),
  StorePropEntity: (source: StorePropEntity) => ({ ...source }),
  TrackerEntity: (source: TrackerEntity) => ({ ...source }),
  VersionEntity: (source: VersionEntity) => ({ ...source }),
  VersionHistoryEntity: (source: VersionHistoryEntity) => ({ ...source }),
  VideoEntity: (source: VideoEntity) => ({ ...source }),
  TagEntity: (source: TagEntity) => ({ ...source }),
  TeamEntity: (source: TeamEntity) => ({ ...source }),
  // Default rule: identity (simple spread) for all other entities
} as Record<keyof EntityConversionMap, (source: any) => any>;

// --------------------
// Step 3: EntityConverter class
// --------------------

export class EntityConverter {
  /**
   * Convert a single entity to its mapped target type
   */
  static convertEntity<Source extends keyof EntityConversionMap>(
    source: any
  ): EntityConversionMap[Source] {
    const entityName = source.constructor.name as Source;
    const rule = entityConversionRules[entityName];
    if (rule) return rule(source);

    return { ...source } as EntityConversionMap[Source];
  }

  /**
   * Convert an array of entities to their mapped target types
   */
  static convertEntitiesArray<Source extends keyof EntityConversionMap>(
    sourceArray: any[]
  ): EntityConversionMap[Source][] {
    return sourceArray.map(entity => EntityConverter.convertEntity<Source>(entity));
  }
}


// --------------------
// Step 4: Usage Examples
// --------------------

// Helper function to convert NODE_ENV to AppEntity environment
function getAppEnvironment(): 'development' | 'staging' | 'production' | undefined {
  const nodeEnv = process.env.NODE_ENV;
  
  switch (nodeEnv) {
    case 'development':
      return 'development';
    case 'production':
      return 'production';
    case 'test':
      // Map 'test' to 'development' or handle appropriately
      return 'development'; // or 'staging' if you prefer
    default:
      return 'development';
  }
}

// Alternative: Type-safe environment mapper
const environmentMap: Record<string, 'development' | 'staging' | 'production'> = {
  'development': 'development',
  'dev': 'development',
  'staging': 'staging',
  'stage': 'staging',
  'production': 'production',
  'prod': 'production',
  'test': 'development', // Map test to development
  'testing': 'development',
};

function getSafeAppEnvironment(): 'development' | 'staging' | 'production' {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  return environmentMap[nodeEnv] || 'development';
}


function createMockUserEntity(userId: string): UserEntity {
  const now = new Date();
  const appEnvironment = getAppEnvironment(); // Use the helper
  
  return {
    id: userId,
    name: "Mock User",
    email: "mock@example.com",
    password: "mock-hashed-password",
    role: "user",
    username: "mockuser",
    avatar: "",
    teams: [],
    createdAt: now,
    updatedAt: now,
    isActive: true,
    // AppEntity properties
    appId: 'buddease-mock',
    appName: 'Buddease Mock',
    version: '1.0.0',
    environment: appEnvironment, // Type-safe
    status: 'active',
    lastLogin: now,
    preferences: {},
  };
}

// Example function to get real user data
async function getUserEntityFromAPI(userId: string): Promise<UserEntity> {
  try {
    // Fetch real user data from your API
    const apiUserData = await getUserData(userId);
    const processedData = processUserData(apiUserData);
    
    // Create a complete user entity with real data
    // Note: This assumes UserEntityFactory exists - you need to create it
    return UserEntityFactory.createCompleteUserEntity({
      id: processedData.id || userId,
      name: processedData.name || processedData.username || "User",
      email: processedData.email || "",
      password: processedData.password || "", // Should be hashed already from API
      role: processedData.role || "user",
      appId: processedData.appId || processedData.applicationId || 'buddease',
      appName: processedData.appName || 'Buddease Application',
      version: processedData.version || '1.0.0',
      environment: processedData.environment || 'development',
      status: processedData.status || 'active',
      avatar: processedData.avatar || processedData.profilePicture || "",
      createdAt: new Date(processedData.createdAt || Date.now()),
      updatedAt: new Date(processedData.updatedAt || Date.now()),
      isActive: processedData.isActive ?? true,
      lastLogin: processedData.lastLogin ? new Date(processedData.lastLogin) : undefined,
      preferences: processedData.preferences || {},
      secret: processedData.secret, // Only if provided by API
    });
  } catch (error) {
    console.error('Failed to fetch user data from API:', error);
    // Fallback to mock data
    return createMockUserEntity(userId);
  }
}



// Main usage example
async function mainExample() {
  const { userId, error } = useSecureUserId();

  if (error) {
    console.error('Authentication error:', error);
    return;
  }

  if (!userId) {
    console.warn('No user ID available - using mock data');
    // Use mock data for testing/demo
    const mockUserEntity = createMockUserEntity("test-user-id");
    const mockMemberEntity = EntityConverter.convertEntity<'UserEntity'>(mockUserEntity);
    console.log('Mock member entity:', mockMemberEntity);
    return;
  }

  try {
    // Get REAL user data from API
    const realUserEntity = await getUserEntityFromAPI(userId);
    
    // Convert to MemberEntity using EntityConverter
    const memberEntity = EntityConverter.convertEntity<'UserEntity'>(realUserEntity);
    
    console.log('Converted member entity:', memberEntity);
    
    // Example: Convert array of tasks (using real or mock data)
    const taskEntities: TaskEntity[] = [
      { 
        id: 1, 
        name: "Real Task 1", 
        path: "/tasks/1", 
        draft: false,
        // Add other TaskEntity properties as needed
      }, 
      { 
        id: 2, 
        name: "Real Task 2", 
        path: "/tasks/2", 
        draft: true,
        // Add other TaskEntity properties as needed
      }
    ];
    
    const convertedTasks = EntityConverter.convertEntitiesArray<'TaskEntity'>(taskEntities);
    console.log('Converted tasks:', convertedTasks);
    
    // Convert multiple types dynamically
    const allEntities: any[] = [realUserEntity, ...taskEntities];
    const convertedAll = allEntities.map(e => 
      EntityConverter.convertEntity(e.constructor.name as keyof EntityConversionMap)
    );
    console.log('All converted entities:', convertedAll);
    
  } catch (error) {
    console.error('Error in main example:', error);
  }
}


// Convert multiple types dynamically
async function convertMultipleEntities() {
  const { userId, error } = useSecureUserId();
  
  if (error || !userId) {
    console.error('No user ID available');
    return [];
  }
  
  try {
    // Get real user entity
    const realUserEntity = await getUserEntityFromAPI(userId);
    
    // Get or create task entities
    const taskEntities: TaskEntity[] = [
      { 
        id: 1, 
        name: "Task 1", 
        path: "/tasks/1", 
        draft: false,
        // Add all required TaskEntity properties
      },
      { 
        id: 2, 
        name: "Task 2", 
        path: "/tasks/2", 
        draft: true,
        // Add all required TaskEntity properties
      }
    ];
    
    // Create array with all entities
    const allEntities: any[] = [realUserEntity, ...taskEntities];
    
    // Convert all entities
    const convertedAll = allEntities.map(e => {
      // Use constructor name or type property to determine entity type
      const entityType = e.constructor?.name || e.type || 'Unknown';
      return EntityConverter.convertEntity(entityType as keyof EntityConversionMap)(e);
    });
    
    return convertedAll;
    
  } catch (error) {
    console.error('Error converting entities:', error);
    return [];
  }
}

// Option 2: Using factory patterns
async function convertEntitiesWithFactories() {
  const { userId, error } = useSecureUserId();
  
  if (error || !userId) {
    console.error('Authentication error:', error);
    return [];
  }
  
  // Create user entity using factory
  const userEntity = UserEntityFactory.createCompleteUserEntity({
    id: userId,
    name: "Actual User Name", // Get from user profile or API
    email: "actual@example.com", // Get from user profile or API
    password: "hashed-actual-password", // Get from secure storage
    role: "user", // Get from user profile
    appId: "buddease",
    appName: "Buddease Application",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    status: "active",
    username: "actualuser", // Get from user profile
    avatar: "", // Get from user profile
    teams: [], // Get from user profile
    createdAt: new Date(), // Get from user profile
    updatedAt: new Date(), // Get from user profile
    isActive: true, // Get from user profile
  });
  
  // Create task entities (these might come from API too)
  const taskEntities: TaskEntity[] = [
    { 
      id: 1, 
      name: "Real Task 1", 
      path: "/real-tasks/1", 
      draft: false,
      // ... other TaskEntity properties from your actual data
    },
    { 
      id: 2, 
      name: "Real Task 2", 
      path: "/real-tasks/2", 
      draft: true,
      // ... other TaskEntity properties from your actual data
    }
  ];
  
  // Convert user entity
  const memberEntity = EntityConverter.convertEntity<'UserEntity'>(userEntity);
  
  // Convert task entities
  const convertedTasks = EntityConverter.convertEntitiesArray<'TaskEntity'>(taskEntities);
  
  // Combine and convert all entities
  const allEntities: any[] = [userEntity, ...taskEntities];
  const convertedAll = allEntities.map(e => {
    if (e.id === userEntity.id) {
      return memberEntity; // Already converted
    } else if ('name' in e && 'path' in e && 'draft' in e) {
      // This is likely a TaskEntity
      return EntityConverter.convertEntity<'TaskEntity'>(e);
    }
    // Try to determine type dynamically
    return EntityConverter.convertEntity(e.constructor.name as keyof EntityConversionMap)(e);
  });
  
  return {
    memberEntity,
    convertedTasks,
    convertedAll,
  };
}




async function getTaskEntitiesFromAPI(): Promise<TaskEntity[]> {
  try {
    // Replace with actual API call to get tasks
    // const response = await fetch('/api/tasks');
    
    // For now, return mock data that matches TaskEntity structure
    return [
      { 
        id: 1, 
        name: "API Task 1", 
        path: "/api/tasks/1", 
        draft: false,
        // Add all other TaskEntity properties as needed
      },
      { 
        id: 2, 
        name: "API Task 2", 
        path: "/api/tasks/2", 
        draft: true,
        // Add all other TaskEntity properties as needed
      }
    ];
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return [];
  }
}

async function getMultipleUserEntities(userIds: string[]) {
  try {
    const usersData = await getUsersData(userIds);
    
    // Check if usersData is undefined or null
    if (!usersData) {
      console.warn('No user data returned from API');
      return []; // Return empty array
    }
    
    // Check if usersData is an array
    if (!Array.isArray(usersData)) {
      console.warn('Expected array of user data, got:', typeof usersData);
      return []; // Return empty array
    }
    
    return usersData.map((userData: any) => {
      return UserEntityFactory.createSecureUserEntity({
        id: userData.id,
        name: userData.name || userData.username || "Unknown User",
        email: userData.email,
        role: userData.role || "user",
        avatar: userData.avatar || "",
        
        // AppEntity properties
        appId: userData.appId || 'buddease-app',
        appName: userData.appName || 'Buddease',
        version: userData.version || '1.0.0',
        environment: userData.environment || 'development',
        status: userData.status || 'active',
        
        // Optional
        createdAt: new Date(userData.createdAt || Date.now()),
        updatedAt: new Date(userData.updatedAt || Date.now()),
        isActive: userData.isActive ?? true,
      });
    });
  } catch (error) {
    console.error('Failed to fetch users data:', error);
    throw error;
  }
}

// Main updated example
export async function convertUserAndTasks() {
  const { userId, error } = useSecureUserId();

  if (error) {
    console.error('Authentication error:', error);
    return null;
  }

  if (!userId) {
    console.warn('No user ID available - using mock data');
    
    // Create mock user entity with all required properties
    const mockUserEntity = createMockUserEntity("test-user-id");
    
    // Convert mock user entity
    const mockMemberEntity = EntityConverter.convertEntity<'UserEntity'>(mockUserEntity);
    
    // Get mock tasks
    const mockTaskEntities = await getTaskEntitiesFromAPI();
    const convertedMockTasks = EntityConverter.convertEntitiesArray<'TaskEntity'>(mockTaskEntities);
    
    // Combine mock entities
    const allMockEntities: any[] = [mockUserEntity, ...mockTaskEntities];
    const convertedAllMock = allMockEntities.map(e => 
      EntityConverter.convertEntity(e.constructor.name as keyof EntityConversionMap)
    );
    
    return {
      member: mockMemberEntity,
      tasks: convertedMockTasks,
      all: convertedAllMock,
    };
  }

  try {
    // Get REAL user data from API
    const realUserEntity = await getUserEntityFromAPI(userId);
    
    // Convert to MemberEntity
    const memberEntity = EntityConverter.convertEntity<'UserEntity'>(realUserEntity);
    
    // Get REAL task data from API
    const taskEntities = await getTaskEntitiesFromAPI();
    const convertedTasks = EntityConverter.convertEntitiesArray<'TaskEntity'>(taskEntities);
    
    // Convert all entities dynamically
    const allEntities: any[] = [realUserEntity, ...taskEntities];
    const convertedAll = allEntities.map(e => {
      // Determine entity type
      if (e === realUserEntity) {
        return memberEntity; // Already converted
      } else if (taskEntities.includes(e)) {
        // Find the converted task
        const taskIndex = taskEntities.indexOf(e);
        return convertedTasks[taskIndex];
      }
      // Fallback: try to convert based on type
      const entityType = e.constructor?.name as keyof EntityConversionMap;
      if (entityType && entityConversionRules[entityType]) {
        return entityConversionRules[entityType](e);
      }
      return e; // Return as-is if can't convert
    });
    
    return {
      member: memberEntity,
      tasks: convertedTasks,
      all: convertedAll,
    };
    
  } catch (error) {
    console.error('Error converting entities:', error);
    
    // Fallback to mock data on error
    const fallbackUserEntity = createMockUserEntity(userId);
    const fallbackMemberEntity = EntityConverter.convertEntity<'UserEntity'>(fallbackUserEntity);
    
    return {
      member: fallbackMemberEntity,
      tasks: [],
      all: [fallbackMemberEntity],
      error: 'Failed to load real data, using fallback',
    };
  }
}

// Helper function to create a properly formatted mock user entity
function createMockUserEntity(userId: string): UserEntity {
  const now = new Date();
  return {
    id: userId,
    name: "Mock User",
    email: "mock@example.com",
    password: "mock-hashed-password",
    role: "user",
    username: "mockuser",
    avatar: "",
    teams: [],
    createdAt: now,
    updatedAt: now,
    isActive: true,
    // AppEntity properties
    appId: 'buddease-mock',
    appName: 'Buddease Mock',
    version: '1.0.0',
    environment: 'development',
    status: 'active',
    // Optional properties
    lastLogin: now,
    preferences: {},
  };
}

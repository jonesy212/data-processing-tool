import { ProjectMetadata } from '@/app/configs/StructuredMetadata';
    type Fields<T, K extends Data = T> = Pick<T, K>;

    // Define a utility type that excludes specific keys
    type ExcludeKeys<T, K extends Data> = Omit<T, K>;

    export type { ExcludeKeys, Fields };





// Example of using Fields and ExcludeKeys with UnifiedMetaDataOptions
// Use the Fields utility type to get specific fields from UnifiedMetaDataOptions
type ProjectFields = Fields<ProjectMetadata, 'projectId'>; // { projectId: string }

// Use ExcludeKeys to create a type without specific keys
type TaskWithoutId = ExcludeKeys<TaskMetaData, 'taskId'>; // { taskName: string }

// Example function to demonstrate how to use the union and utility types
function processMetadata<T extends UnifiedMetaDataOptions>(metadata: T) {
  // Example of using Fields utility type to pick specific fields
  const fields = Fields(metadata, 'taskName');
  
  // Example of using ExcludeKeys utility type
  const excludedFields = ExcludeKeys(metadata, 'projectId');

  console.log(fields, excludedFields);
}

// Example of calling the function
const exampleTaskMeta: TaskMetaData = {
  taskId: '123',
  taskName: 'Complete documentation',
};

processMetadata(exampleTaskMeta);
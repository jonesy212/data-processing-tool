// CourseEntity.ts
import { Course } from '@/app/documents/editing/CourseBuilder'
import { 
  BaseEntityProperties, 
  SharedIdentifiers, 
  SharedSnapshotProperties, 
  SharedStatusFlags, 
  SharedTimestamps 
} from '@/app/documents/RelatedProps';


interface CourseEntity extends 
  BaseDataEntity,
  BaseEntityProperties,
  SharedIdentifiers<CourseEntity>,
  SharedTimestamps,
  SharedStatusFlags {
  
  description: string;
  instructorId: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  price?: number;
  thumbnail?: string;
  learningObjectives: string[];
  prerequisites: string[];
  targetAudience: string[];
  language: string;
  level: number;
  maxStudents?: number;
  certificateAvailable: boolean;
}

// Course-specific type parameters
type CourseK = CourseEntity;
type CourseMeta = DefaultMeta<CourseEntity, CourseK> & {
  level?: string;
  category: string;
  tags: string[];
  rating?: number;
  enrollmentCount: number;
};
type CourseAttachment = Attachment;
type CourseExcludedFields = DefaultExcludedFields<CourseEntity> | "price" | "instructorId";
type CourseIncludedFields = keyof CourseEntity;

// Course base params
type CourseBaseParams = {
  T: CourseEntity;
  K: CourseK;
  Meta: CourseMeta;
  AttachmentType: CourseAttachment;
  ExcludedFields: CourseExcludedFields;
  IncludedFields: CourseIncludedFields;
};

type AppCourse = Course<CourseEntity, CourseK, CourseMeta, CourseAttachment, CourseExcludedFields, CourseIncludedFields>

export type { CourseEntity, CourseK, CourseMeta, CourseAttachment, CourseExcludedFields, CourseIncludedFields }
// LessonEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { 
  BaseEntityProperties, 
  SharedIdentifiers, 
  SharedSnapshotProperties, 
  SharedStatusFlags, 
  SharedTimestamps 
} from '@/app/documents/RelatedProps';


interface LessonEntity extends 
  BaseDataEntity,
  BaseEntityProperties,
  SharedTimestamps,
  SharedStatusFlags {
  
  // Lesson-specific fields only
  content: string;
  order: number;
  duration: number;
  phaseId: string;
  lessonType: 'video' | 'text' | 'quiz' | 'exercise';
  videoUrl?: string;
  transcript?: string;

}
// LessonEntity.ts
import { BaseDataEntity } from '@/core/config/BaseConfig';
import {
    BaseEntityProperties,
    SharedStatusFlags,
    SharedTimestamps
} from '@/core/documents/RelatedProps';


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
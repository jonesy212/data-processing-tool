// CourseBuilder.tsx
import type { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import { createMeta } from "@/core/config/metadata/createMeta";
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import { useMetadata } from "@/core/config/useMetadata";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type {
    BaseEntityProperties,
    SharedSnapshotProperties,
    SharedStatusFlags,
    SharedTimestamps
} from '@/core/documents/RelatedProps';
import { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import type { BaseData } from '@/core/models/data/Data';
import type { CustomPhaseHooks, Phase, PhaseData } from '@/core/models/phases/Phase';
import type { FetchOptions, fetchUserAreaDimensions } from '@/core/pages/layouts/fetchUserAreaDimensions';
import { VisibilityLevel } from '@/core/permissions/PermissionEnums';
import type { CourseAttachment, CourseEntity, CourseExcludedFields, CourseIncludedFields, CourseK, CourseMeta } from '@/core/typings/entities/CourseEntity';
import type { PhaseAttachment, PhaseEntity, PhaseExcludedFields, PhaseIncludedFields, PhaseK, PhaseMeta } from "@/core/typings/entities/PhaseEntity";
import type { BasicUserInfo } from '@/core/typings/entities/UserEntity';


// Interfaces for course structure
interface Lesson {
  title: string;
  content: string;
}

interface Course<
  T extends BaseDataEntity = CourseEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = CourseMeta,
  AttachmentType extends Attachment = CourseAttachment,
  ExcludedFields extends keyof T = CourseExcludedFields,
  IncludedFields extends keyof T = CourseIncludedFields
> extends SharedSnapshotProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Core course data
  id: string;
  title: string;
  description: string;
  
  // Composition instead of inheritance
  entities: {
    phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    instructor: BasicUserInfo;
    attachments: AttachmentType[];
  };
  
  // Course-specific metadata
  meta: Meta;
  category: string;
  difficulty: string;
  totalDuration: number;
  enrollmentCount: number;
}

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

type AdaptedPhaseData = PhaseData<PhaseEntity, PhaseK, PhaseMeta,PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>
& BaseData<PhaseEntity, PhaseK, PhaseMeta,PhaseAttachment, PhaseExcludedFields, PhaseIncludedFields>;

// Class generator to create course structure
class CourseBuilder<
  T extends BaseDataEntity = CourseEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = CourseMeta,
  AttachmentType extends Attachment = CourseAttachment,
  ExcludedFields extends keyof T = CourseExcludedFields,
  IncludedFields extends keyof T = CourseIncludedFields
> {
  private course: Course<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  constructor(title: string) {
    this.course = { 
      title, 
      id: '',
      description: '',
      entities: {
        phases: [],
        instructor: {} as BasicUserInfo,
        attachments: []
      },
      meta: {} as Meta,
      category: '',
      difficulty: '',
      totalDuration: 0,
      enrollmentCount: 0
    };
  }

  getCourse(): Course<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.course;
  }

  addCoursePhase(phaseTitle: string): void {
    this.addPhase(phaseTitle);
  }

  addPhase<
    PT extends T = T,  // Use class-level T as constraint
    PK extends K = K,  // Use class-level K as constraint  
    PMeta extends Meta = Meta  // Use class-level Meta as constraint
  >(
    phaseTitle: string
  ): void {
    // Get the area dimensions (with optional properties)
    const dimensions = fetchUserAreaDimensions();

    // Construct the area object with optional properties
    const area = {
      prefix: 'USER',
      name: 'JohnDoe',
      type: NotificationTypeEnum.USER_ID,
      id: '12345',
      title: 'UserAccount',
      dimensions: dimensions,
      chatThreadName: 'GeneralChat',
      chatMessageId: 'msg-1',
      chatThreadId: 'thread-1',
      dataDetails: { key: 'value', date: new Date() },
      generatorType: 'customType',
    };

    // Use class-level generic parameters in FetchOptions
    const options: FetchOptions<PT, PK, PMeta, AttachmentType, ExcludedFields, IncludedFields> = {
      elementId: area.id,
      listenForResize: true,
      onChange: (dimensions) => {
        console.log(`Updated dimensions for area "${area.name}":`, dimensions);
      }
    };

    // Call the fetchUserAreaDimensions function
    const areaDimensions = fetchUserAreaDimensions(options);
    
    // Use class-level generic parameters for metadata
    const currentMeta: PMeta = createMeta<PT, PK>({
      id: 'meta-id',
      description: 'Phase Meta',
    });

    // Use class-level generic parameters for unified metadata
    const currentMetadata: UnifiedMetadata<PT, PK, PMeta, AttachmentType, ExcludedFields, IncludedFields> = 
      useMetadata<PT, PK, PMeta>({ area: 'phase-area' });

    // Generate unique ID
    const generateUniqueId = UniqueIDGenerator.generateID(
      area.prefix,
      area.name,
      area.type,
      area.id,
      area.title,
      area.chatThreadName,
      area.chatMessageId,
      area.chatThreadId,
      area.dataDetails,
      area.generatorType
    );

    // Create phase using class-level generic parameters
    const phase: Phase<PT, PK, PMeta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: generateUniqueId,
      title: phaseTitle,
      description: "",
      label: {
        text: "",
        color: "" 
      },
      currentMeta: currentMeta,
      currentMetadata: currentMetadata,
      date: new Date(),
      lessons: [],
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      subPhases: [],
      component: {} as React.FC,
      hooks: {} as CustomPhaseHooks<PT, PK, PMeta, AttachmentType, ExcludedFields, IncludedFields>,
      duration: 0,
      
      // Normalized shared properties
      ...this.createBaseEntityProperties(phaseTitle, 'PHASE'),
      ...this.createSharedTimestamps(),
      ...this.createSharedStatusFlags(),
      
      // Phase-specific normalized properties
      order: this.course.entities.phases.length + 1,
      objectives: [],
      courseId: this.course.id,
      phaseType: 'content',
      
      // Shared snapshot properties
      permissions: [],
      visibility: 'public' as VisibilityLevel
    };

    this.course.entities.phases.push(phase as any);
    this.course.phases.push(phase as any);
  }

  // Specialized phase methods using class-level generics
  addVideoPhase<
    PT extends T = T,
    PK extends K = K, 
    PMeta extends Meta & { videoType: string } = Meta & { videoType: string }
  >(
    title: string, 
    videoUrl: string
  ): void {
    const videoMeta: PMeta = {
      ...this.createBaseMeta(),
      videoType: 'interactive',
      description: `Video phase: ${title}`
    } as PMeta;

    this.addPhase<PT, PK, PMeta>(title);
  }

  addQuizPhase<
    PT extends T = T,
    PK extends K = K,
    PMeta extends Meta & { quizConfig: any } = Meta & { quizConfig: any }  
  >(
    title: string, 
    questionCount: number
  ): void {
    const quizMeta: PMeta = {
      ...this.createBaseMeta(),
      quizConfig: { questionCount, timeLimit: 30 },
      description: `Quiz phase: ${title}`
    } as PMeta;

    this.addPhase<PT, PK, PMeta>(title);
  }

  // Helper method for base metadata
  private createBaseMeta(): Partial<Meta> {
    return {
      id: 'meta-id',
      description: 'Phase metadata',
      tags: [],
      keywords: []
    };
  }

  addLesson(phaseIndex: number, lesson: Lesson): void {
    const course = this.getCourse();
    if (
      course &&
      course.phases &&
      phaseIndex >= 0 &&
      phaseIndex < course.phases.length
    ) {
      const currentPhase = course.phases[phaseIndex];
      if (currentPhase.lessons) {
        currentPhase.lessons.push(lesson);
      } else {
        currentPhase.lessons = [lesson];
      }
    } else {
      throw new Error("Invalid phase index");
    }
  }

  generateCourse(): Course<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    return this.course;
  }

  // Helper methods for normalized structure
  private createBaseEntityProperties(title: string, type: string): BaseEntityProperties {
    return {
      title,
      name: title,
      type: type as any,
      key: `${type.toLowerCase()}_${title.toLowerCase().replace(/\s+/g, '_')}`
    };
  }

  private createSharedTimestamps(): SharedTimestamps {
    return {
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createSharedStatusFlags(): SharedStatusFlags {
    return {
      isActive: true,
      isCompleted: false
    };
  }
}

// basic usage
const courseBuilder = new CourseBuilder("Cryptocurrency Workshop");

courseBuilder.addPhase("Month 1 - Intro To Cryptocurrency");
courseBuilder.addLesson(0, {
  title: "Lesson 1: Overview of Cryptocurrency",
  content: "...",
});

courseBuilder.addPhase("Month 2 - How To Trade");
courseBuilder.addLesson(1, {
  title: "Lesson 1: Introduction to Trading",
  content: "...",
});


// Specialized usage with custom types
const advancedBuilder = new CourseBuilder<CourseEntity, CourseK, CourseMeta & { advanced: boolean }>(
  "Advanced Course"
);

advancedBuilder.addVideoPhase("Advanced Video Phase", "video-url");
advancedBuilder.addQuizPhase("Assessment", 10);


const cryptocurrencyCourse = courseBuilder.generateCourse();
console.log(cryptocurrencyCourse);

export type { Course, Lesson };

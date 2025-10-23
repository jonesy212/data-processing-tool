// CourseBuilder.tsx

import { NotificationTypeEnum } from '@/app/context/NotificationContext';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { BaseData } from '@/app/models/data/Data';
import { CustomPhaseHooks, Phase, PhaseData, PhaseMeta } from '@/app/models/phases/Phase';
import { FetchOptions, fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { UnifiedMetadata } from "@/config/MetaDataOptions";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { useMetadata } from "@/config/useMetadata";
import { createMeta } from "@/server/metadata/MetadataHooks";
import { Attachment } from '@/app/documents/attachment/Attachment'
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

// Interfaces for course structure
interface Lesson {
  title: string;
  content: string;
}

interface Course <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>{
  title: string;
  phases: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}


type AdaptedPhaseData = PhaseData & BaseData<any, any>;


// Class generator to create course structure
class CourseBuilder {
  private course: Course;

  constructor(title: string) {
    this.course = { title, phases: [] };
  }

  getCourse(): Course {
    return this.course;
  }
  

    addCoursePhase(phaseTitle: string): void {
      this.addPhase<AdaptedPhaseData<T, K>>(phaseTitle);
    }
  
  addPhase<
    T extends PhaseData<BaseData<any, any, StructuredMetadata<any, any>>>,
    K extends T = T,
    Meta extends PhaseMeta = PhaseMeta
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
        dimensions: dimensions, // Add the dimensions to the area object
        chatThreadName: 'GeneralChat', // Optional
        chatMessageId: 'msg-1', // Optional
        chatThreadId: 'thread-1', // Optional
        dataDetails: { key: 'value' }, // Optional
        generatorType: 'customType', // Optional
      };


    // Dynamically set the FetchOptions using properties from the `area` object
    const options: FetchOptions = {
      elementId: area.id, // Use `area.id` as the `elementId`
      listenForResize: true, // Set to true to listen for resize
      onChange: (dimensions) => {
        console.log(`Updated dimensions for area "${area.name}":`, dimensions);
      }
    };

    // Call the fetchUserAreaDimensions function using the dynamically created options
    const areaDimensions = fetchUserAreaDimensions(options);
    // Use 'useMeta' for currentMeta with PhaseMeta constraints
    const currentMeta: Meta = createMeta<T, K>({
      id: 'meta-id',
      description: 'Phase Meta',
    });

    // Use `useMetadata` with appropriate type arguments for UnifiedMetaDataOptions
    const currentMetadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = 
      useMetadata<T, K, Meta>({ area: 'phase-area' });

    

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
    // Example logic for adding a phase
    this.course.phases.push({
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
        component: {} as React.FC, // Use React.FC as the type
        hooks: {} as CustomPhaseHooks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        duration: 0,
    }
    );
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
        // If lessons array doesn't exist, create it and add the lesson
        currentPhase.lessons = [lesson];
      }
    } else {
      throw new Error("Invalid phase index");
    }
  }
  
  generateCourse(): Course {
    return this.course;
  }
}

// Example usage
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

const cryptocurrencyCourse = courseBuilder.generateCourse();
console.log(cryptocurrencyCourse);

export type { Lesson };

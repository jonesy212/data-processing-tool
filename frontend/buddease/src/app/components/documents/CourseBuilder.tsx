// CourseBuilder.tsx

import { CustomPhaseHooks, Phase } from "../phases/Phase";

// Interfaces for course structure
interface Lesson {
  title: string;
  content: string;
}

interface Course {
  title: string;
  phases: Phase[];
}

// Class generator to create course structure
class CourseBuilder {
  private course: Course;

  constructor(title: string) {
    this.course = { title, phases: [] };
  }

  addPhase(phaseTitle: string): void {
    this.course.phases.push({
      title: phaseTitle,
      lessons: [],
      name: "",
      startDate: undefined,
      endDate: undefined,
      subPhases: [],
      component: {} as React.FC, // Use React.FC as the type
      hooks: {} as CustomPhaseHooks,
      duration: 0,
    });
  }

  addLesson(phaseIndex: number, lesson: Lesson): void {
    if (phaseIndex < this.course.phases.length) {
      this.course.phases[phaseIndex].lessons.push(lesson);
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

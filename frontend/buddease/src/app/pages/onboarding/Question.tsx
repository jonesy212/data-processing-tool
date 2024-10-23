// Question.tsx
interface DynamicData {
  [key: string]: any;
}

export interface Question {
  id: string;
  text: string;
  type: "multipleChoice" | "text" | "multiAnswer" | 'boolean' ;
  options?: {
    value: string;
    label: string;
  }[];
  answer?: string;
  columnName?: string;
}

export const generateDynamicData = (questions: Question[]): DynamicData => {
  const dynamicData: DynamicData = {};

  questions.forEach((question) => {
    if (question.columnName) {
      dynamicData[question.columnName] = question.answer;
    }
  });

  return dynamicData;
};

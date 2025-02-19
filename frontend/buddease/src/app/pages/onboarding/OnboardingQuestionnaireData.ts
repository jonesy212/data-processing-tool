// onboardingQuestionnaireData.ts
import { Question } from "./Question";

const onboardingQuestionnaireData: {
  forEach(arg0: (question: any) => void): unknown;
  title: string;
  description: string;
  questions: Question[];
} = {
  title: "User Questionnaire",
  description: "Please answer the following questions, so we can best know you and how we can assist and make your profile: ",
  questions: [
    {
      id: "1",
      text: "How tech-savvy would you consider yourself? (e.g., beginner, intermediate, advanced)",
      type: "multipleChoice",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
      ],
    },
    {
      id: "2",
      text: "What is your favorite color?",
      type: "multipleChoice",
      options: [
        { value: "red", label: "Red" },
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
      ],
    },
    {
      id: "3",
      text: "How often do you work with others?",
      type: "multipleChoice",
      options: [
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
        { value: "rarely", label: "Rarely" },
      ],
    },
    {
      id: "4",
      text: "Which best describes your primary use of the Ideas app? (e.g., note-taking, idea brainstorming, project management)",
      type: "text",
    },
    {
      id: "5",
      text: "If using the Ideas app for project management, what specific features would you prioritize? (e.g., task deadlines, team collaboration, progress tracking)",
      type: "multiAnswer",
      options: [
        { value: "task deadlines", label: "Task Deadlines" },
        { value: "team collaboration", label: "Team Collaboration" },
        { value: "progress tracking", label: "Progress Tracking" },
        { value: "document sharing", label: "Document Sharing" },
      ],
    },
    {
      id: "6",
      text: "If we can meet your basic needs, how often do you see yoursef using the app? (e.g., casual, regular, intense)",
      type: "multipleChoice",
      options: [
        { value: "casual", label: "Casual" },
        { value: "regular", label: "Regular" },
        { value: "intense", label: "Intense" },
      ],
    },
    {
      id: "7",
      text: "What additional features would you like to see in the Ideas app to enhance your experience?",
      type: "multiAnswer",
      options: [
        { value: "calendar integration", label: "Calendar Integration" },
        {
          value: "collaborative document editing",
          label: "Collaborative Document Editing",
        },
        { value: "mobile app", label: "Mobile App" },
        {
          value: "integration with other tools",
          label: "Integration with Other Tools",
        },
      ],
    },
  ],
  forEach: function (arg0: (question: any) => void): unknown {
    this.questions.forEach(arg0);
    return 
    }
};

export default onboardingQuestionnaireData;

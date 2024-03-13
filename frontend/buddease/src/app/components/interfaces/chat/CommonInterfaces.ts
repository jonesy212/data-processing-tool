// CommonInterfaces.ts
//todo this can be use to try an better organize the types throughout the app
type DummyCardItemType = { type: "file" | "folder" };
type OrganizedCardItemType = { type: "file" | "folder" | "product" | "feedback" };
type VisualizationType = { type: "line" | "bar" };
type PromptOption = { id: string; text: string };
type PromptType = { id: string; text: string; type: "text" | "multipleChoice"; options?: PromptOption[] };

// Define interfaces with their respective union types
interface DummyCardLoaderProps {
  items: DummyCardItemType[];
}

interface OrganizedCardLoaderProps {
  items: OrganizedCardItemType[];
}

interface VisualizationProps {
  type: VisualizationType;
}

interface Prompt {
  id: string;
  text: string;
  type: PromptType;
  options?: PromptOption[];
}

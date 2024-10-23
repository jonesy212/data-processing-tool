import DynamicContentProps from '@/app/components/cards/DummyCardLoader';
import React from "react";
import { PersonaTypeEnum } from '../PersonaBuilder';
import { PersonaData } from "./PersonaData";

interface PersonaPanelProps {
  persona: string;
  contentProps: typeof DynamicContentProps; // Pass dynamic content props to render
  personaData: PersonaData;
  userPersonas: string[];
  businessPersonas: string[];
  socialPersonas: string[];
  selectedPersona: string;
  onSelectPersona: (persona: PersonaTypeEnum) => void;
}

const PersonaPanel: React.FC<PersonaPanelProps> = ({
  persona,
  contentProps,
  personaData,
}) => {
  return (
    <div>
      <h1>{persona} Panel</h1>
      {/* You can conditionally render static or dynamic content here */}
      {renderDynamicContent(contentProps)}

      {/* Render specific persona data here */}
      {renderPersonaData(personaData[persona])}
    </div>
  );
};

const renderPersonaData = (data: string[]) => {
  // Render specific persona data based on the provided array
  return (
    <ul>
      {data.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};
const renderDynamicContent = (props: typeof DynamicContentProps) => {
  if ("fontSize" in props && "fontFamily" in props) {
    // Dynamic rendering based on the type of props
    if ("fontSize" in props) {
      // Dynamic rendering of BodyText component
      return (
        <p
          style={{
            fontSize: props.fontSize as string,
            fontFamily: props.fontFamily as string,
          }}
        >
          Dynamic Body Text
        </p>
      );
    } else {
      // Dynamic rendering of Heading component
      return (
        <h3
          style={{
            fontSize: props["fontSize"] as string,
            fontFamily: props["fontFamily"] as string,
          }}
        >
          Dynamic Heading
        </h3>
      );
    }
  }
  // Handle the case where neither "fontSize" nor "fontFamily" is present
  return null;
};

export default PersonaPanel;

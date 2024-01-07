import React from "react";
import DynamicTypography, { DynamicContentProps } from "./DummyCardLoader";
interface PersonaCardProps {
  persona: string;
  data: any; // Add the actual data structure for persona here
  children: React.ReactNode;
}

const PersonaCard: React.FC<PersonaCardProps & DynamicContentProps> = ({
  persona,
  data,
}) => {
  return (
    <div>
      <h1>{persona} Card</h1>
      {/* Render specific persona data here */}
      <DynamicTypography
        fontSize="18px"
        fontFamily="Arial, sans-serif"
        dynamicContent
      >
        {data && (
          <>
            <p>{`Extraversion: ${data.extraversion}`}</p>
            <p>{`Sensing: ${data.sensing}`}</p>
            <p>{`Thinking: ${data.thinking}`}</p>
            <p>{`Judging: ${data.judging}`}</p>
          </>
        )}
      </DynamicTypography>
    </div>
  );
};

// Card Generator Component
const CardGenerator: React.FC<{
  cardType: string;
  persona: string;
  data: any;
  fontFamily: any;
  fontSize: any;
  children: React.ReactNode;
}> = ({ cardType, persona, fontFamily, fontSize, data, children }) => {
  switch (cardType) {
    case "PersonaCard":
      return (
        <PersonaCard
          persona={persona}
          data={data}
          children={children}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      );
    // Add more cases for other card types
    default:
      return <div>Invalid Card Type</div>;
  }
};

export { PersonaCard };

export default CardGenerator; 

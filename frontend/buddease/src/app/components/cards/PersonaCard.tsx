import React, { ReactNode } from "react";
import { ThemeConfigProps } from "../hooks/userInterface/ThemeConfigContext";
import { SupportedData } from '../models/CommonData';
import DetailsProps from "../models/data/Details";
import DynamicTypography from "./DummyCardLoader";


interface PersonaCardProps {
  persona: string;
  data: any;
  title: any
  fontSize: ThemeConfigProps['fontSize'];
  fontFamily: ThemeConfigProps['fontFamily'];
  children: React.ReactNode;
}
const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  data,
  title,
  fontSize,
  fontFamily,
  children,
}) => {
  return (
    <div>
      <h1>{persona} Card</h1>
      {/* Render specific persona data here */}
      
      <DynamicTypography fontSize={fontSize} fontFamily={fontFamily}  {...title}>
        {data && (
          <>
            <p>{`Extraversion: ${data.extraversion}`}</p>
            <p>{`Sensing: ${data.sensing}`}</p>
            <p>{`Thinking: ${data.thinking}`}</p>
            <p>{`Judging: ${data.judging}`}</p>
          </>
        )} 
        {children}
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
}> = ({ cardType, persona, fontFamily, fontSize, data }) => {
  switch (cardType) {
    case "PersonaCard":
      return (
        <PersonaCard
          persona={persona}
          data={data}
          fontSize={fontSize}
          fontFamily={fontFamily}
          children={null}
          title={(props: DetailsProps<SupportedData>, context?: any): ReactNode => {
            if (!props.data) {
              return null; // or handle the case where data is undefined
            }  
            return (
              <>
                
                <h2>{props.data.title}</h2>
                <p>{props.data.description}</p>
              </>
            );
          }}
        />
      );
    // Add more cases for other card types
    default:
      return <div>Invalid Card Type</div>;
  }
};

export { PersonaCard };

export default CardGenerator; 

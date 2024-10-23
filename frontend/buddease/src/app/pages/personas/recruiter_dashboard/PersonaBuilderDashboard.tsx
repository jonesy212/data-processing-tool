import axios from "axios"; // Import Axios library
import { useEffect, useState } from "react";

import { OrganizedCardLoaderProps } from "@/app/components/cards/DummyCardLoader";
import { PersonaCard } from "@/app/components/cards/PersonaCard";
import DetailsList from "@/app/components/lists/DetailsList";
import {
    SupportedData,
} from "@/app/components/models/CommonData";
import { Data } from "@/app/components/models/data/Data";
import DetailsProps from "@/app/components/models/data/Details";
import DetailsListItem from "@/app/components/models/data/DetailsListItem";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import DataPreview from "../../../components/users/DataPreview";
import { PersonaData, PersonaTypeEnum } from "../PersonaBuilder";
import PersonaPanel from "./PersonaPanel";
import React from "react";


// Define initial personas
const initialUserPersonas = [
  "Music Persona",
  "Film Persona",
  "Art Persona",
  "Casual User",
];

const initialBusinessPersonas = [
  "Developer",
  "UI Designer",
  "Job Seeker",
  "Creator",
  "Project Manager",
  "Strategist",
  "Data Analyst", 
  "Content Creator", 
];

const initialSocialPersonas = [
  "Influencer",
  "Social Media Manager",
  "Blogger", 
];

// Define additional personas
const additionalUserPersonas = [
  "Fashion Enthusiast",
  "Gamer Persona",
  "Fitness Enthusiast",
];

const additionalBusinessPersonas = ["Data Analyst", "Content Creator"];

const additionalSocialPersonas = ["Blogger", "Content Creator"];

// Merge initial and additional personas
const userPersonas = [...initialUserPersonas, ...additionalUserPersonas];
const businessPersonas = [...initialBusinessPersonas, ...additionalBusinessPersonas];
const socialPersonas = [...initialSocialPersonas, ...additionalSocialPersonas];

// Now userPersonas, businessPersonas, and socialPersonas are properly integrated with the additional personas included.

// Define personality traits based on MBTI dichotomies
const personalityTraits = {
  extraversion: ["Introverted", "Extraverted"],
  sensing: ["Intuitive", "Observant"],
  thinking: ["Feeling", "Thinking"],
  judging: ["Perceiving", "Judging"],
};


// Define personaData using PersonaTypeEnum enum keys
const personaData: PersonaData = {
  [PersonaTypeEnum.Music]: getPersonaData(
    "Passionate about music and knowledgeable in various genres.",
    "Active involvement in music creation or appreciation communities.",
    "May contribute to collaborative music projects within the app."
  ),
  [PersonaTypeEnum.Film]: getPersonaData(
    "Enthusiastic about films, from classics to contemporary releases.",
    "Possesses insights into cinematography, storytelling, and film analysis.",
    "May participate in discussions or collaborative projects related to film."
  ),
  [PersonaTypeEnum.Art]: getPersonaData(
    "Creative and skilled in various forms of visual arts.",
    "Engages in art communities and appreciates diverse artistic styles.",
    "Potential interest in collaborative art projects within the app."
  ),
  [PersonaTypeEnum.CasualUser]: getPersonaData(
    "Frequent user for various purposes without specific professional focus.",
    "Enjoys the app for entertainment, relaxation, or casual interactions.",
    "May explore different features without a specific project-related goal."
  ),
  [PersonaTypeEnum.ProjectManager]: getPersonaData(
    "Experienced in coordinating project tasks and timelines.",
    "Skilled in team management and collaboration.",
    "Strategic thinker with a focus on project goals."
  ),
  [PersonaTypeEnum.Developer]: getPersonaData(
    "Proficient in coding and development languages.",
    "Comfortable with version control systems and collaborative coding.",
    "Problem solver and detail-oriented in coding tasks."
  ),
  [PersonaTypeEnum.UIDesigner]: getPersonaData(
    "Creative and innovative in designing user interfaces.",
    "Familiar with design tools and industry trends.",
    "Attention to detail in creating visually appealing designs."
  ),
  [PersonaTypeEnum.Influencer]: getPersonaData(
    "Active on social media platforms with a significant following.",
    "Engages effectively with the audience through content creation.",
    "Collaborative mindset for partnerships and promotions."
  ),
  [PersonaTypeEnum.Strategist]: getPersonaData(
    "Strategic thinker with a focus on long-term goals.",
    "Proficient in planning and executing strategic initiatives.",
    "Excellent decision-making skills based on thorough analysis."
  ),
  [PersonaTypeEnum.Researcher]: getPersonaData(
    "Detail-oriented with strong analytical and research skills.",
    "Inquisitive mind, always seeking new information and insights.",
    "Comfortable with data collection, analysis, and interpretation."
  ),
  // Include the missing personas here using PersonaTypeEnum enum keys
  [PersonaTypeEnum.FashionEnthusiast]: getPersonaData(
    "Passionate about fashion and stays updated on latest trends.",
    "Active participation in fashion-related events or communities.",
    "Potential interest in collaborating on fashion-related projects within the app."
  ),
  [PersonaTypeEnum.Gamer]: getPersonaData(
    "Enthusiastic about gaming, both casual and competitive.",
    "Knowledgeable about various gaming platforms and genres.",
    "May engage in discussions or collaborative projects related to gaming."
  ),
  [PersonaTypeEnum.FitnessEnthusiast]: getPersonaData(
    "Dedicated to fitness and maintaining a healthy lifestyle.",
    "Active participation in fitness activities or communities.",
    "Potential interest in collaborating on fitness-related projects within the app."
  ),
  [PersonaTypeEnum.DataAnalyst]: getPersonaData(
    "Skilled in analyzing and interpreting data.",
    "Proficient in using data analysis tools and techniques.",
    "May contribute to data-driven projects within the app."
  ),
  [PersonaTypeEnum.ContentCreator]: getPersonaData(
    "Creates engaging content across various platforms.",
    "Innovative in content creation and storytelling.",
    "Collaborative mindset for content creation projects within the app."
  ),
  [PersonaTypeEnum.Blogger]: getPersonaData(
    "Active in blogging with a dedicated audience.",
    "Writes compelling content on specific topics or niches.",
    "May collaborate on blogging or content creation projects within the app."
  ),
};

// Export personaData
export { personaData };

// Function to generate persona data
function getPersonaData(...characteristics: string[]): string[] {
  return characteristics;
}

const PersonaBuilderDashboard = () => {

  const [selectedPersona, setSelectedPersona] = useState<PersonaTypeEnum>(
    PersonaTypeEnum.ProjectManager // default persona type
  );
  const [personaData, setPersonaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/personas/${selectedPersona}`);
        setPersonaData(response.data);
      } catch (error) {
        console.error("Error fetching persona data:", error);
      }
    };
  
    if (Array.isArray(personaData) && personaData.length > 0) {
      processTextData(personaData).then((traits: { [key: string]: string }) => {
        
        setPersonaData((prevData: PersonaData | null) => ({
          ...(prevData || null), // Ensure prevData is nullable
          traits: {
            ...(prevData?.traits || {}), // Ensure prevData.traits is nullable
            ...traits,
          },
        }));
      });
    }
  
    fetchData();
  }, [selectedPersona, personaData]);
  
  
  
  
  

  // Function to process text data and extract personality traits
  const processTextData = (textResponses: string[]) => {
    const extractedTraits: { [key: string]: string } = {};

    // Use NLP techniques to analyze text responses and extract relevant traits
    // For simplicity, consider using keyword-based or sentiment analysis approaches
    // Adjust this part based on your specific NLP requirements

    // Example: Extract personality traits based on predefined keywords for each trait
    Object.entries(personalityTraits).forEach(([traitKey, traitKeywords]) => {
      extractedTraits[traitKey] = determineTrait(textResponses, traitKeywords);

    });

    return extractedTraits;
  };

  // Function to determine a specific trait based on keywords
  const determineTrait = (
    textResponses: string[],
    traitKeywords: string[]
  ): string => {
    const traitMentions = textResponses.filter((response: string) =>
      traitKeywords.some((keyword: string) =>
        response.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return traitMentions.length > textResponses.length / 2
      ? traitKeywords[1]
      : traitKeywords[0];
  };

 


  return (
    <div>
      <h1>Persona Builder Dashboard</h1>
      <PersonaPanel
        userPersonas={userPersonas}
        businessPersonas={businessPersonas}
        socialPersonas={socialPersonas}
        selectedPersona={selectedPersona}
        onSelectPersona={(persona: PersonaTypeEnum) => setSelectedPersona(persona)}
        persona={""}
        contentProps={
          {} as (
            props: OrganizedCardLoaderProps,
            context?: any
          ) => React.ReactNode
        }
        personaData={{} as PersonaData}
      />
      {personaData && (
        <PersonaCard
          persona={selectedPersona}
          data={personaData}
          title={selectedPersona}
          fontSize="18px"
          fontFamily="Arial, sans-serif"
        >
          {/* Add an empty ReactNode as children */}
          <></>
        </PersonaCard>
      )}
      {/* Integrate DataPreview component */}
      <DataPreview
        data={{
          id: "data_id",
          timeBasedCode: "timeBasedCode",
          traits: (
            props: DetailsProps<SupportedData>,
            context?: any
          ): React.ReactNode => {
            return (
              <div>
                <h3>Extracted Personality Traits</h3>
                <DetailsList
                  items={Object.entries(props.data).map(([key]) => key)}
                  renderItem={(item: DetailsItem<Data>) => (
                    <DetailsListItem
                    item={item}
                    key={item.id} // Assuming item has an id property
                    label={item.title} // Assuming item has a title property
                    value={item.description} // Assuming item has a description property
                  
                    />
                  )}
                />
              </div>
            );
          },
        }}
      />
    </div>
  );
};

export default PersonaBuilderDashboard;
export { personalityTraits };

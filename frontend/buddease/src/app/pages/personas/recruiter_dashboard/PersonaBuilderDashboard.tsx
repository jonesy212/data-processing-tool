import axios from "axios"; // Import Axios library
import { useEffect, useState } from "react";

import { OrganizedCardLoaderProps } from "@/app/components/cards/DummyCardLoader";
import { PersonaCard } from "@/app/components/cards/PersonaCard";
import DetailsList from "@/app/components/lists/DetailsList";
import {
  DetailsProps,
  SupportedData,
} from "@/app/components/models/CommonData";
import { Data } from "@/app/components/models/data/Data";
import DetailsListItem from "@/app/components/models/data/DetailsListItem";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import DataPreview from "../../../components/users/DataPreview";
import { PersonaData } from "./PersonaData";
import PersonaPanel from "./PersonaPanel";

const userPersonas = [
  "Music Persona",
  "Film Persona",
  "Art Persona",
  "Casual User",
];
const businessPersonas = [
  "Developer",
  "UI Designer",
  "Job Seeker",
  "Creator",
  "Project Manager",
  "Strategist",
];
const socialPersonas = ["Influencer", "Social Media Manager"];

// Additional user roles to be added
const additionalUserPersonas = [
  "Fashion Enthusiast",
  "Gamer Persona",
  "Fitness Enthusiast",
];
const additionalBusinessPersonas = ["Data Analyst", "Content Creator"];
const additionalSocialPersonas = ["Blogger", "Content Creator"];

// Concatenate the additional roles with the existing ones
const extendedUserPersonas = [...userPersonas, ...additionalUserPersonas];
const extendedBusinessPersonas = [
  ...businessPersonas,
  ...additionalBusinessPersonas,
];
const extendedSocialPersonas = [...socialPersonas, ...additionalSocialPersonas];

// Define personality traits based on MBTI dichotomies
const personalityTraits = {
  extraversion: ["Introverted", "Extraverted"],
  sensing: ["Intuitive", "Observant"],
  thinking: ["Feeling", "Thinking"],
  judging: ["Perceiving", "Judging"],
};

const personaData: PersonaData = {
  "Music Persona": getPersonaData(
    "Passionate about music and knowledgeable in various genres.",
    "Active involvement in music creation or appreciation communities.",
    "May contribute to collaborative music projects within the app."
  ),
  "Film Persona": getPersonaData(
    "Enthusiastic about films, from classics to contemporary releases.",
    "Possesses insights into cinematography, storytelling, and film analysis.",
    "May participate in discussions or collaborative projects related to film."
  ),
  "Art Persona": getPersonaData(
    "Creative and skilled in various forms of visual arts.",
    "Engages in art communities and appreciates diverse artistic styles.",
    "Potential interest in collaborative art projects within the app."
  ),
  "Casual User": getPersonaData(
    "Frequent user for various purposes without specific professional focus.",
    "Enjoys the app for entertainment, relaxation, or casual interactions.",
    "May explore different features without a specific project-related goal."
  ),
  "Project Manager Persona": getPersonaData(
    "Experienced in coordinating project tasks and timelines.",
    "Skilled in team management and collaboration.",
    "Strategic thinker with a focus on project goals."
  ),
  "Developer Persona": getPersonaData(
    "Proficient in coding and development languages.",
    "Comfortable with version control systems and collaborative coding.",
    "Problem solver and detail-oriented in coding tasks."
  ),
  "UI Designer Persona": getPersonaData(
    "Creative and innovative in designing user interfaces.",
    "Familiar with design tools and industry trends.",
    "Attention to detail in creating visually appealing designs."
  ),
  "Influencer Persona": getPersonaData(
    "Active on social media platforms with a significant following.",
    "Engages effectively with the audience through content creation.",
    "Collaborative mindset for partnerships and promotions."
  ),
  "Strategist Persona": getPersonaData(
    "Strategic thinker with a focus on long-term goals.",
    "Proficient in planning and executing strategic initiatives.",
    "Excellent decision-making skills based on thorough analysis."
  ),
  "Researcher Persona": getPersonaData(
    "Detail-oriented with strong analytical and research skills.",
    "Inquisitive mind, always seeking new information and insights.",
    "Comfortable with data collection, analysis, and interpretation."
  ),
};

// Function to generate persona data
function getPersonaData(...characteristics: string[]): string[] {
  return characteristics;
}

const PersonaBuilderDashboard = () => {
  const [selectedPersona, setSelectedPersona] = useState(
    extendedUserPersonas[0]
  );
  const [personaData, setPersonaData] = useState(null);

  useEffect(() => {
    // Fetch data when the selected persona changes
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/personas/${selectedPersona}`); // Adjust the endpoint based on your backend API
        setPersonaData(response.data);
      } catch (error) {
        console.error("Error fetching persona data:", error);
      }
    };

    fetchData();
  }, [selectedPersona]);

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
        onSelectPersona={(persona: string) => setSelectedPersona(persona)}
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
          id: "data id",
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
                      item={{} as DetailsItem<Data>}
                      key={"key"}
                      label={"label"}
                      value={"value"}
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

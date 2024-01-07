import axios from 'axios'; // Import Axios library
import { useEffect, useState } from 'react';

import { DynamicContentProps } from '@/app/components/cards/DummyCardLoader';
import { PersonaCard } from '@/app/components/cards/PersonaCard';
import DataPreview from '../../../components/users/DataPreview';
import { PersonaData } from './PersonaData';
import PersonaPanel from './PersonaPanel';

const userPersonas = ['Music Persona', 'Film Persona', 'Art Persona', 'Casual User'];
const businessPersonas = ['Developer', 'UI Designer', 'Job Seeker', 'Creator', 'Project Manager', 'Strategist'];
const socialPersonas = ['Influencer', 'Social Media Manager'];


// Define personality traits based on MBTI dichotomies
const personalityTraits = {
  extraversion: ['Introverted', 'Extraverted'],
  sensing: ['Intuitive', 'Observant'],
  thinking: ['Feeling', 'Thinking'],
  judging: ['Perceiving', 'Judging'],
};


const personaData: PersonaData = {
  'Music Persona': ['Data for Music Persona'],
  'Film Persona': ['Data for Film Persona'],
  'Art Persona': ['Data for Art Persona'],
  'Casual User': ['Data for Casual User'],
  // Repeat the pattern for other persona categories
};

const PersonaBuilderDashboard = () => {
  const [selectedPersona, setSelectedPersona] = useState(userPersonas[0]);
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
        persona={''}
        contentProps={{} as DynamicContentProps} 
        personaData={{} as PersonaData} />
      {personaData && (
        <PersonaCard
          persona={selectedPersona}
          data={personaData}
          fontSize="18px"
          fontFamily="Arial, sans-serif"
        >
          {/* Add an empty ReactNode as children */}
          <></>
        </PersonaCard>
      )}
      {/* Integrate DataPreview component */}
      <DataPreview data={personaData} />
    </div>
  );
};

export default PersonaBuilderDashboard;
export { personalityTraits };

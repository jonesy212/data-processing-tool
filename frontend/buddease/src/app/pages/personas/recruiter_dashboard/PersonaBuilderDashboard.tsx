import axios from 'axios'; // Import Axios library
import { useEffect, useState } from 'react';
import PersonaCard from './PersonaCard';
import PersonaPane from './PersonaPane';

const userPersonas = ['Music Persona', 'Film Persona', 'Art Persona', 'Casual User'];
const businessPersonas = ['Developer', 'UI Designer', 'Job Seeker', 'Creator', 'Project Manager', 'Strategist'];
const socialPersonas = ['Influencer', 'Social Media Manager'];

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
        console.error('Error fetching persona data:', error);
      }
    };

    fetchData();
  }, [selectedPersona]);

  return (
    <div>
      <h1>Persona Builder Dashboard</h1>
      <PersonaPane
        userPersonas={userPersonas}
        businessPersonas={businessPersonas}
        socialPersonas={socialPersonas}
        selectedPersona={selectedPersona}
        onSelectPersona={(persona: any) => setSelectedPersona(persona)}
      />
      <PersonaCard persona={selectedPersona} data={personaData} />
    </div>
  );
};

export default PersonaBuilderDashboard;

// PersonaPage.ts
// app/pages/personas/PersonaPage.tsx
import React from 'react';
import { Persona, PersonaData } from '@/PersonaData';
import PersonaTypeEnum from '@/PersonaBuilder';

const PersonaPage: React.FC = () => {
  const [personas, setPersonas] = React.useState<Persona[]>([]);

  const createPersona = (type: PersonaTypeEnum) => {
    const newPersona = new Persona(type);
    setPersonas(prev => [...prev, newPersona]);
  };

  return (
    <div className="persona-page">
      <h1>Persona Management</h1>
      <button onClick={() => createPersona(PersonaTypeEnum.USER)}>
        Create User Persona
      </button>
      
      <div className="persona-list">
        {personas.map(persona => (
          <div key={persona.id} className="persona-card">
            <h3>{persona.name}</h3>
            <p>Type: {persona.type}</p>
            <p>Age: {persona.age}</p>
            <p>Gender: {persona.gender}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonaPage;
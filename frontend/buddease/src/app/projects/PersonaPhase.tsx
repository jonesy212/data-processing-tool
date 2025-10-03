// PersonaPhase.tsx
import { PersonaBuilder, PersonaTypeEnum } from "@/app/pages/personas/PersonaBuilder";
import React, { useState } from "react";

const PersonaPhase: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<PersonaTypeEnum>(
    PersonaTypeEnum.Music
  );

  const handlePersonaSelection = (personaType: PersonaTypeEnum) => {
    setSelectedPersona(personaType);
  };

  const generatePersona = () => {
    const persona = PersonaBuilder.buildPersona(selectedPersona);
    // Do something with the generated persona
  };

  return (
    <div>
      <h1>Persona Creation Phase</h1>
      <select
        value={selectedPersona}
        onChange={(e) =>
          handlePersonaSelection(e.target.value as PersonaTypeEnum)
        }
      >
        {Object.values(PersonaTypeEnum).map((personaType) => (
          <option key={personaType} value={personaType}>
            {personaType}
          </option>
        ))}
      </select>
      <button onClick={generatePersona}>Generate Persona</button>
    </div>
  );
};

export default PersonaPhase;

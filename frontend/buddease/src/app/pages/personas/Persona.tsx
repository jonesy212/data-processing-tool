// PersonaData.ts
import PersonaTypeEnum from "./PersonaBuilder";

// Persona.ts
class Persona {
  constructor(public type: PersonaTypeEnum) {
    
  }

  // Add any common properties or methods shared by all personas
  // For example:
  public id: string;
  public name: string;
  public age: number;
  public gender: string;
}




export interface PersonaData {
  [key: string]: string[];
}

export { Persona };

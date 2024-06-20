// PersonaData.ts
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import PersonaTypeEnum from "./PersonaBuilder";

// Persona.ts
class Persona {
  constructor(public type: PersonaTypeEnum) {
    this.id = UniqueIDGenerator.generateID("persona","", "",);
    this.name = "Persona";
    this.age = 0;
    this.gender = "Male";
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

import { PersonaData } from "./Persona";
import ProjectManagerPersona from "./ProjectManagerPersona";


// Define PersonaTypeEnum enum with persona types
export enum PersonaTypeEnum {
  Music = "Music Persona",
  Film = "Film Persona",
  Art = "Art Persona",
  CasualUser = "Casual User",
  ProjectManager = "Project Manager Persona",
  Developer = "Developer Persona",
  Default = "Default Persona",
  UIDesigner = "UI Designer Persona",
  Influencer = "Influencer Persona",
  Strategist = "Strategist Persona",
  Researcher = "Researcher Persona",
  FashionEnthusiast = "Fashion Enthusiast",
  Gamer = "Gamer Persona",
  FitnessEnthusiast = "Fitness Enthusiast",
  DataAnalyst = "Data Analyst",
  ContentCreator = "Content Creator",
  Blogger = "Blogger",
  CryptoTrader = "Crypto Trader",
  CryptoEnthusiast = "Crypto Enthusiast",
  StockTrader = "Stock Trader",
  ForexTrader = "Forex Trader",
  Professional = "Professional"
}

export class PersonaBuilder {
   buildScenarios(props: any): any {
    return {
      // Create user scenarios based on the props
    };
   }
  
  
  static buildPersona(type: PersonaTypeEnum, props: any): any {
    switch (type) {
      case PersonaTypeEnum.ProjectManager:
        return  ProjectManagerPersona(props);
      case PersonaTypeEnum.Art:
        return  ArtistPersona();
      case PersonaTypeEnum.Developer:
        return new DeveloperPersona();
      // case PersonaTypeEnum.Trainer:
      //   throw new Error("TrainerPersona is not implemented yet.");
      // case PersonaTypeEnum.Planner:
      //   throw new Error("PlannerPersona is not implemented yet.");
      default:
        throw new Error("Invalid persona type.");
    }
  }

  mapUserJourney(type: PersonaTypeEnum, props: any): any {
      // Map out user journey based on the props
      switch(type) {
      case PersonaTypeEnum.CasualUser:
      return new CasualUserPersona(props);
        case PersonaTypeEnum.CryptoEnthusiast:
          return new CryptoPersona(props);
        case PersonaTypeEnum.FitnessEnthusiast:
          return new FitnessEnthusiastPersona(props);
        case PersonaTypeEnum.FashionEnthusiast:
          return new FashionEnthusiastPersona(props);
        case PersonaTypeEnum.Influencer:
          return new InfluencerPersona(props);
        case PersonaTypeEnum.Researcher:
          return new ResearcherPersona(props);
        case PersonaTypeEnum.Strategist:
          return new StrategistPersona(props);
        case PersonaTypeEnum.UIDesigner:
          return new UIDesignerPersona(props);
        case PersonaTypeEnum.Gamer:
          return new GamerPersona(props);
        case PersonaTypeEnum.Blogger:
          return new BloggerPersona(props);
        case PersonaTypeEnum.CryptoTrader:
          return new CryptoTraderPersona(props);
        case PersonaTypeEnum.StockTrader:
          return new StockTraderPersona(props);
        case PersonaTypeEnum.ForexTrader: 
          return new ForexTraderPersona(props);
        default:
          throw new Error("Invalid persona type.");
    };
  }
}

// Function to check alignment between PersonaData and PersonaType
const checkAlignment = (
  personaData: PersonaData,
  personaType: typeof PersonaTypeEnum
) => {
  const personaNames = Object.keys(personaData);
  const personaEnumValues = Object.values(personaType).filter(
    (value) => typeof value === "string"
  );

  const missingPersonas = personaNames.filter(
    (persona) => !personaEnumValues.includes(persona.toString() as PersonaTypeEnum)
  );
  const extraPersonas = personaEnumValues.filter(
    (persona) => !personaNames.includes(persona)
  );

  if (missingPersonas.length > 0 || extraPersonas.length > 0) {
    throw new Error(
      `PersonaData and PersonaType are not aligned.\nMissing Personas: ${missingPersonas}\nExtra Personas: ${extraPersonas}`
    );
  }
};



// Create an instance of PersonaData or pass an object of type PersonaData
const personaDataInstance: PersonaData = {
  Music: [],
  Film: [],
  Art: [],
  CasualUser: [],
  ProjectManager: [],
  Developer: [],
  UIDesigner: [],
  Influencer: [],
  Strategist: [],
  Researcher: [],
  FashionEnthusiast: [],
  Gamer: [],
  FitnessEnthusiast: [],
  DataAnalyst: [],
  ContentCreator: [],
  Blogger: [],
};

// Call checkAlignment function with the instance of PersonaData
checkAlignment(personaDataInstance, PersonaTypeEnum);

// Export PersonaData and PersonaType
export type { PersonaData };

export default PersonaTypeEnum;

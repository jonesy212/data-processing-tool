import { LanguageEnum } from "./LanguageEnum";

interface Language {
  code: string;
  name: string;
  // Add any other properties as needed
}



interface TimeZone {
    id: string;
    offset: string;
    name: string;
  }
  
  interface CrossCulturalCommunication {
    userId: string;
    preferences: {
      language: LanguageEnum;
      timeZone: string;
    };
  }


  function mapLanguageToEnum(language: string): LanguageEnum {
    switch (language) {
      case LanguageEnum.English:
        return LanguageEnum.English;
      case LanguageEnum.Spanish:
        return LanguageEnum.Spanish;
      case LanguageEnum.French:
        return LanguageEnum.French;
      case LanguageEnum.German:
        return LanguageEnum.German;
      default:
        return LanguageEnum.English; // Default to English if the language is not supported
    }
  }
  

  export type { CrossCulturalCommunication, Language, TimeZone };

export {mapLanguageToEnum}
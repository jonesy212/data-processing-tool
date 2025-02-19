// ArtPersona.ts
import { Persona } from "./Persona";
import { PersonaTypeEnum } from "./PersonaBuilder";

class ArtPersona extends Persona {
  // Specific properties for Art Persona
  public favoriteArtists: string[];
  public preferredArtStyles: string[];
  public artCollections: string[];

  constructor() {
    super(PersonaTypeEnum.Art);
    // Initialize Art Persona properties
    this.favoriteArtists = [];
    this.preferredArtStyles = [];
    this.artCollections = [];
  }

  // Specific methods for Art Persona
  public addFavoriteArtist(artist: string) {
    this.favoriteArtists.push(artist);
  }

  public addPreferredArtStyle(style: string) {
    this.preferredArtStyles.push(style);
  }

  public addArtCollection(collection: string) {
    this.artCollections.push(collection);
  }
}

export { ArtPersona };

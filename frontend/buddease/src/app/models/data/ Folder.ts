
interface Folder {
  id: string;
  name: string;
  files: string[]; // Array of file IDs contained in the folder
}

export type { Folder }
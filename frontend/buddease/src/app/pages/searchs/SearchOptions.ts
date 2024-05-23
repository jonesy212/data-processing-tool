import { FileTypeEnum } from "@/app/components/documents/FileType";

interface SearchOptions {
    size: SearchSize;
    animations: SearchAnimationOptions;
    additionalOptions: AdditionalOptions;
  additionalOption2: string | undefined;
  communicationMode: "email" | "phone" | "chat";
  defaultFileType: FileTypeEnum
  }
  
  type SearchSize = "small" | "medium" | "large" | "custom";
  

  interface SearchAnimationOptions {
    type: AnimationType;
    duration?: number;
    easing?: string;
  }
  
  type AnimationType = "slide" | "fade" | "custom" | "show";
  
  interface AdditionalOptions {
    filters?: Filter[];
    sorting?: SortingOption;
    pagination?: PaginationOptions;
    // Add more additional options as needed
  }
  
  interface Filter {
    name: string;
    value: any;
    // Add more filter properties as needed
  }
  
  interface SortingOption {
    field: string;
    order: "asc" | "desc";
  }
  
  interface PaginationOptions {
    page: number;
    pageSize: number;
  }
  
  export type { SearchAnimationOptions, SearchOptions, SearchSize, SortingOption };
  
    
    
// example implementation of search options
   
// Inside your component
const searchOptions: SearchOptions = {
  size: "medium",
  animations: {
    type: "slide",
    duration: 300,
  },
  additionalOptions: {} as AdditionalOptions,
  additionalOption2: undefined,
  communicationMode: "email",
  defaultFileType: FileTypeEnum.UnknownType
};

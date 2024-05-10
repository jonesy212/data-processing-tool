// DocumentBuilderConfig.ts
import { DocumentData } from "../components/documents/DocumentBuilder";
import { DocumentTypeEnum } from '../components/documents/DocumentGenerator';
import { DocumentOptions } from "../components/documents/DocumentOptions";
import { Section } from '../components/documents/Section';
import { DocumentAnimationOptions } from "../components/documents/SharedDocumentProps";
import { BorderStyle, DocumentSize } from '../components/models/data/StatusType';
import { AlignmentOptions } from '../components/state/redux/slices/toolbarSlice';
import Version from '../components/versions/Version';
import { StructuredMetadata } from './StructuredMetadata';
import { UserSettings } from './UserSettings';
import BackendStructure from './appStructure/BackendStructure';
import FrontendStructure from './appStructure/FrontendStructure';

  export interface DocumentBuilderConfig extends DocumentOptions {
    isDynamic: boolean;
    defaultOptions: DocumentOptions;
    options: {
      // other properties...
      additionalOptions: readonly string[] | string | number | any[] | undefined;
      
      // other properties...
    };
    // Additional options for customization
    fontFamily: string;
    fontSize: number;
    textColor: string;
    backgroundColor: string;
    lineSpacing: number;
    structure: BackendStructure | FrontendStructure | undefined
    // More styling options as needed
    
    // Advanced options
    enableSpellCheck: boolean;
    enableAutoSave: boolean;
    autoSaveInterval: number; // in seconds
    showWordCount: boolean;
    maxWordCount: number;
    // More advanced features
    
    // Integration options
    enableSyncWithExternalCalendars: boolean;
    enableThirdPartyIntegration: boolean;
    thirdPartyAPIKey: string;
    thirdPartyEndpoint: string;
    // More integration options
    
    // Accessibility options
    enableAccessibilityMode: boolean;
    highContrastMode: boolean;
    screenReaderSupport: boolean;
    metadata: StructuredMetadata | undefined;
    // Define sections
    orientation: "portrait" | "landscape";
    
    sections: Section[] | undefined;

  }



// Define the type for the store object
type StoreType = {
  // Define your store properties here
};



// Define the interface for the result of hydration
export interface IHydrateResult<T> {
  storeKey: string; // Add the storeKey property
  storeValue: T;
  initialState?: any;
  rehydrate: () => IHydrateResult<T>;
  then(callback: () => void): DocumentBuilderConfig; // Adjusted return type
  [Symbol.toStringTag]: 'IHydrateResult',
  finally(onFinally: () => void): IHydrateResult<T>; // Implementing finally method
  catch(onError: (err: any) => void): IHydrateResult<T>; // Implementing catch method
}
  

// Define the createHydrateResult function
const createHydrateResult = <T extends Object>(
  key: string,
  store: T,
  initialState?: any
): IHydrateResult<T> => ({
  rehydrate: function (): IHydrateResult<T> {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      Object.assign(store, parsedData);
    }
    return this;
  },
  storeKey: key,
  storeValue: store,
  then: function <T extends DocumentBuilderConfig>(callback: () => unknown): T {
    callback();
    return this.storeValue as unknown as T;
  },
  catch: function (onError: (error: any) => void) {
    if (onError) {
      onError('error occurred');
    }
    return this;
  },
  finally: function (
    onfinally?: (() => void) | null | undefined
  ): IHydrateResult<T> {
    if (onfinally) {
      onfinally();
    }
    return this;
  },
  [Symbol.toStringTag]: "IHydrateResult",
});



// Now use the createHydrateResult function in your dataVersions object
export const dataVersions = {
  backend: createHydrateResult<StoreType>(
    "dataVersions_backend", // Specify a unique key for the backend store
    {} as StoreType
  ),
  frontend: createHydrateResult<StoreType>(
    "dataVersions_frontend", // Specify a unique key for the frontend store
    {} as StoreType
  ),
};



export const getDefaultDocumentBuilderConfig = (): DocumentBuilderConfig => {
  return {
    isDynamic: true,
    options: {
      additionalOptions: undefined,
    },
    defaultOptions: {
      size: DocumentSize.Letter,
      additionalOptions: "",
      documents: [] as DocumentData[],
      isDynamic: false,
      visibility: "private",
      fontSize: 12,
      textColor: "#000000",
      backgroundColor: "#FFFFFF",
      fontFamily: "Arial",
      lineSpacing: 1.5,
      alignment: AlignmentOptions.LEFT,
      indentSize: 0,
      bulletList: false,
      numberedList: false,
      headingLevel: 0,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      subscript: false,
      superscript: false,
      hyperlink: "",
      image: "",
      table: false,
      tableRows: 0,
      tableColumns: 0,
      codeBlock: false,
      blockquote: false,
      codeInline: false,
      quote: "",
      todoList: false,
      orderedTodoList: false,
      unorderedTodoList: false,
      customSettings: {},
      animations: {} as DocumentAnimationOptions,
      documentType: {} as DocumentTypeEnum,
      userIdea: "",
      colorCoding: false,
      uniqueIdentifier: "",
      includeType: "all",
      includeTitle: false,
      includeContent: false,
      includeStatus: false,
      includeAdditionalInfo: false,
      font: "",
      documentPhase: "",
      version: Version.create({
        id: 0,
        name: "",
        versionNumber: "1.0",
        appVersion: "1.0",
        content: "",
        url: "",
        data: [],
      }),
      userSettings: {} as UserSettings,
      dataVersions: {
        backend: new Promise<string>(() => ""),
        frontend: new Promise<string>(() => ""),
      },
      documentSize: DocumentSize.A4,
      layout: {} as BackendStructure | FrontendStructure,
      panels: undefined,
      pageNumbers: false,
      footer: "",
      watermark: {
        enabled: false,
        text: "",
        color: "",
        opacity: 0,
        size: "",
        x: 0,
        y: 0,
        rotation: 0,
        borderStyle: "",
      },
      headerFooterOptions: {
        header: undefined,
        footer: undefined,
        showHeader: false,
        showFooter: false,
        dateFormat: undefined,
        differentFirstPage: false,
        differentOddEven: false,
        headerOptions: {
          height: {
            type: "",
            value: 0,
          },
          fontSize: 0,
          fontFamily: "",
          fontColor: "",
          alignment: "",
          font: "",
          bold: false,
          italic: false,
          underline: false,
          strikeThrough: false,
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        },
        footerOptions: {
          alignment: "",
          font: "",
          fontSize: 0,
          fontFamily: "",
          fontColor: "",
          bold: false,
          italic: false,
          underline: false,
          strikeThrough: false,
          height: {
            type: "",
            value: 0,
          },
          margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          },
        },
      },
      zoom: 0,
      showRuler: false,
      showDocumentOutline: false,
      showComments: false,
      showRevisions: false,
      spellCheck: false,
      grammarCheck: false,
      toc: false,
      textStyles: {},
      links: false,
      embeddedContent: false,
      bookmarks: false,
      crossReferences: false,
      footnotes: false,
      endnotes: false,
      comments: false,
      revisions: false,
      embeddedMedia: false,
      embeddedCode: false,
      styles: {},
      tableCells: {
        enabled: false,
        padding: 0,
        fontSize: 0,
        alignment: "left",
        borders: {
          top: BorderStyle.NONE,
          bottom: BorderStyle.NONE,
          left: BorderStyle.NONE,
          right: BorderStyle.NONE,
        },
      },
      tableStyles: [],
      highlight: false,
      highlightColor: "",
      footnote: false,
      defaultZoomLevel: 0,
      customProperties: undefined,
      value: undefined,
      metadata: undefined,
    },
    fontFamily: "Arial",
    fontSize: 12,
    textColor: "#000000",
    backgroundColor: "#FFFFFF",
    lineSpacing: 1.5,
    enableSpellCheck: false,
    enableAutoSave: false,
    autoSaveInterval: 0,
    showWordCount: false,
    maxWordCount: 0,
    thirdPartyAPIKey: "",
    thirdPartyEndpoint: "",
    highContrastMode: false,
    screenReaderSupport: false,
    enableAccessibilityMode: false,
    enableThirdPartyIntegration: false,
    enableSyncWithExternalCalendars: false,
    structure: undefined,
    metadata: undefined,
    orientation: "portrait",
    sections: undefined,
  } as DocumentBuilderConfig;
};
function callback() {
  throw new Error('Function not implemented.');
}



import * as crypto from 'crypto';  // Correct crypto module for Node.js
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { action, makeAutoObservable } from 'mobx';
import { useDispatch } from 'react-redux';
import { GlobalStateActions } from '../../actions/GlobalStateActions';
import { DocumentData } from '../../documents/DocumentBuilder';
import { DocumentOptions, Style } from '../../documents/DocumentOptions';
import { DocumentAnimationOptions } from '../../documents/SharedDocumentProps';
import { DesignSystemConfig } from '../../libraries/ui/theme/MapProperties';
import { NotificationTypeEnum } from '../../support/NotificationContext';
import { DocumentTypeEnum } from '../../documents/DocumentGenerator';
import { UserSettings } from '@/app/configs/UserSettings';
import Version from '../../versions/Version';
import { docx, IContext, IXmlableObject, XmlComponent } from 'docx';
import { frontendStructure } from '@/app/configs/appStructure/FrontendStructure';
import { AppStructureItem } from '@/app/configs/appStructure/AppStructure';
import { DocumentSize } from '../../models/data/StatusType';
import { AlignmentOptions } from '../redux/slices/toolbarSlice';
import { Style as DocxStyle } from 'docx';



interface ExtendedStyle extends DocxStyle {
  tableStyles?: {
    header?: TableStyle;  // Define header as a TableStyle
    body?: TableStyle;    // Define body as a TableStyle
    footer?: TableStyle;   // Define footer as a TableStyle
  };
}

// Define a TableStyle interface to represent the styles for table cells
interface TableStyle {
  fontWeight?: string;
  root?: CustomXmlComponent; // Ensure root is of type CustomXmlComponent
  prepForXml?: () => void;
  addChildElement?: () => void;
  rootKey?: string;
}




class CustomXmlComponent extends XmlComponent {
  constructor(rootKey: string) {
    super(rootKey);
    // Your constructor logic, if needed
  }

  prepForXml(context: IContext): IXmlableObject | undefined {
    // Your implementation here
    return super.prepForXml(context);
  }

  addChildElement(child: XmlComponent | string): XmlComponent {
    return super.addChildElement(child);
  }
}


export default class MobXEntityStore {
  private rootKey: string;
  constructor() {
    makeAutoObservable(this);
    this.rootKey = this.setRootKey();
    this.globalState.uniqueIdentifier = this.generateUniqueIdentifier('default');
  }

  globalState: DocumentOptions & DesignSystemConfig = {
    documentType: {} as DocumentTypeEnum,
    userIdea: "",
    isDynamic: false,
    documents: [],
    size: DocumentSize.Letter,
    visibility: "public",
    fontSize: 0,
    textColor: "",
    backgroundColor: "",
    fontFamily: "",
    lineSpacing: 0,
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
    colorCoding: {} as Record<string, string>,
    additionalOptions: [],
    includeStatus: true,
    includeAdditionalInfo: true,
    uniqueIdentifier: UniqueIDGenerator.generateDocumentID(
      "uniqueIdentifier",
      NotificationTypeEnum.GeneratedID
    ),
    includeType: { 
      enabled: 
      format:"all"},
    includeTitle: true,
    includeContent: true,
    animations: {} as DocumentAnimationOptions,
    customSettings: {} as Record<string, any>,
    design: {
      primary: "",
      secondary: "",
      accent: "",
      small: "",
      medium: "",
      large: "",
      bold: "",
      italic: "",
      underline: "",
      documentPhase: {
        isCreating: true,
        isEditing: false,
        isReviewing: false,
        isPublishing: false,
      },

      version: {
        versionNumber: "1.0",
      },

      font: "",
      userSettings: {} as UserSettings,
      // Add more design properties as needed
    },
    documentPhase: "isEditing",
    version: {
      versionNumber: "1.1",
      appVersion: "",
      id: 0,
      content: "",
      frontendStructure: {} as Promise<AppStructureItem[]>,
      data: [],
      hash: function(value: string): string {
        return crypto.createHash("sha256").update(value).digest("hex");
      },
      generateStructureHash: function (): Promise<string> {
        const hash = (crypto as any).createHash("sha256");
        hash.update(JSON.stringify(this.getContent?.()));
        return hash.digest("hex");
      },
      getVersionNumber: function (): string {
        return this.versionNumber;
      },
      updateVersionNumber: function (newVersionNumber: string): void {
        this.versionNumber = newVersionNumber;
      },
      compare: function (otherVersion: Version): number {
        if (this.versionNumber > otherVersion.versionNumber) {
          return 1;
        } else if (this.versionNumber < otherVersion.versionNumber) {
          return -1;
        } else {
          return 0;
        }
      },
      
      parse: function (): number[] {
        return JSON.parse(this.content);
      },

      isValid: function (): boolean {
        return true;
      },
      
      generateHash: function (appVersion: string): string {
        return crypto.createHash("sha256").update(appVersion).digest("hex");
      },
      isNewer: function (otherVersion: Version): boolean {
        return this.compare?.(otherVersion) === 1;
      },
      hashStructure: function(structure: AppStructureItem[]): string {
        return this.hash(JSON.stringify(structure));
      },

      getStructureHash: async function (): Promise<string> {
        if (this.frontendStructure === undefined) {
            return "can't find frontend structure";
        }
        // Check if hashStructure is defined and return its result, or handle the undefined case
        const result = this.hashStructure?.(await this.frontendStructure);
        return result !== undefined ? result : "hashStructure is undefined";
    },
    
      
      getContent: function (): string {
        return this.content;
      },

      setContent: function (content: string): void {
        this.content = content;
      },
      
      // Method to retrieve and update structure hash if needed
      async getStructureHashAndUpdateIfNeeded(globalState: MobXEntityStore['globalState']): Promise<string | undefined> {
        const currentHash = globalState.version?.getStructureHash()
        const newHash = crypto.createHash('sha256').update('NewStructureData').digest('hex');

        if (currentHash !== newHash) {
          await globalState.version?.hashStructure.updateStructureHash(); // Update the hash if needed
          return globalState.version.getStructureHash();
        }

        return currentHash;
      },

    },
    font: "Arial",
    tableStyles: {
      header: {
        fontWeight: "bold",
        root: new CustomXmlComponent(rootKey), // Create an instance of CustomXmlComponent
        prepForXml: () => {
          // Provide a valid implementation if needed
        },
        addChildElement: () => {},
        rootKey: this.rootKey,
      } as TableStyle,
      body: {} as unknown as docx.Style,
      footer: {} as unknown as docx.Style,
    },
  };
  generateUniqueIdentifier(generatorType: string): string {
    const uniqueIdentifier = UniqueIDGenerator.generateID('UUID', 'UniqueIdentifier', NotificationTypeEnum.GeneratedID, undefined, generatorType);
    return uniqueIdentifier;
  }




  // Method to securely set rootKey
  private setRootKey(): string {
    // Retrieve the root key from an environment variable
    const envKey = process.env.ROOT_KEY;

    // Validate the retrieved key
    if (envKey && this.isValidRootKey(envKey)) {
      return envKey;
    }

    // Fallback to a default value if needed
    console.warn("ROOT_KEY is not set or invalid. Using default value.");
    return "defaultRootKey"; // Change this to a suitable default
  }

  // Example validation method for the root key
  private isValidRootKey(key: string): boolean {
    // Add logic to validate the rootKey (e.g., length, format)
    return key.length > 5; // Simple example validation
  }


  // MobX action to update global state using Redux
  @action
  // Define methods to update global state
  updateGlobalState(key: keyof typeof this.globalState, value: any) {
    useDispatch()(GlobalStateActions.updateGlobalState({ key, value }));
  }
  // Add more methods as needed
}



//Exampe usage:
// Example of updating a document-related property
GlobalStateActions.updateGlobalState({key: 'documentType', value: 'newDocumentType'});

// Example of updating a design-related property
GlobalStateActions.updateGlobalState({key: 'design.primary', value: '#newPrimaryColor'});
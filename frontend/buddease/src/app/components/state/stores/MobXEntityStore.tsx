import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { action, makeAutoObservable } from 'mobx';
import { useDispatch } from 'react-redux';
import { GlobalStateActions } from '../../actions/GlobalStateActions';
import { DocumentData } from '../../documents/DocumentBuilder';
import { DocumentOptions } from '../../documents/DocumentOptions';
import { DocumentAnimationOptions } from '../../documents/SharedDocumentProps';
import { DesignSystemConfig } from '../../libraries/ui/theme/MapProperties';
import { NotificationTypeEnum } from '../../support/NotificationContext';
import { DocumentTypeEnum } from '../../documents/DocumentGenerator';
import { UserSettings } from '@/app/configs/UserSettings';
import Version from '../../versions/Version';
import docx from 'docx';
import { frontendStructure } from '@/app/configs/appStructure/FrontendStructure';
import { AppStructureItem } from '@/app/configs/appStructure/AppStructure';
import { DocumentSize } from '../../models/data/StatusType';
import { AlignmentOptions } from '../redux/slices/toolbarSlice';




class MobXEntityStore {
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
    includeType: "all",
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
      generateStructureHash: function (): Promise<string> {
        const hash = (crypto as any).createHash("sha256");
        hash.update(JSON.stringify(this.getContent()));
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
      
      hash: function(value: string): string {
        return crypto.createHash("sha256").update(value).digest("hex");
      },
      generateHash: function (appVersion: string): string {
        return crypto.createHash("sha256").update(appVersion).digest("hex");
      },
      isNewer: function (otherVersion: Version): boolean {
        return this.compare(otherVersion) === 1;
      },
      hashStructure: function(structure: AppStructureItem[]): string {
        return this.hash(JSON.stringify(structure));
      },

      getStructureHash: function (): string {
        return this.hashStructure(this.frontendStructure);
            },
      getContent: function (): string {
        return this.content;
            },
      setContent: function (content: string): void {
        this.content = content;
            },
    },
    font: "Arial",
    tableStyles: {
      header: {
        fontWeight: "bold",
        root: {},
        prepForXml: () => {},
        addChildElement: () => {},
        rootKey: "",
      } as unknown as docx.Style,
      body: {} as unknown as docx.Style,
      footer: {} as unknown as docx.Style,
    },
  };
  generateUniqueIdentifier(generatorType: string): string {
    const uniqueIdentifier = UniqueIDGenerator.generateID('UUID', 'UniqueIdentifier', NotificationTypeEnum.GeneratedID, undefined, generatorType);
    return uniqueIdentifier;
  }

  constructor() {
    makeAutoObservable(this);
    this.globalState.uniqueIdentifier = this.generateUniqueIdentifier('default');

  }

   // MobX action to update global state using Redux
  @action
  // Define methods to update global state
  updateGlobalState(key: keyof typeof this.globalState, value: any) {
    useDispatch()(GlobalStateActions.updateGlobalState({ key, value }));
  }
  // Add more methods as needed
}

export default new MobXEntityStore();


//Exampe usage:
// Example of updating a document-related property
GlobalStateActions.updateGlobalState({key: 'documentType', value: 'newDocumentType'});

// Example of updating a design-related property
GlobalStateActions.updateGlobalState({key: 'design.primary', value: '#newPrimaryColor'});
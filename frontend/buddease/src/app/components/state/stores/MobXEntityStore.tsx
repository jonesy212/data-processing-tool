import { makeAutoObservable } from 'mobx';
import { DocumentOptions } from '../../documents/DocumentOptions';
import { DocumentAnimationOptions } from '../../documents/SharedDocumentProps';
import { DesignSystemConfig } from '../../libraries/ui/theme/MapProperties';
import { DocumentData } from '../../documents/DocumentBuilder';

class MobXEntityStore {
  globalState: DocumentOptions & DesignSystemConfig = {
    documentType: {} as DocumentData,
    userIdea: '',
    isDynamic: false,
    documents: [],
    size: 'letter',
    visibility: 'public',
    fontSize: 0,
    textColor: '',
    backgroundColor: '',
    fontFamily: '',
    lineSpacing: 0,
    alignment: 'left',
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
    hyperlink: '',
    image: '',
    table: false,
    tableRows: 0,
    tableColumns: 0,
    codeBlock: false,
    blockquote: false,
    codeInline: false,
    quote: '',
    todoList: false,
    orderedTodoList: false,
    unorderedTodoList: false,
    colorCoding: false,
    additionalOptions: [],
    includeStatus: true,
    includeAdditionalInfo: true,
    uniqueIdentifier: uuid(),
    includeType: "all",
    includeTitle: true,
    includeContent: true,
    animations: {} as DocumentAnimationOptions,
    customSettings: {} as Record<string, any>,
    design: {
      primary: '',
      secondary: '',
      accent: '',
      small: '',
      medium: '',
      large: '',
      bold: '',
      italic: '',
      underline: '',
      // Add more design properties as needed
    },
  };

  constructor() {
    makeAutoObservable(this);
  }

  // Define methods to update global state
  updateGlobalState(key: keyof typeof this.globalState, value: any) {
    this.globalState = {
      ...this.globalState,
      [key]: value,
    };
  }

  // Add more methods as needed
}

export default new MobXEntityStore();


//Exampe usage:
// Example of updating a document-related property
updateGlobalState('documentType', 'newDocumentType');

// Example of updating a design-related property
updateGlobalState('design.primary', '#newPrimaryColor');
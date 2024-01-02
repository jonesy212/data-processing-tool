// MobXEntityStore.ts
import { makeAutoObservable } from 'mobx';
import { DocumentOptions } from '../../documents/DocumentOptions';
import { DocumentAnimationOptions } from '../../documents/SharedDocumentProps';

class MobXEntityStore {
globalState: DocumentOptions = {
  documentType: '', userIdea: '',
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
  animations: {} as DocumentAnimationOptions,
  additionalOptions: [],
  customSettings: {} as Record<string, any>
}; // Set initial values


  constructor() {
    makeAutoObservable(this);
  }

  // Define methods to update global state
  updateGlobalState(key: keyof typeof this.globalState, value: any) {
    this.globalState = {
      ...this.globalState,
      [key]: value
    };
  }

  
  // Add more methods as needed
}

export default new MobXEntityStore();

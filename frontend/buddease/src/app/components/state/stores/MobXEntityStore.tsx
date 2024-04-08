import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { action, makeAutoObservable } from 'mobx';
import { useDispatch } from 'react-redux';
import { GlobalStateActions } from '../../actions/GlobalStateActions';
import { DocumentData } from '../../documents/DocumentBuilder';
import { DocumentOptions } from '../../documents/DocumentOptions';
import { DocumentAnimationOptions } from '../../documents/SharedDocumentProps';
import { DesignSystemConfig } from '../../libraries/ui/theme/MapProperties';
import { NotificationTypeEnum } from '../../support/NotificationContext';





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
    uniqueIdentifier: UniqueIDGenerator.generateDocumentID('uniqueIdentifier', NotificationTypeEnum.GeneratedID),
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
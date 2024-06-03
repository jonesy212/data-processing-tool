// DocumentBuilderConfig.ts
import {
  CodingLanguageEnum,
  LanguageEnum,
} from "../components/communications/LanguageEnum";
import { ModifiedDate } from "../components/documents/DocType";
import { DocumentTypeEnum } from "../components/documents/DocumentGenerator";
import { DocumentOptions } from "../components/documents/DocumentOptions";
import { Section } from "../components/documents/Section";
import {
  BorderStyle,
  DocumentSize,
  PrivacySettingEnum,
} from "../components/models/data/StatusType";
import { AlignmentOptions } from "../components/state/redux/slices/toolbarSlice";
import { Settings } from "../components/state/stores/SettingsStore";
import { UserIdea } from "../components/users/Ideas";
import Version from "../components/versions/Version";
import { StructuredMetadata } from "./StructuredMetadata";
import BackendStructure from "./appStructure/BackendStructure";
import FrontendStructure from "./appStructure/FrontendStructure";

export interface DocumentBuilderConfig extends DocumentOptions {
  levels: any;
  isDynamic: boolean;
  language: LanguageEnum;
  // defaultOptions: DocumentOptions;
  options: {
    // other properties...
    additionalOptions: readonly string[] | string | number | any[] | undefined;

    // other properties...
  };
  // Additional options for customization
  documentType: DocumentTypeEnum;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  lineSpacing: number;
  structure: BackendStructure | FrontendStructure | undefined;
  uniqueIdentifier: string;
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
  userIdea?: string | UserIdea | undefined;
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
  [Symbol.toStringTag]: "IHydrateResult";
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
      onError("error occurred");
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
    levels: [],
    isDynamic: true,
    options: {
      additionalOptions: undefined,
    },
    color: "",
    size: DocumentSize.Letter,
    additionalOptions: "",
    language: LanguageEnum.English,
    documents: [],
    visibility: PrivacySettingEnum.Private,
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
    animations: {
      type: "custom",
      duration: 0,
    },
    documentType: DocumentTypeEnum.Draft,
    // userIdea: "",
    colorCoding: {},
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
      limit: 0,
      description: "",
      checksum: "",
      versionHistory: {
        versions: [],
      },
      draft: false,
      userId: "",
      documentId: "",
      parentId: "",
      parentType: "",
      parentVersion: "",
      parentTitle: "",
      parentContent: "",
      parentName: "",
      parentUrl: "",
      parentChecksum: "",
      parentMetadata: {},
      parentAppVersion: "",
      parentVersionNumber: "",
      isLatest: false,
      isPublished: false,
      publishedAt: null,
      source: "",
      status: "",
      workspaceId: "",
      workspaceName: "",
      workspaceType: "",
      workspaceUrl: "",
      workspaceViewers: [],
      workspaceAdmins: [],
      workspaceMembers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    userSettings: {
      userId: 0,
      userSettings: new NodeJS.Timeout(),
      communicationMode: "",
      enableRealTimeUpdates: false,
      defaultFileType: "",
      allowedFileTypes: [],
      enableGroupManagement: false,
      enableTeamManagement: false,
      idleTimeout: undefined,
      startIdleTimeout: function (
        timeoutDuration: number,
        onTimeout: () => void
      ): void {
        throw new Error("Function not implemented.");
      },
      idleTimeoutDuration: 0,
      activePhase: "",
      realTimeChatEnabled: false,
      todoManagementEnabled: false,
      notificationEmailEnabled: false,
      analyticsEnabled: false,
      twoFactorAuthenticationEnabled: false,
      projectManagementEnabled: false,
      documentationSystemEnabled: false,
      versionControlEnabled: false,
      userProfilesEnabled: false,
      accessControlEnabled: false,
      taskManagementEnabled: false,
      loggingAndNotificationsEnabled: false,
      securityFeaturesEnabled: false,
      theme: "",
      language: CodingLanguageEnum.JavaScript,
      fontSize: 0,
      darkMode: false,
      enableEmojis: false,
      enableGIFs: false,
      emailNotifications: false,
      pushNotifications: false,
      notificationSound: "",
      timeZone: "",
      dateFormat: "",
      timeFormat: "",
      defaultProjectView: "",
      taskSortOrder: "",
      showCompletedTasks: false,
      projectColorScheme: "",
      showTeamCalendar: false,
      teamViewSettings: [],
      defaultTeamDashboard: "",
      passwordExpirationDays: 0,
      privacySettings: [],
      thirdPartyApiKeys: undefined,
      externalCalendarSync: false,
      dataExportPreferences: [],
      dashboardWidgets: [],
      customTaskLabels: [],
      customProjectCategories: [],
      customTags: [],
      formHandlingEnabled: false,
      paginationEnabled: false,
      modalManagementEnabled: false,
      sortingEnabled: false,
      notificationSoundEnabled: false,
      localStorageEnabled: false,
      clipboardInteractionEnabled: false,
      deviceDetectionEnabled: false,
      loadingSpinnerEnabled: false,
      errorHandlingEnabled: false,
      toastNotificationsEnabled: false,
      datePickerEnabled: false,
      themeSwitchingEnabled: false,
      imageUploadingEnabled: false,
      passwordStrengthEnabled: false,
      browserHistoryEnabled: false,
      geolocationEnabled: false,
      webSocketsEnabled: false,
      dragAndDropEnabled: false,
      idleTimeoutEnabled: false,
      enableAudioChat: false,
      enableVideoChat: false,
      enableFileSharing: false,
      enableBlockchainCommunication: false,
      enableDecentralizedStorage: false,
      selectDatabaseVersion: "",
      selectAppVersion: "",
      enableDatabaseEncryption: false,
      id: "",
      filter: function (
        key: "communicationMode" | "defaultFileType" | keyof Settings
      ): void {
        throw new Error("Function not implemented.");
      },
      appName: "",
      idleTimeoutId: null,
    },
    dataVersions: {
      backend: new Promise<string>(() => ""),
      frontend: new Promise<string>(() => ""),
    },
    documentSize: DocumentSize.A4,
    layout: undefined,
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
      fontSize: 0,
    },
    headerFooterOptions: {
      headerContent: undefined,
      footerContent: undefined,
      showHeader: false,
      showFooter: false,
      dateFormat: undefined,
      differentFirstPage: false,
      differentOddEven: false,
      enabled: true,
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
    revisions: {
      enabled: false,
      author: "",
      dataFormat: ""
    },
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
    tableStyles: {},
    highlight: false,
    highlightColor: "",
    footnote: false,
    defaultZoomLevel: 0,
    customProperties: undefined,
    value: undefined,
    metadata: undefined,
    limit: 0,
    page: 0,

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
    orientation: "portrait",
    sections: undefined,

    userIdea: {
      id: 909,
      title: "",
      description: "",
    },
    previousMetadata: {},
     currentMetadata:{},
     accessHistory:[],
     lastModifiedDate: { value: new Date, isModified: false } as ModifiedDate,
    };
};
function callback() {
  throw new Error("Function not implemented.");
}

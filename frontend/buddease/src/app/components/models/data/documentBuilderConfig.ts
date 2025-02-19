import { ContentState } from "draft-js";
import { DocumentBuilderConfig } from "../../../configs/DocumentBuilderConfig";
import { LanguageEnum, CodingLanguageEnum } from "../../communications/LanguageEnum";
import { DocumentTypeEnum } from "../../documents/DocumentGenerator";
import { LinksType } from "../../documents/DocumentOptions";
import { AlignmentOptions } from "../../state/redux/slices/toolbarSlice";
import { VersionData } from "../../versions/VersionData";
import { DocumentSize, Layout } from "./StatusType";

const documentBuilderConfig: DocumentBuilderConfig = {
    levels: [],
    isDynamic: false,
    language: LanguageEnum.English,
    documentType: DocumentTypeEnum.Text,
    fontFamily: "Arial",
    fontSize: 12,
    textColor: "",
    backgroundColor: "",
    lineSpacing: 1,
    structure: undefined,
    uniqueIdentifier: "",
    enableSpellCheck: false,
    enableAutoSave: false,
    autoSaveInterval: 0,
    showWordCount: false,
    maxWordCount: 0,
    enableSyncWithExternalCalendars: false,
    enableThirdPartyIntegration: false,
    thirdPartyAPIKey: "",
    thirdPartyEndpoint: "",
    enableAccessibilityMode: false,
    highContrastMode: false,
    screenReaderSupport: false,
    metadata: {
        metadataEntries: {},
        apiEndpoint: "",
        apiKey: "",
        timeout: 0,
        retryAttempts: 0,
    },
    additionalOptionsLabel: "Additional Options",
    documentSize: DocumentSize.A4,
    createdBy: "",
    sections: [],
    orientation: "portrait",
    lastModifiedBy: "",
    limit: 0,
    page: 0,
    additionalOptions: undefined,
    documentPhase: "",
    versionData: {} as VersionData,
    size: DocumentSize.A4,
    animations: {
        type: "custom",
        duration: 0
    },
    layout: {} as Layout,
    panels: [],
    pageNumbers: {
        enabled: true,
        format: "",
    },
    footer: "",
    watermark: {
        enabled: false,
        text: "",
        color: "",
        opacity: 50,
        fontSize: 12,
        size: DocumentSize.A4,
        x: 0,
        y: 0,
        rotation: 0,
        borderStyle: "",

    },
    headerFooterOptions: {
        enabled: true,
        showHeader: true,
        showFooter: true,
        differentFirstPage: true,
        differentOddEven: true,
        headerOptions: {
            height: {
                type: "fixed",
                value: 0,
            },
            fontSize: 12,
            fontFamily: "Arial",
            fontColor: "",
            alignment: AlignmentOptions.LEFT,
            font: "Arial",
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
            alignment: AlignmentOptions.LEFT,
            font: "Arial",
            fontSize: 12,
            fontFamily: "Arial",
            fontColor: "",
            bold: false,
            italic: false,
            underline: false,
            strikeThrough: false,
            height: {
                type: "fixed",
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
    zoom: 100,
    showRuler: false,
    showDocumentOutline: false,
    showComments: false,
    showRevisions: false,
    spellCheck: false,
    grammarCheck: false,
    visibility: "",

    font: "",
    alignment: AlignmentOptions.NULL,
    indentSize: 0,
    bulletList: {
        symbol: "",
        style: "",
    },
    numberedList: {
        style: "",
        format: "",
    },
    headingLevel: 0,
    toc: {
        enabled: false,
        format: "",
        levels: 2,
    },

    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,

    superscript: false,
    hyperlink: "",
    textStyles: {},
    image: "",

    links: {} as LinksType,
    embeddedContent: {
        enabled: false,
        allow: false,
        language: LanguageEnum.English

    },
    bookmarks: {
        enabled: false,
    },
    crossReferences: {
        enabled: false,
        format: "",
    },
    footnotes: {
        enabled: false,
        format: "",
    },
    endnotes: {
        enabled: false, // Assuming default values, adjust as needed
        format: "APA",  // Example format
    },
    comments: {
        enabled: false, // Assuming default values, adjust as needed
        author: "",
        dateFormat: "MM-DD-YYYY",
    },
    revisions: undefined, // Set to undefined or an appropriate RevisionOptions object
    embeddedMedia: {
        enabled: false,
        allow: false,
    },
    embeddedCode: {
        enabled: false,
        language: CodingLanguageEnum.Javascript, // Replace with the appropriate enum value
        allow: false,
    },
    styles: {},
    previousMetadata: undefined, // StructuredMetadata or undefined
    currentMetadata: undefined,  // StructuredMetadata or undefined
    currentContent: {} as ContentState, // Assuming a string or appropriate ContentState object
    previousContent: undefined,  // Assuming undefined or a ContentState object
    lastModifiedDate: undefined, // Assuming ModifiedDate or undefined
    accessHistory: [], // Assuming an array of AccessRecord objects
    tableCells: {
        enabled: false,
        padding: 0,
        fontSize: 12,
        alignment: "left",
        borders: undefined, // Assuming BorderStyle or undefined
    },
    table: {
        enabled: false, // Adjust as needed
    },
    tableRows: [], // Assuming an array of numbers or empty array
    tableColumns: [], // Assuming an array of numbers or empty array
    codeBlock: {
        enabled: false, // Assuming default values or adjust as needed
    },
    blockquote: {
        enabled: false, // Adjust as needed
    },
    codeInline: {
        enabled: false, // Adjust as needed
    },
    quote: {
        enabled: false, // Assuming it's an object with enabled property
    },
    todoList: {
        enabled: false, // Adjust as needed
    },
    orderedTodoList: {
        enabled: false, // Adjust as needed
    },
    unorderedTodoList: {
        enabled: false, // Adjust as needed
    },
    color: "#000000", // Assuming a default color
    colorCoding: undefined, // Assuming a Record<string, string> or undefined
    highlight: {
        enabled: false,
        colors: {}, // Assuming a dictionary of colors
    },
    highlightColor: "#FFFF00", // Assuming a default highlight color
    customSettings: undefined, // Assuming a Record<string, any> or undefined
    documents: [], // Assuming an array of DocumentData objects
    includeType: { enabled: false, format: "none" }, 
    footnote: {
        enabled: false,
        format: "APA", // Example format
    },
    defaultZoomLevel: 100, // Default zoom level
    customProperties: undefined, // Assuming a Record<string, any> or undefined
    value: null, // Allow setting a value
    includeTitle: {
        enabled: false, // Adjust as needed
    },
    includeContent: {
        enabled: false, // Adjust as needed
    },
    includeStatus: {
        enabled: false, // Adjust as needed
    },
    includeAdditionalInfo: {
        enabled: false, // Adjust as needed
    },
    userSettings: undefined, // Assuming UserSettings or undefined
    dataVersions: undefined, // Assuming DataVersions or undefined
    options: {
        additionalOptions: [],
        additionalOptionsLabel: "",
        additionalDocumentOptions: undefined,
    },
};


export { documentBuilderConfig }
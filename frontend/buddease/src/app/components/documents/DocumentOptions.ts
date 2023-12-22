// documentOptions.ts
export interface DocumentOptions {
  additionalOption: string | number | readonly string[] | undefined;
  isDynamic: boolean;
  visibility: "public" | "private";
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  lineSpacing: number;
  alignment: "left" | "center" | "right" | "justify";
  indentSize: number;
  bulletList: boolean;
  numberedList: boolean;
  headingLevel: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  subscript: boolean;
  superscript: boolean;
  hyperlink: string;
  image: string;
  table: boolean;
  tableRows: number;
  tableColumns: number;
  codeBlock: boolean;
  blockquote: boolean;
  codeInline: boolean;
  quote: string;
  todoList: boolean;
  orderedTodoList: boolean;
  unorderedTodoList: boolean;
  content?: string; // Property for document content
  css?: string; // Property for document CSS
  html?: string; // Property for document HTML
  size?: number;
  customSettings: Record<string, any>; // For additional custom settings
}

export type DocumentSize = "letter" | "legal" | "a4" | "custom"; // You can extend this list

export const getDefaultDocumentOptions = (): DocumentOptions => {
  return {
    fontSize: 14,
    textColor: "#000000",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    lineSpacing: 1.5,
    alignment: "left",
    indentSize: 20,
    bulletList: true,
    numberedList: true,
    headingLevel: 1,
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    subscript: false,
    superscript: false,
    hyperlink: "",
    image: "",
    table: false,
    tableRows: 3,
    tableColumns: 3,
    codeBlock: false,
    blockquote: false,
    codeInline: false,
    quote: "",
    todoList: false,
    orderedTodoList: false,
    unorderedTodoList: false,
    isDynamic: true,
    visibility: "private",
    content: "content", // Property for document content
    css: "css", // Property for document CSS
      html: "html", // Property for document HTML
    size: 0, // Property for
    additionalOption: [],
    customSettings: {}, //any settings not defined in the document options
  };
};

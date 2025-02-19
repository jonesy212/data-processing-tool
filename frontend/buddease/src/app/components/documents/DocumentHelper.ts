// DocumentHelper.ts

interface DocumentHelper {
  captureEvents(): void;
  caretRangeFromPoint(x: number, y: number): Range | null;
  createAttribute(localName: string): Attr;
  createAttributeNS(
    namespace: string,
    arg1: string | null,
    qualifiedName: string,
    arg3: string
  ): Attr;
  createCDATASection(data: string): CDATASection;
  createComment(data: string): Comment;
  createDocumentFragment(): DocumentFragment;
  clear(): void;
}

//clear elements from the document
export function clear(element: HTMLElement): void {
  // Assuming you want to clear the content of an HTML element
  element.innerHTML = "";
}

// Example usage:
const myDivElement = document.getElementById("myDiv");
if (myDivElement) {
  clear(myDivElement);
}

const DocumentHelper: DocumentHelper = {
  captureEvents: function (): void {
    console.log("Capture events");
  },

  caretRangeFromPoint: function (x: number, y: number): Range | null {
    console.log(`Caret range from point (${x}, ${y})`);
    return null;
  },

  clear: function (): void {
    console.log("Clear content");
  },

  createAttribute: function (localName: string): Attr {
    return document.createAttribute(localName);
  },

  createAttributeNS: function (
    namespace: string,
    arg1: string | null,
    qualifiedName: string,
    arg3: string
  ): Attr {
    return document.createAttributeNS(namespace, qualifiedName);
  },

  createCDATASection: function (data: string): CDATASection {
    return document.createCDATASection(data);
  },

  createComment: function (data: string): Comment {
    return document.createComment(data);
  },

  createDocumentFragment: function (): DocumentFragment {
    return document.createDocumentFragment();
  },
};

export default DocumentHelper;


// metadataUtils.ts


async function getMetadataForContent(contentId: string, content: string): Promise<StructuredMetadata> {
    // Process the content string
    // ...
  }
  
  
  
  async function getMetadataFromPlainText(contentId: string, contentState: ContentState): Promise<StructuredMetadata> {
    const contentString = contentState.getPlainText();
    return await getMetadataForContent(contentId, contentString);
  }

  
  export {getMetadataForContent,  getMetadataFromPlainText}
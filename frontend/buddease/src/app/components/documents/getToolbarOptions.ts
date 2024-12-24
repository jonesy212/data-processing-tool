const getToolbarOptions = ({
    isDocumentEditor,
    fontSize,
    bold,
    italic,
    underline,
    strike,
    code,
    link,
    image,
  }: {
    isDocumentEditor: boolean;
    fontSize?: string | number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    link?: boolean;
    image?: boolean;
  }) => {
    const options: any[] = [];
  
    if (isDocumentEditor) {
      if (bold) options.push("bold");
      if (italic) options.push("italic");
      if (underline) options.push("underline");
      if (strike) options.push("strike");
      if (code) options.push("code");
      if (link) options.push("link");
      if (image) options.push("image");
      if (fontSize) options.push({ size: [fontSize] });
    }
  
    return options;
  };



export { getToolbarOptions }
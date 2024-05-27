interface TableStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
  padding: string;
  margin: string;
  // Add more properties as needed
}

interface TableStylesProps {
  tableStyles: TableStyle[];
}

export type { TableStyle, TableStylesProps };

interface TableStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;

    // Padding around the table
    padding: string,
    // Margin around the table
    margin: string,

}

interface TableStylesProps {
  tableStyles: TableStyle[];
}

export type { TableStyle, TableStylesProps };

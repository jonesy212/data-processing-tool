// formatCalendarAsDOCX.ts
import { CalendarEvent } from '@/app/components/calendar/CalendarEvent';
import { MyPropertiesOptions } from '@/app/configs/declarations/global';
import * as docx from 'docx';
import { CustomDocument } from '../documents/DocumentOptions';
import { WritableDraft } from "../state/redux/ReducerGenerator";
import { SimpleCalendarEvent } from "./CalendarContext";



// Function to format calendar data as DOCX
export const formatCalendarAsDOCX = async (
  events: (WritableDraft<SimpleCalendarEvent> | WritableDraft<CalendarEvent>)[],
  calendarDisplaySettings: CalendarDisplaySettings,
  options: MyPropertiesOptions = {} as MyPropertiesOptions
): Promise<Blob> => {
  // Create a new document
  const doc = new docx.Document(options) as CustomDocument;

  const sectionBreak = new docx.Paragraph({
    children: [new docx.TextRun("")],
  });
  doc.addParagraph(sectionBreak);
  
  // Create a new section
  const section = doc.createSection();

  // Create a new paragraph for the title
  const titleParagraph = new docx.Paragraph({
    children: [
      new docx.TextRun({
        text: "Calendar Events",
        bold: true,
        size: 24,
      }),
    ],
  });

  // Add title paragraph to the section
  section.addChildElement(titleParagraph);

  // Add calendar events
  events.forEach((event) => {
    // Create paragraphs for event details
    const titleTextRun = new docx.TextRun({
      text: `Title: ${event.title}`,
      bold: true,
    });
    const titleParagraphOptions = {
      children: [titleTextRun],
    };
    const startDateTextRun = new docx.TextRun({
      text: `Start Date: ${event.startDate}`,
    });
    const startDateParagraphOptions = {
      children: [startDateTextRun],
    };
    const endDateTextRun = new docx.TextRun({
      text: `End Date: ${event.endDate}`,
    });
    const endDateParagraphOptions = {
      children: [endDateTextRun],
    };

    // Create paragraphs for event details
    const titleParagraph = new docx.Paragraph(titleParagraphOptions);
    const startDateParagraph = new docx.Paragraph(startDateParagraphOptions);
    const endDateParagraph = new docx.Paragraph(endDateParagraphOptions);

    // Add event details paragraphs to the section
    section.addChildElement(titleParagraph);
    section.addChildElement(startDateParagraph);
    section.addChildElement(endDateParagraph);
  });

  // Convert the document to a blob
  return await docx.Packer.toBlob(doc);
};

// route.ts
// Dataset Analysis & Hypothesis Testing
// // upload.ts
// src/app/api/datasets/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/api/DatabaseClient';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { ContentLoggerServer } from '@/app/server/ContentLoggerServer';

// Promisify fs functions for async/await
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'datasets');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'text/plain'
];



interface ProcessedTextResult {
  rowCount: number;
  columnCount: number;
  columnNames: string[];
  sampleData: Record<string, string>[];
  statistics: {
    fileType: string;
    lineCount: number;
  };
}


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Use getAll() and take the first item
    const fileEntries = formData.getAll('file');
    const nameEntries = formData.getAll('name');
    const descriptionEntries = formData.getAll('description');
    const userIdEntries = formData.getAll('userId');
    const tagsEntries = formData.getAll('tags');
    
    const file = fileEntries.length > 0 ? fileEntries[0] : null;
    const name = nameEntries.length > 0 ? nameEntries[0] : null;
    const description = descriptionEntries.length > 0 ? descriptionEntries[0] : null;
    const userId = userIdEntries.length > 0 ? userIdEntries[0] : null;
    const tags = tagsEntries.length > 0 ? tagsEntries[0] : null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Type assertion
    const fileAsFile = file as unknown as File;
    const nameAsString = name as string || 'Untitled Dataset';
    const descriptionAsString = description as string || '';
    const userIdAsString = userId as string || 'anonymous';
    const tagsAsString = tags as string || '';
    
    // Validate file
    const validationError = validateFile(fileAsFile);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
    
    // Create uploads directory if it doesn't exist
    await ensureUploadsDirectory();
    
    // Generate unique filename
    const fileExtension = path.extname(fileAsFile.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    const publicUrl = `/uploads/datasets/${uniqueFilename}`;
    
    // Convert File to Buffer and save to disk
    const arrayBuffer = await fileAsFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await writeFile(filePath, buffer);
    
    // Extract basic file info
    const fileInfo = {
      originalName: fileAsFile.name,
      size: fileAsFile.size,
      type: fileAsFile.type,
      lastModified: fileAsFile.lastModified
    };
    
    // Process the file based on type
    const processedData = await processFileByType(filePath, fileAsFile.type);
    
    // Prepare dataset metadata
    const datasetId = uuidv4();
    const datasetMetadata = {
      id: datasetId,
      name: nameAsString,
      description: descriptionAsString,
      fileName: fileAsFile.name,
      fileSize: fileAsFile.size,
      fileType: fileAsFile.type,
      filePath: publicUrl,
      storagePath: filePath,
      userId: userIdAsString,
      tags: tagsAsString.split(',').map(tag => tag.trim()).filter(tag => tag),
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'uploaded',
      rowCount: processedData.rowCount || 0,
      columnCount: processedData.columnCount || 0,
      columnNames: processedData.columnNames || [],
      sampleData: processedData.sampleData || [],
      statistics: processedData.statistics || {},
      metadata: fileInfo
    };
    
    // Save to database
    const db = new DatabaseClient();
    const datasetRecord = await db.createDataset(datasetMetadata);
    
    // Log the upload
    ContentLoggerServer.logEventToFile(
      'DatasetUpload',
      `Dataset uploaded: ${nameAsString} (ID: ${datasetId}, User: ${userIdAsString}, Size: ${formatBytes(fileAsFile.size)})`,
      'dataset-uploads.log'
    );
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      dataset: {
        id: datasetId,
        name: nameAsString,
        description: descriptionAsString,
        fileUrl: publicUrl,
        fileSize: formatBytes(fileAsFile.size),
        uploadDate: new Date().toISOString(),
        metadata: {
          rowCount: datasetMetadata.rowCount,
          columnCount: datasetMetadata.columnCount,
          columnNames: datasetMetadata.columnNames,
          sampleData: datasetMetadata.sampleData.slice(0, 5) // First 5 rows
        }
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('File upload error:', error);
    
    // Log the error
    ContentLoggerServer.logEventToFile(
      'DatasetUploadError',
      `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'dataset-errors.log'
    );
    
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper functions
function validateFile(file: File): string | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`;
  }
  
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.match(/\.(csv|json|txt|xlsx?)$/i)) {
    return `Unsupported file type. Allowed types: CSV, Excel, JSON, TXT`;
  }
  
  return null;
}

async function ensureUploadsDirectory(): Promise<void> {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create uploads directory:', error);
    throw new Error('Failed to create upload directory');
  }
}

async function processFileByType(filePath: string, fileType: string): Promise<any> {
  try {
    if (fileType.includes('csv') || filePath.endsWith('.csv')) {
      return await processCSV(filePath);
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
               filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
      return await processExcel(filePath);
    } else if (fileType.includes('json') || filePath.endsWith('.json')) {
      return await processJSON(filePath);
    } else if (fileType.includes('text') || filePath.endsWith('.txt')) {
      return await processText(filePath);
    } else {
      // Default processing for unknown types
      return {
        rowCount: 0,
        columnCount: 0,
        columnNames: [],
        sampleData: [],
        statistics: {}
      };
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function processCSV(filePath: string): Promise<any> {
  const fs = require('fs');
  const { parse } = require('csv-parse/sync');
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  if (records.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columnNames: [],
      sampleData: [],
      statistics: {}
    };
  }
  
  const columnNames = Object.keys(records[0]);
  const sampleData = records.slice(0, 10);
  
  // Calculate basic statistics
  const statistics = calculateBasicStatistics(records, columnNames);
  
  return {
    rowCount: records.length,
    columnCount: columnNames.length,
    columnNames,
    sampleData,
    statistics
  };
}

async function processExcel(filePath: string): Promise<any> {
  const XLSX = require('xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const records = XLSX.utils.sheet_to_json(worksheet);
  
  if (records.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columnNames: [],
      sampleData: [],
      statistics: {}
    };
  }
  
  const columnNames = Object.keys(records[0]);
  const sampleData = records.slice(0, 10);
  const statistics = calculateBasicStatistics(records, columnNames);
  
  return {
    rowCount: records.length,
    columnCount: columnNames.length,
    columnNames,
    sampleData,
    statistics
  };
}

async function processJSON(filePath: string): Promise<any> {
  const fs = require('fs');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  
  // Handle different JSON structures
  let records: any[] = [];
  let columnNames: string[] = []; // Add explicit type
  
  if (Array.isArray(data)) {
    records = data;
    if (records.length > 0 && typeof records[0] === 'object') {
      columnNames = Object.keys(records[0]);
    }
  } else if (typeof data === 'object') {
    // If it's an object with data property
    if (data.data && Array.isArray(data.data)) {
      records = data.data;
      if (records.length > 0 && typeof records[0] === 'object') {
        columnNames = Object.keys(records[0]);
      }
    } else {
      // Single object
      records = [data];
      columnNames = Object.keys(data);
    }
  }
  
  const sampleData = records.slice(0, 10);
  const statistics = calculateBasicStatistics(records, columnNames);
  
  return {
    rowCount: records.length,
    columnCount: columnNames.length,
    columnNames,
    sampleData,
    statistics
  };
}


async function processText(filePath: string): Promise<ProcessedTextResult> {
  const fs = require('fs');
  const fileContent: string = fs.readFileSync(filePath, 'utf8');
  
  // Type annotation for line parameter
  const lines: string[] = fileContent.split('\n').filter((line: string) => line.trim() !== '');
  
  const firstLine: string = lines[0] || '';
  const isCSV: boolean = firstLine.includes(',');
  const isTSV: boolean = firstLine.includes('\t');
  
  let records: Record<string, string>[] = [];
  let columnNames: string[] = [];
  
  if (isCSV || isTSV) {
    const delimiter: string = isCSV ? ',' : '\t';
    
    // Type annotation for col parameter
    columnNames = firstLine.split(delimiter).map((col: string) => col.trim());
    
    for (let i = 1; i < Math.min(lines.length, 100); i++) {
      const line: string = lines[i];
      const values: string[] = line.split(delimiter);
      const record: Record<string, string> = {};
      
      columnNames.forEach((col: string, index: number) => {
        record[col] = values[index] ? values[index].trim() : '';
      });
      
      records.push(record);
    }
  } else {
    // Plain text - one column
    columnNames = ['text'];
    
    // Type annotation for line parameter
    records = lines.map((line: string) => ({ text: line }));
  }
  
  const sampleData: Record<string, string>[] = records.slice(0, 10);
  
  return {
    rowCount: lines.length,
    columnCount: columnNames.length,
    columnNames,
    sampleData,
    statistics: { 
      fileType: 'text', 
      lineCount: lines.length 
    }
  };
}

function calculateBasicStatistics(records: any[], columnNames: string[]): any {
  const statistics: any = {};
  
  columnNames.forEach((column: string) => {
    const values = records.map((record: any) => record[column]);
    const numericValues = values.filter((val: any) => !isNaN(parseFloat(val)) && val !== null && val !== '');
    
    if (numericValues.length > 0) {
      const nums = numericValues.map(Number);
      statistics[column] = {
        count: numericValues.length,
        nonNullCount: numericValues.length,
        nullCount: values.length - numericValues.length,
        min: Math.min(...nums),
        max: Math.max(...nums),
        mean: nums.reduce((a: number, b: number) => a + b, 0) / nums.length,
        type: 'numeric'
      };
    } else {
      // For text columns
      const uniqueValues = [...new Set(values)];
      statistics[column] = {
        count: values.length,
        uniqueCount: uniqueValues.length,
        nullCount: values.filter((v: any) => v === null || v === '').length,
        sampleValues: uniqueValues.slice(0, 5),
        type: 'text'
      };
    }
  });
  
  return statistics;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Optional: GET endpoint to list uploaded datasets
export async function GET(request: NextRequest) {
  try {
    const db = new DatabaseClient();
    const datasets = await db.getDatasets();
    
    return NextResponse.json({
      success: true,
      count: datasets.length,
      datasets: datasets.map(dataset => ({
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        fileUrl: dataset.filePath,
        fileSize: formatBytes(dataset.fileSize),
        uploadDate: dataset.uploadDate,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        status: dataset.status
      }))
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch datasets'
    }, { status: 500 });
  }
}
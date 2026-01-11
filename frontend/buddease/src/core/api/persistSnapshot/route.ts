// route.ts
import fs from 'fs';
import path from 'path';
import type { DocumentOptions } from '@/core/documents/DocumentOptions';
import { ServerDocumentGenerator } from '@/core/server/ServerDocumentGenerator';
import type { DocumentData } from '@/core/documents/editing/DocumentBuilder';
import type { BaseData } from '@/core/models/data/Data';
import { readServerCache, writeServerCache } from '@/core/server/CacheManager';
import Docxtemplater from "docxtemplater";
import { NextRequest, NextResponse } from 'next/server';
import PizZip from "pizzip";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1️⃣ Cache operation (key/data)
    if (body.key && body.data !== undefined) {
      await writeServerCache(body.key, body.data);
      return NextResponse.json({ success: true });
    }

    // 2️⃣ Financial report generation
    if (body.type === 'financialReport') {
      return await handleFinancialReport(body.options, body.documents);
    }

    // 3️⃣ Text document generation
    if (body.type === 'textDocument') {
      return await handleTextDocument(body.options, body.fileContent);
    }

    // Invalid payload
    return NextResponse.json({ error: 'Invalid POST payload' }, { status: 400 });

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process POST request' },
      { status: 500 }
    );
  }
}


async function handleTextDocument(options: DocumentOptions, fileContent: string) {
  const content = options.content || "Default Text Document Content";
  const contentData = { content };

  const buffer = Buffer.from(fileContent, 'base64');
  const zip = new PizZip(buffer);
  const docx = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  docx.setData(contentData);
  docx.render();

  const result = docx.getZip().generate({ type: "nodebuffer" });
  const generatedFilePath = path.join(process.cwd(), 'generated', 'textDocument.docx');
  
  await fs.promises.mkdir(path.dirname(generatedFilePath), { recursive: true });
  await fs.promises.writeFile(generatedFilePath, result);

  return NextResponse.json({
    success: true,
    filePath: generatedFilePath,
    message: `Text Document created successfully at ${generatedFilePath}.`
  });
}

async function handleFinancialReport(options: DocumentOptions, documents: DocumentData<BaseData<any>>) {
  // Your financial report generation logic here
  const financialReportContent = "Financial Report Content";
  const financialReportFileName = "financial_report.docx";
  const generatedFilePath = path.join(process.cwd(), 'generated', financialReportFileName);
  
  await fs.promises.mkdir(path.dirname(generatedFilePath), { recursive: true });
  await fs.promises.writeFile(generatedFilePath, financialReportContent);

  return NextResponse.json({
    success: true,
    filePath: generatedFilePath,
    message: `Financial Report created successfully at ${generatedFilePath}.`
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const pathnameParts = url.pathname.split('/');
    const key = pathnameParts.pop(); // last segment

    // 1️⃣ Cache retrieval by key
    if (key && key !== 'documents') { // avoid conflict with 'documents' path
      const data = await readServerCache(key);
      return NextResponse.json({ success: true, data });
    }

    // 2️⃣ Document listing
    if (pathnameParts.includes('documents') || key === 'documents') {
      const generatedDir = path.join(process.cwd(), 'generated');
      await fs.promises.mkdir(generatedDir, { recursive: true });
      const files = await fs.promises.readdir(generatedDir);
      return NextResponse.json({ success: true, files });
    }

    // Invalid GET request
    return NextResponse.json(
      { error: 'Invalid GET request' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process GET request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { fileName } = await request.json();
    const filePath = path.join(process.cwd(), 'generated', fileName);
    
    await fs.promises.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
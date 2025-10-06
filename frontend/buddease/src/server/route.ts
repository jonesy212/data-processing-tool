// route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readServerCache, writeServerCache } from '@/app/components/lib/cache/server/CacheManager';
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { DocumentOptions } from '@/app/documents/DocumentOptions';
import { DocumentData } from '@/app/documents/editing/DocumentBuilder';
import { BaseData } from '@/app/models/data/Data';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const key = request.nextUrl.pathname.split('/').pop();
  
  if (!key) {
    return NextResponse.json({ error: 'Key is required' }, { status: 400 });
  }
  
  try {
    const data = await readServerCache(key);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read from cache' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, data } = await request.json();
    
    if (!key || data === undefined) {
      return NextResponse.json(
        { error: 'Key and data are required' },
        { status: 400 }
      );
    }
    
    await writeServerCache(key, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to write to cache' },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  try {
    const { key, data } = await request.json();
    
    if (!key || data === undefined) {
      return NextResponse.json(
        { error: 'Key and data are required' },
        { status: 400 }
      );
    }
    
    await writeServerCache(key, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to write to cache' },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  try {
    const { options, documents } = await request.json();
    const generator = new ServerDocumentGenerator();
    
    const result = await generator.createFinancialReport(options, documents);
    
    return NextResponse.json({ 
      success: true, 
      message: result 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const { type, options, fileContent, documents } = await request.json();

    if (type === 'financialReport') {
      return await handleFinancialReport(options, documents);
    } else {
      return await handleTextDocument(options, fileContent);
    }
  } catch (error) {
    console.error("Error generating document:", error);
    return NextResponse.json(
      { error: "Failed to generate document" },
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

// Additional API endpoints for document management
export async function GET() {
  try {
    const generatedDir = path.join(process.cwd(), 'generated');
    await fs.promises.mkdir(generatedDir, { recursive: true });
    const files = await fs.promises.readdir(generatedDir);
    
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read documents" },
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
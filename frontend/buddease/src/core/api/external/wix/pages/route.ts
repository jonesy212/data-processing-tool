// route.ts
export async function POST(request: NextRequest) {
  try {
    const pageData = await request.json();
    
    // Your Wix page creation logic here
    const createdPage = await createWebPage(pageData);
    
    return NextResponse.json({ page: createdPage });
  } catch (error) {
    return NextResponse.json({ error: 'Page creation failed' }, { status: 500 });
  }
}

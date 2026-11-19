import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'llms.txt');
    const content = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    return new NextResponse('Print Today UK — In-House Same-Day Printing London\nhttps://www.printtodayuk.com', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

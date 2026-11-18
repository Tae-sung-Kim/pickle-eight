import { NextResponse } from 'next/server';
import { API_DOCS_ENABLED } from '@/features/api-docs/constants/api-docs.constant';
import { loadOpenApiDocument } from '@/features/api-docs/utils/load-openapi.util';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!API_DOCS_ENABLED) {
    return new NextResponse('Not Found', { status: 404 });
  }
  try {
    const doc = await loadOpenApiDocument();
    return NextResponse.json(doc, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    // 조각 파일이 잘못되면 일부만 내보내지 않고 실패한다
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

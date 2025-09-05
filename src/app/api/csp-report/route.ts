import { NextResponse } from 'next/server';

/**
 * Accepts CSP violation reports.
 * Supports legacy `report-uri` format ({"csp-report": {...}})
 * and modern Reporting API batch format.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: unknown;
    if (contentType.includes('application/reports+json')) {
      payload = await req.json();
    } else if (contentType.includes('application/csp-report')) {
      payload = await req.json();
    } else if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const text = await req.text();
      payload = { raw: text };
    }

    // For now, just log. In production, forward to a logging service or store minimally.
    console.warn('[CSP-REPORT]', JSON.stringify(payload));
  } catch (err) {
    console.error('[CSP-REPORT] parse-error', err);
  }
  // Always 204 to avoid retries
  return new NextResponse(null, { status: 204 });
}

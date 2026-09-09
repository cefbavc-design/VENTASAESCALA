import { NextResponse } from 'next/server';
import getDb from '../../../../../lib/db';
import { isAuthenticated } from '../../../../../lib/auth';
import { buildUrl } from '../../../../../lib/config';
import { qrToPngBuffer, qrToSvgString } from '../../../../../lib/qrgen';

export async function GET(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const db = getDb();
  const qr = db.prepare('SELECT * FROM qrs WHERE codigo = ?').get(params.codigo);
  if (!qr) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const formato = searchParams.get('formato') === 'svg' ? 'svg' : 'png';
  const url = buildUrl(qr.codigo);

  if (formato === 'svg') {
    const svg = await qrToSvgString(url);
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="${qr.codigo}.svg"`,
      },
    });
  }

  const png = await qrToPngBuffer(url, 512);
  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${qr.codigo}.png"`,
    },
  });
}

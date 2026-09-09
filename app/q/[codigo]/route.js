import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { isDestinoValido } from '../../../lib/config';

export async function GET(request, { params }) {
  const { codigo } = params;
  const db = getDb();

  const qr = db.prepare('SELECT * FROM qrs WHERE codigo = ?').get(codigo);

  if (!qr) {
    return new NextResponse('QR no encontrado', { status: 404 });
  }

  if (qr.estado === 'pausado') {
    return NextResponse.redirect(new URL('/pausado', request.url));
  }

  if (qr.estado === 'disponible' || !qr.destino || !isDestinoValido(qr.destino)) {
    return NextResponse.redirect(new URL('/no-configurado', request.url));
  }

  // Registro best-effort del escaneo (estructura preparada para analítica futura)
  try {
    const ua = request.headers.get('user-agent') || null;
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;
    db.prepare(
      `INSERT INTO scans (qr_codigo, destino, user_agent, ip) VALUES (?, ?, ?, ?)`
    ).run(qr.codigo, qr.destino, ua, ip);
  } catch {
    // Nunca bloqueamos la redirección por un fallo de logging
  }

  return NextResponse.redirect(qr.destino, { status: 302 });
}

import { NextResponse } from 'next/server';
import getDb from '../../../../lib/db';
import { isAuthenticated } from '../../../../lib/auth';
import { buildUrl, isDestinoValido } from '../../../../lib/config';

export async function GET(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = getDb();
  const qr = db.prepare('SELECT * FROM qrs WHERE codigo = ?').get(params.codigo);
  if (!qr) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const scans = db
    .prepare('SELECT COUNT(*) c FROM scans WHERE qr_codigo = ?')
    .get(params.codigo).c;

  return NextResponse.json({ ...qr, url: buildUrl(qr.codigo), scans });
}

export async function PATCH(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const db = getDb();
  const existing = db.prepare('SELECT * FROM qrs WHERE codigo = ?').get(params.codigo);
  if (!existing) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const updates = [];
  const args = [];

  if (typeof body.destino !== 'undefined') {
    const destino = body.destino ? body.destino.trim() : null;
    if (destino) {
      if (!isDestinoValido(destino)) {
        return NextResponse.json(
          { error: 'El destino debe ser una URL http/https válida' },
          { status: 400 }
        );
      }
      updates.push('destino = ?');
      args.push(destino);

      // Si es la primera vez que se asigna destino, registramos fecha_asignacion
      if (!existing.destino) {
        updates.push('fecha_asignacion = ?');
        args.push(new Date().toISOString());
      }
      // Si no viene un estado explícito, al asignar destino pasa a activo
      if (typeof body.estado === 'undefined' && existing.estado === 'disponible') {
        updates.push('estado = ?');
        args.push('activo');
      }
    } else {
      updates.push('destino = ?', 'estado = ?', 'fecha_asignacion = ?');
      args.push(null, 'disponible', null);
    }
  }

  if (typeof body.estado !== 'undefined') {
    if (!['disponible', 'activo', 'pausado'].includes(body.estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }
    if (body.estado !== 'disponible' && !existing.destino && !body.destino) {
      return NextResponse.json(
        { error: 'No se puede activar/pausar un QR sin destino configurado' },
        { status: 400 }
      );
    }
    updates.push('estado = ?');
    args.push(body.estado);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 });
  }

  args.push(params.codigo);
  db.prepare(`UPDATE qrs SET ${updates.join(', ')} WHERE codigo = ?`).run(...args);

  const updated = db.prepare('SELECT * FROM qrs WHERE codigo = ?').get(params.codigo);
  return NextResponse.json({ ...updated, url: buildUrl(updated.codigo) });
}

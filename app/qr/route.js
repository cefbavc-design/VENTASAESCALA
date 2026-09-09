import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';
import { buildUrl } from '../../../lib/config';

export async function GET(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const estado = searchParams.get('estado');
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50', 10), 200);

  const db = getDb();

  const where = [];
  const args = [];
  if (q) {
    where.push('(codigo LIKE ? OR destino LIKE ?)');
    args.push(`%${q}%`, `%${q}%`);
  }
  if (estado && ['disponible', 'activo', 'pausado'].includes(estado)) {
    where.push('estado = ?');
    args.push(estado);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) c FROM qrs ${whereSql}`).get(...args).c;

  const rows = db
    .prepare(
      `SELECT * FROM qrs ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`
    )
    .all(...args, pageSize, (page - 1) * pageSize);

  const stats = db
    .prepare(
      `SELECT
        COUNT(*) total,
        SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) disponibles,
        SUM(CASE WHEN destino IS NOT NULL THEN 1 ELSE 0 END) asignados,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) activos,
        SUM(CASE WHEN estado = 'pausado' THEN 1 ELSE 0 END) pausados
      FROM qrs`
    )
    .get();

  const items = rows.map((r) => ({ ...r, url: buildUrl(r.codigo) }));

  return NextResponse.json({ items, total, page, pageSize, stats });
}

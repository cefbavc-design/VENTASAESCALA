import { NextResponse } from 'next/server';
import getDb from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

const MAX_LOTE = 5000;

export async function POST(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  let { cantidad, prefijo, numeroInicial } = body;

  cantidad = parseInt(cantidad, 10);
  numeroInicial = parseInt(numeroInicial, 10);
  prefijo = (prefijo || 'QR').toString().trim().toUpperCase();

  if (!cantidad || cantidad < 1 || cantidad > MAX_LOTE) {
    return NextResponse.json(
      { error: `La cantidad debe ser entre 1 y ${MAX_LOTE}` },
      { status: 400 }
    );
  }
  if (Number.isNaN(numeroInicial) || numeroInicial < 0) {
    return NextResponse.json({ error: 'Número inicial inválido' }, { status: 400 });
  }
  if (!/^[A-Z0-9-]{1,10}$/.test(prefijo)) {
    return NextResponse.json({ error: 'Prefijo inválido (usá letras/números, máx. 10)' }, { status: 400 });
  }

  const db = getDb();
  const digits = String(numeroInicial + cantidad - 1).length < 4
    ? 4
    : String(numeroInicial + cantidad - 1).length;

  const insertLote = db.prepare(
    `INSERT INTO lotes (prefijo, cantidad, numero_inicial) VALUES (?, ?, ?)`
  );
  const insertQr = db.prepare(
    `INSERT INTO qrs (codigo, estado, lote_id) VALUES (?, 'disponible', ?)`
  );

  const codigosGenerados = [];

  const runAll = db.transaction(() => {
    const loteInfo = insertLote.run(prefijo, cantidad, numeroInicial);
    const loteId = loteInfo.lastInsertRowid;

    for (let i = 0; i < cantidad; i++) {
      const num = numeroInicial + i;
      const codigo = `${prefijo}-${String(num).padStart(digits, '0')}`;
      insertQr.run(codigo, loteId);
      codigosGenerados.push(codigo);
    }

    return loteId;
  });

  let loteId;
  try {
    loteId = runAll();
  } catch (err) {
    if (String(err.message).includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'Alguno de los códigos ya existe. Cambiá el prefijo o el número inicial.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Error generando el lote' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    loteId,
    cantidad,
    primero: codigosGenerados[0],
    ultimo: codigosGenerados[codigosGenerados.length - 1],
  });
}

export async function GET(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const db = getDb();
  const lotes = db.prepare('SELECT * FROM lotes ORDER BY id DESC').all();
  return NextResponse.json({ lotes });
}

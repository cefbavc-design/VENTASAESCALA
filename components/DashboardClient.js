'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

const ESTADO_LABEL = {
  disponible: 'Disponible',
  activo: 'Activo',
  pausado: 'Pausado',
};

function StatCard({ label, value }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function EstadoBadge({ estado }) {
  return <span className={`badge badge-${estado}`}>{ESTADO_LABEL[estado]}</span>;
}

export default function DashboardClient({ initialStats, initialItems }) {
  const [stats, setStats] = useState(initialStats);
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (estado) params.set('estado', estado);
    params.set('pageSize', '100');
    const res = await fetch(`/api/qr?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
      setStats(data.stats);
    }
    setLoading(false);
  }, [q, estado]);

  useEffect(() => {
    const t = setTimeout(fetchData, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, estado]);

  async function toggleEstado(codigo, nuevoEstado) {
    await fetch(`/api/qr/${codigo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    fetchData();
  }

  function copiarUrl(url) {
    navigator.clipboard?.writeText(url);
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard label="QR totales" value={stats.total ?? 0} />
        <StatCard label="Disponibles" value={stats.disponibles ?? 0} />
        <StatCard label="Asignados" value={stats.asignados ?? 0} />
        <StatCard label="Activos" value={stats.activos ?? 0} />
        <StatCard label="Pausados" value={stats.pausados ?? 0} />
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          className="input md:max-w-xs"
          placeholder="Buscar por código o destino…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input md:max-w-[180px]"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
        </select>

        <div className="flex-1" />

        <a href="/api/export/csv" className="btn btn-secondary">
          Exportar CSV
        </a>
        <a href="/api/export/zip" className="btn btn-secondary">
          Descargar ZIP
        </a>
        <a href="/api/export/pdf" className="btn btn-secondary">
          PDF impresión
        </a>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Destino</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="text-left px-4 py-3">Creado</th>
              <th className="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((qr) => (
              <tr key={qr.codigo} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{qr.codigo}</td>
                <td className="px-4 py-3 max-w-[260px] truncate text-muted">
                  {qr.destino || '—'}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={qr.estado} />
                </td>
                <td className="px-4 py-3 text-muted">
                  {qr.fecha_creacion?.slice(0, 10)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2 flex-wrap">
                    <button
                      className="text-accent text-sm font-medium"
                      onClick={() => copiarUrl(qr.url)}
                    >
                      Copiar URL
                    </button>
                    {qr.estado === 'activo' && (
                      <button
                        className="text-warn text-sm font-medium"
                        onClick={() => toggleEstado(qr.codigo, 'pausado')}
                      >
                        Pausar
                      </button>
                    )}
                    {qr.estado === 'pausado' && (
                      <button
                        className="text-ok text-sm font-medium"
                        onClick={() => toggleEstado(qr.codigo, 'activo')}
                      >
                        Reactivar
                      </button>
                    )}
                    <Link
                      href={`/admin/qr/${qr.codigo}`}
                      className="text-ink text-sm font-medium underline"
                    >
                      Editar
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No se encontraron QR.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

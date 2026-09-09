'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ESTADO_LABEL = {
  disponible: 'Disponible',
  activo: 'Activo',
  pausado: 'Pausado',
};

export default function QrDetailClient({ qr: initialQr }) {
  const router = useRouter();
  const [qr, setQr] = useState(initialQr);
  const [destino, setDestino] = useState(initialQr.destino || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function guardarDestino(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMsg('');
    const res = await fetch(`/api/qr/${qr.codigo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destino }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || 'Error al guardar');
      return;
    }
    setQr(data);
    setMsg('Destino actualizado. El QR físico no cambia.');
  }

  async function cambiarEstado(nuevoEstado) {
    setError('');
    const res = await fetch(`/api/qr/${qr.codigo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Error al actualizar estado');
      return;
    }
    setQr(data);
  }

  function copiarUrl() {
    navigator.clipboard?.writeText(qr.url);
    setMsg('URL copiada al portapapeles');
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => router.push('/admin')}
        className="text-sm text-muted mb-4 hover:text-ink"
      >
        ← Volver al panel
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">{qr.codigo}</h1>
        <span className={`badge badge-${qr.estado}`}>{ESTADO_LABEL[qr.estado]}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted mb-1">URL dinámica</p>
            <p className="text-sm break-all">{qr.url}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted mb-1">Destino actual</p>
            <p className="text-sm break-all">{qr.destino || 'Sin configurar'}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={copiarUrl} className="btn btn-secondary">
              Copiar URL
            </button>
            <a href={`/api/qr/${qr.codigo}/imagen?formato=png`} className="btn btn-secondary">
              Descargar PNG
            </a>
            <a href={`/api/qr/${qr.codigo}/imagen?formato=svg`} className="btn btn-secondary">
              Descargar SVG
            </a>
            <a
              href={qr.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              Ver QR en vivo
            </a>
            {qr.estado === 'activo' && (
              <button onClick={() => cambiarEstado('pausado')} className="btn btn-danger">
                Pausar
              </button>
            )}
            {qr.estado === 'pausado' && (
              <button onClick={() => cambiarEstado('activo')} className="btn btn-primary">
                Reactivar
              </button>
            )}
          </div>
        </div>

        <div className="card p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qr/${qr.codigo}/imagen?formato=png`}
            alt={`QR ${qr.codigo}`}
            className="w-full max-w-[220px] mx-auto border border-border rounded-lg p-3"
          />
        </div>
      </div>

      <form onSubmit={guardarDestino} className="card p-6 mt-6 space-y-4">
        <p className="text-sm font-medium">Editar destino</p>
        <input
          className="input"
          placeholder="https://www.instagram.com/tunegocio"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />
        <p className="text-xs text-muted">
          Dejar vacío vuelve el QR a estado "Disponible" (sin destino).
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-ok">{msg}</p>}
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Guardando…' : 'Guardar destino'}
        </button>
      </form>
    </div>
  );
}

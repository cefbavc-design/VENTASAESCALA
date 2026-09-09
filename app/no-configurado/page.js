export default function NoConfigurado() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-xl font-semibold mb-2">Este QR todavía no tiene destino</h1>
        <p className="text-muted text-sm">
          Si sos el dueño de este código, configurá su destino desde el panel
          de administración.
        </p>
      </div>
    </main>
  );
}

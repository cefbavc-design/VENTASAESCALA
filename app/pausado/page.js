export default function Pausado() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⏸️</div>
        <h1 className="text-xl font-semibold mb-2">Este QR está desactivado</h1>
        <p className="text-muted text-sm">
          El enlace fue pausado temporalmente por su administrador. Volvé a
          intentarlo más tarde.
        </p>
      </div>
    </main>
  );
}

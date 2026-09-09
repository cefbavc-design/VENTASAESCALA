'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  const linkClass = (href) =>
    `text-sm font-medium px-3 py-2 rounded-lg ${
      pathname === href ? 'bg-ink text-white' : 'text-muted hover:bg-slate-100'
    }`;

  return (
    <header className="border-b border-border bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-semibold mr-4">QR Dinámico</span>
          <Link href="/admin" className={linkClass('/admin')}>
            Panel
          </Link>
          <Link href="/admin/lotes/nuevo" className={linkClass('/admin/lotes/nuevo')}>
            Nuevo lote
          </Link>
        </div>
        <button onClick={handleLogout} className="text-sm text-muted hover:text-ink">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

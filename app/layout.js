import './globals.css';

export const metadata = {
  title: 'QR Dinámico — Panel',
  description: 'Gestión de QR dinámicos y configurables',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}

import './globals.css';
import Nav from '@/components/Nav';
// 🔽 Fuerza render dinámico (sin prerender en build)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const metadata = { title: 'Bolsa de Garantía', description: 'Gestión de garantías con créditos, reclamaciones y reportes' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es"><body><Nav/><main className="container py-6">{children}</main></body></html>);
}

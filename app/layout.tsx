import './globals.css';
import Nav from '@/components/Nav';
export const metadata = { title: 'Bolsa de Garantía', description: 'Gestión de garantías con créditos, reclamaciones y reportes' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es"><body><Nav/><main className="container py-6">{children}</main></body></html>);
}

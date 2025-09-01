'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Nav(){
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
  const load = async () => {
    // 1) Obtén el usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setEmail(null); setRole(null); return; }

    setEmail(user.email ?? null);

    // 2) Intenta leer el rol por ID
    let { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    // 3) Si falla o no hay data, fallback por email
    if (error || !data) {
      const r = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .maybeSingle();
      data = r.data ?? null;
    }

    setRole(data?.role ?? null);
  };

  load();

  // Re-carga cuando cambie el auth state
  const { data: sub } = supabase.auth.onAuthStateChange(() => load());
  return () => { sub.subscription.unsubscribe(); };
}, []);

  return (
    <header className="bg-white border-b">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold">Bolsa de Garantía</Link>
          {email && (
            <nav className="flex items-center gap-4">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/credits">Créditos</Link>
              <Link href="/reports">Reportes</Link>
              <Link href="/flow">Flujo</Link>
              {role === 'admin' && <Link href="/admin">Admin</Link>}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {email ? (<>
            <span className="text-sm text-gray-600">{email} {role && <span className="ml-1 text-gray-500">({role})</span>}</span>
            <button className="btn" onClick={() => supabase.auth.signOut()}>Salir</button>
          </>) : (<Link href="/" className="btn">Ingresar</Link>)}
        </div>
      </div>
    </header>
  );
}

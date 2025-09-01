'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Nav(){
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? null);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        setRole(data?.role ?? null);
      } else { setEmail(null); setRole(null); }
    };
    load();
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

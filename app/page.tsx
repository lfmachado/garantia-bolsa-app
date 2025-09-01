'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
export default function Home(){
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);
  useEffect(() => { supabase.auth.getUser().then(({data}) => { if (data.user) window.location.href = '/dashboard'; }); }, []);
  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setError(null);
    try {
      if (mode === 'signup') { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
      window.location.href = '/dashboard';
    } catch (e:any) { setError(e.message ?? 'Error'); }
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">Bolsa de Garantía</h1>
        <p className="text-sm text-gray-600 mb-4">Ingresa o regístrate para administrar productos, créditos, facturas, pagos, reclamaciones y reportes.</p>
        <div className="flex gap-2 mb-4">
          <button className={"btn " + (mode==='login'?'btn-primary':'')} onClick={()=>setMode('login')}>Iniciar Sesión</button>
          <button className={"btn " + (mode==='signup'?'btn-primary':'')} onClick={()=>setMode('signup')}>Registrarme</button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <div><label className="label">Correo</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label className="label">Contraseña</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="btn btn-primary w-full" type="submit">{mode==='login'?'Entrar':'Crear cuenta'}</button>
        </form>
        <div className="mt-6 text-sm"><p>¿Ya tienes sesión? Ve al <Link className="underline" href="/dashboard">Dashboard</Link>.</p></div>
      </div>
    </div>
  );
}

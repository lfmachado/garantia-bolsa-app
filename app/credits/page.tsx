'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Credit } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
export default function CreditsPage(){
  const [credits, setCredits] = useState<Credit[]>([]);
  useEffect(() => { supabase.from('credits').select('*').order('created_at', { ascending: false }).then(({data}) => setCredits(data||[])); }, []);
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Créditos</h1>
        <a className="btn btn-primary" href="/credits/new">Nuevo crédito</a>
      </div>
      <table className="table">
        <thead><tr><th>Cliente</th><th>Monto</th><th>Plazo</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {credits.map(c => (
            <tr key={c.id}>
              <td>{c.customer_name}</td><td>${c.amount.toLocaleString()}</td><td>{c.term_months} meses</td>
              <td><StatusBadge status={c.status}/></td><td><a className="underline" href={`/credits/${c.id}`}>Abrir</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

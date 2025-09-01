'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Credit } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
export default function Dashboard(){
  const [credits, setCredits] = useState<Credit[]>([]);
  const [saldo, setSaldo] = useState<number>(0);
  useEffect(() => {
    const load = async () => {
      const { data: creds } = await supabase.from('credits').select('*').order('created_at', { ascending: false }).limit(10);
      setCredits(creds ?? []);
      const { data: balance } = await supabase.from('pool_balance').select('*').maybeSingle();
      setSaldo(balance?.saldo ?? 0);
    }; load();
  }, []);
  const counts = credits.reduce((acc:any, c)=>{ acc[c.status]=(acc[c.status]||0)+1; return acc; }, {});
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><div className="text-sm text-gray-600">Saldo bolsa</div><div className="text-3xl font-bold">${saldo.toLocaleString()}</div></div>
        <div className="card"><div className="text-sm text-gray-600">Créditos recientes</div><div className="text-3xl font-bold">{credits.length}</div></div>
        <div className="card">
          <div className="text-sm text-gray-600">Estados (últimos)</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(counts).map(([k,v]) => (<span key={k} className="badge border-gray-300">{k}: {v as number}</span>))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Créditos</h2>
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
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
export default function ReportsPage(){
  const [rows, setRows] = useState<any[]>([]);
  const [saldo, setSaldo] = useState<any>(null);
  useEffect(() => {
    const load = async () => {
      const { data: credits } = await supabase.from('credits').select('*, products(name)');
      const { data: balance } = await supabase.from('pool_balance').select('*').maybeSingle();
      setRows(credits || []); setSaldo(balance || null);
    }; load();
  }, []);
  function exportCSV(){
    const headers = ['cliente','producto','monto','plazo_meses','estado','creado'];
    const lines = [headers.join(',')];
    rows.forEach((r:any) => {
      lines.push([`"${r.customer_name}"`,`"${r.products?.name || ''}"`,r.amount,r.term_months,r.status,r.created_at].join(','));
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'reporte_creditos.csv'; a.click(); URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="text-sm text-gray-600">Saldo bolsa</div>
        <div className="text-2xl font-bold">${(saldo?.saldo || 0).toLocaleString()}</div>
        <div className="text-sm text-gray-600 mt-1">Entradas: ${(saldo?.entradas || 0).toLocaleString()} — Salidas: ${(saldo?.salidas || 0).toLocaleString()}</div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold">Reporte de créditos</h1>
          <button className="btn btn-primary" onClick={exportCSV}>Exportar CSV</button>
        </div>
        <table className="table">
          <thead><tr><th>Cliente</th><th>Producto</th><th>Monto</th><th>Plazo</th><th>Estado</th><th>Creado</th></tr></thead>
          <tbody>
            {rows.map((r:any) => (
              <tr key={r.id}>
                <td>{r.customer_name}</td><td>{r.products?.name}</td><td>${r.amount.toLocaleString()}</td><td>{r.term_months}</td><td>{r.status}</td><td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

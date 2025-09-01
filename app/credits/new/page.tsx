'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
export default function NewCredit(){
  const [products, setProducts] = useState<any[]>([]);
  const [productId, setProductId] = useState('');
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [term, setTerm] = useState<number>(12);
  const [error, setError] = useState<string|null>(null);
  useEffect(() => { supabase.from('products').select('*').then(({data}) => setProducts(data||[])); }, []);
  async function onSubmit(e: React.FormEvent){
    e.preventDefault(); setError(null);
    if(!productId) { setError('Selecciona un producto'); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) { window.location.href = '/'; return; }
    const { error } = await supabase.from('credits').insert({ product_id: productId, customer_name: customer, amount, term_months: term, created_by: user.id });
    if (error) setError(error.message); else window.location.href = '/credits';
  }
  return (
    <div className="max-w-xl mx-auto card">
      <h1 className="text-xl font-semibold mb-3">Nuevo Crédito</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div><label className="label">Producto</label>
          <select className="input" value={productId} onChange={e=>setProductId(e.target.value)} required>
            <option value="">Selecciona</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div><label className="label">Cliente</label><input className="input" value={customer} onChange={e=>setCustomer(e.target.value)} required/></div>
        <div><label className="label">Monto</label><input type="number" className="input" step="0.01" value={amount} onChange={e=>setAmount(parseFloat(e.target.value))} required/></div>
        <div><label className="label">Plazo (meses)</label><input type="number" className="input" value={term} onChange={e=>setTerm(parseInt(e.target.value))} required/></div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="btn btn-primary">Guardar</button>
      </form>
    </div>
  );
}

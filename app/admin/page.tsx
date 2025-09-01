'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Product, ProductGuarantee } from '@/lib/types';
export default function Admin(){
  const [role, setRole] = useState<string|null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pgs, setPgs] = useState<ProductGuarantee[]>([]);
  const [name, setName] = useState(''); const [desc, setDesc] = useState('');
  const [productId, setProductId] = useState<string>(''); const [percent, setPercent] = useState<number>(0);
  useEffect(() => {
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/'; return; }

    // Lee rol por id, con fallback por email
    let { data: prof, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !prof) {
      const r = await supabase
        .from('profiles')
        .select('role')
        .eq('email', user.email)
        .maybeSingle();
      prof = r.data ?? null;
    }

    setRole(prof?.role || null);

    // Carga catálogos
    const { data: prods } = await supabase.from('products').select('*').order('created_at',{ascending:false});
    setProducts(prods || []);
    const { data: g } = await supabase.from('product_guarantees').select('*');
    setPgs(g || []);
  };
  load();
}, []);

  if (role !== 'admin') return <div className="card"><p>Solo <b>admin</b> puede acceder.</p></div>;
  async function addProduct(e: React.FormEvent){
    e.preventDefault();
    const { error } = await supabase.from('products').insert({ name, description: desc });
    if (!error) { setName(''); setDesc(''); const { data } = await supabase.from('products').select('*').order('created_at',{ascending:false}); setProducts(data||[]); }
  }
  async function addGuarantee(e: React.FormEvent){
    e.preventDefault();
    if(!productId) return;
    const { error } = await supabase.from('product_guarantees').insert({ product_id: productId, guarantee_percent: percent });
    if (!error) { setPercent(0); const { data } = await supabase.from('product_guarantees').select('*'); setPgs(data||[]); }
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Productos</h2>
        <form onSubmit={addProduct} className="space-y-2">
          <div><label className="label">Nombre</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div><label className="label">Descripción</label><input className="input" value={desc} onChange={e=>setDesc(e.target.value)}/></div>
          <button className="btn btn-primary">Agregar</button>
        </form>
        <ul className="mt-4 space-y-2">{products.map(p => <li key={p.id} className="border rounded-lg p-2"><b>{p.name}</b><div className="text-sm text-gray-600">{p.description}</div></li>)}</ul>
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">% Garantía por producto</h2>
        <form onSubmit={addGuarantee} className="space-y-2">
          <div><label className="label">Producto</label>
            <select className="input" value={productId} onChange={e=>setProductId(e.target.value)} required>
              <option value="">Selecciona</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="label">% Garantía</label><input type="number" className="input" step="0.01" value={percent} onChange={e=>setPercent(parseFloat(e.target.value))} required/></div>
          <button className="btn btn-primary">Guardar</button>
        </form>
        <table className="table mt-4"><thead><tr><th>Producto</th><th>%</th></tr></thead>
          <tbody>{pgs.map(g => { const prod = products.find(p=>p.id===g.product_id); return <tr key={g.id}><td>{prod?.name}</td><td>{g.guarantee_percent}%</td></tr>; })}</tbody>
        </table>
      </div>
    </div>
  );
}

'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import StatusBadge from '@/components/StatusBadge';
import UploadButton from '@/components/UploadButton';

export default function CreditDetail(){
  const params = useParams();
  const id = params?.id as string;
  const [credit, setCredit] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [pg, setPg] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fee = useMemo(() => {
    if (!credit || !pg) return 0;
    return Math.round((credit.amount * (pg.guarantee_percent/100)) * 100)/100;
  }, [credit, pg]);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) { window.location.href = '/'; return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      setRole(profile?.role || null);

      const { data: c } = await supabase.from('credits').select('*').eq('id', id).maybeSingle();
      setCredit(c);
      if (c) {
        const { data: p } = await supabase.from('products').select('*').eq('id', c.product_id).maybeSingle();
        setProduct(p);
        const { data: g } = await supabase.from('product_guarantees').select('*').eq('product_id', c.product_id).order('created_at', { ascending: false }).limit(1).maybeSingle();
        setPg(g);
        const { data: invs } = await supabase.from('invoices').select('*').eq('credit_id', id).order('created_at', { ascending: false });
        setInvoices(invs || []);
        const { data: pays } = await supabase.from('payments').select('*').eq('credit_id', id).order('created_at', { ascending: false });
        setPayments(pays || []);
        const { data: cds } = await supabase.from('claim_documents').select('*').eq('credit_id', id).order('created_at', { ascending: false });
        setClaims(cds || []);
      }
    };
    load();
  }, [id]);

  async function addEvent(event_type: string, details: any = {}){ await supabase.from('credit_events').insert({ credit_id: id, event_type, details }); }
  async function approve(){ await supabase.from('credits').update({ status: 'aprobado' }).eq('id', id); await addEvent('aprobacion'); setMsg('Crédito aprobado'); location.reload(); }
  async function generateInvoice(){
    const invoice_number = 'FAC-' + Math.random().toString(36).slice(2,8).toUpperCase();
    await supabase.from('invoices').insert({ credit_id: id, invoice_number, fee_amount: fee });
    await addEvent('generar_factura', { invoice_number, fee }); setMsg('Factura generada'); location.reload();
  }
  async function uploadPayment(supportUrl: string){ await supabase.from('payments').insert({ credit_id: id, amount: fee, support_file_url: supportUrl }); await addEvent('pago_registrado', { supportUrl }); setMsg('Pago cargado'); location.reload(); }
  async function validatePayment(paymentId: string){
    const { data: pay } = await supabase.from('payments').update({ validated: true, validated_at: new Date().toISOString() }).eq('id', paymentId).select('*').maybeSingle();
    await supabase.from('credits').update({ status: 'vigente' }).eq('id', id);
    await supabase.from('guarantee_pool_movements').insert({ movement_type: 'entrada', amount: pay?.amount ?? fee, credit_id: id, note: 'Pago garantía' });
    await addEvent('pago_validado', { paymentId }); setMsg('Pago validado. Crédito vigente'); location.reload();
  }
  async function markNovedad(){ await supabase.from('credits').update({ status: 'novedad' }).eq('id', id); await addEvent('novedad'); setMsg('Marcado como novedad'); location.reload(); }
  async function toReclamacion(){ await supabase.from('credits').update({ status: 'reclamacion' }).eq('id', id); await addEvent('a_reclamacion'); setMsg('En reclamación'); location.reload(); }
  async function uploadClaimDoc(url: string){ await supabase.from('claim_documents').insert({ credit_id: id, file_url: url }); await addEvent('doc_reclamacion', { url }); setMsg('Documento de reclamación cargado'); location.reload(); }
  async function validateClaim(){ await supabase.from('credits').update({ status: 'reclamado' }).eq('id', id); await addEvent('reclamacion_validada'); setMsg('Reclamación validada'); location.reload(); }
  async function payClaim(){
    const covered = Math.round((credit.amount * (pg?.guarantee_percent ?? 0) / 100) * 100)/100;
    await supabase.from('guarantee_pool_movements').insert({ movement_type: 'salida', amount: covered, credit_id: id, note: 'Pago cartera reclamada' });
    await supabase.from('credits').update({ status: 'pagado_reclamado' }).eq('id', id);
    await addEvent('pago_reclamado', { covered }); setMsg('Pago realizado y saldo actualizado'); location.reload();
  }

  if (!credit) return <div className="card"><p>Cargando...</p></div>;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Crédito de {credit.customer_name}</h1><StatusBadge status={credit.status}/></div>
        <div className="grid md:grid-cols-4 gap-4 mt-4">
          <div><div className="label">Producto</div><div>{product?.name}</div></div>
          <div><div className="label">Monto</div><div>${credit.amount?.toLocaleString()}</div></div>
          <div><div className="label">Plazo</div><div>{credit.term_months} meses</div></div>
          <div><div className="label">% Garantía</div><div>{pg?.guarantee_percent ?? '—'}%</div></div>
        </div>
        <div className="mt-4"><div className="label">Cuota de garantía estimada</div><div className="text-lg font-semibold">${fee.toLocaleString()}</div></div>
        {msg && <p className="text-green-700 mt-2">{msg}</p>}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-3">Flujo</h2>
          {credit.status === 'registrado' && (<button className="btn btn-primary" onClick={approve}>Aprobar registro</button>)}
          {credit.status === 'aprobado' && (<button className="btn btn-primary" onClick={generateInvoice}>Generar factura</button>)}
          {credit.status === 'aprobado' && invoices.length > 0 && (<div className="mt-4"><div className="label">Subir soporte de pago</div><UploadButton onUploaded={uploadPayment}/></div>)}
          {credit.status === 'aprobado' && payments.length > 0 && role === 'admin' && payments.some(p=>!p.validated) && (
            <div className="mt-4"><div className="label">Validar pago</div>{payments.filter(p=>!p.validated).map(p => (<button key={p.id} className="btn btn-primary mt-2" onClick={()=>validatePayment(p.id)}>Validar pago</button>))}</div>
          )}
          {credit.status === 'vigente' && (<div className="flex gap-2"><button className="btn" onClick={markNovedad}>Marcar Novedad</button><button className="btn btn-primary" onClick={toReclamacion}>Pasar a Reclamación</button></div>)}
          {credit.status === 'reclamacion' && (<div className="space-y-3"><div><div className="label">Subir documentos de reclamación</div><UploadButton onUploaded={uploadClaimDoc}/></div><button className="btn btn-primary" onClick={validateClaim}>Validar reclamación</button></div>)}
          {credit.status === 'reclamado' && role === 'admin' && (<button className="btn btn-primary" onClick={payClaim}>Pagar cartera reclamada</button>)}
        </div>
        <div className="space-y-6">
          <div className="card"><h3 className="font-semibold mb-2">Facturas</h3><ul className="text-sm">{invoices.map((i:any) => (<li key={i.id}>#{i.invoice_number} — ${i.fee_amount.toLocaleString()}</li>))}{invoices.length===0 && <li>No hay facturas</li>}</ul></div>
          <div className="card"><h3 className="font-semibold mb-2">Pagos</h3><ul className="text-sm space-y-1">{payments.map((p:any) => (<li key={p.id}>${p.amount.toLocaleString()} — {p.validated ? 'Validado' : 'Pendiente'} {p.support_file_url && <a className="underline ml-2" href={p.support_file_url} target="_blank">Ver soporte</a>}</li>))}{payments.length===0 && <li>No hay pagos</li>}</ul></div>
          <div className="card"><h3 className="font-semibold mb-2">Docs de Reclamación</h3><ul className="text-sm space-y-1">{claims.map((d:any) => (<li key={d.id}><a className="underline" href={d.file_url} target="_blank">Documento</a> — {d.validated ? 'Validado' : 'Pendiente'}</li>))}{claims.length===0 && <li>No hay documentos</li>}</ul></div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function UploadButton({ onUploaded }:{ onUploaded:(url:string)=>void }){
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function handleChange(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    if(!file) return;
    setBusy(true); setErr(null);
    try {
      const name = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('soportes').upload(name, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from('soportes').getPublicUrl(name);
      onUploaded(pub.publicUrl);
    } catch (e:any) { setErr(e.message ?? 'Error al subir'); }
    finally { setBusy(false); }
  }
  return (
    <div>
      <input type="file" onChange={handleChange} disabled={busy}/>
      {busy && <p className="text-sm text-gray-600 mt-1">Subiendo...</p>}
      {err && <p className="text-sm text-red-600 mt-1">{err}</p>}
    </div>
  );
}

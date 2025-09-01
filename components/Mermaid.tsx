'use client';
import mermaid from 'mermaid';
import { useEffect, useMemo } from 'react';

export default function MermaidComp({ chart }: { chart: string }) {
  const id = useMemo(() => 'mmd-' + Math.random().toString(36).slice(2), []);
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    const render = async () => {
      try {
        const { svg } = await mermaid.render(id, chart);
        const el = document.getElementById(id);
        if (el) el.innerHTML = svg;
      } catch (e) { console.error(e); }
    };
    render();
  }, [chart, id]);
  return <div className="card overflow-auto"><div id={id} /></div>;
}

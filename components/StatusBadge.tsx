import type { CreditStatus } from '@/lib/types';
export default function StatusBadge({ status }: { status: CreditStatus }){
  const cls = {
    registrado: 'status-registrado',
    aprobado: 'status-aprobado',
    vigente: 'status-vigente',
    novedad: 'status-novedad',
    reclamacion: 'status-reclamacion',
    reclamado: 'status-reclamado',
    pagado_reclamado: 'status-pagado_reclamado',
    rechazado: 'status-rechazado',
  }[status];
  return <span className={['badge', cls].join(' ')}>{status}</span>;
}

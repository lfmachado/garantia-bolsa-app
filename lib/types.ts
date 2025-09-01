export type Role = 'admin' | 'operador' | 'visor';
export type CreditStatus = 'registrado' | 'aprobado' | 'vigente' | 'novedad' | 'reclamacion' | 'reclamado' | 'pagado_reclamado' | 'rechazado';
export interface Profile { id: string; email: string; display_name: string | null; role: Role; }
export interface Product { id: string; name: string; description?: string | null; }
export interface ProductGuarantee { id: string; product_id: string; guarantee_percent: number; }
export interface Credit { id: string; product_id: string; customer_name: string; amount: number; term_months: number; status: CreditStatus; created_by: string | null; created_at: string; }
export interface Invoice { id: string; credit_id: string; invoice_number: string; fee_amount: number; created_at: string; }
export interface Payment { id: string; credit_id: string; amount: number; support_file_url?: string | null; validated: boolean; created_at: string; }
export interface ClaimDocument { id: string; credit_id: string; file_url: string; validated: boolean; created_at: string; }

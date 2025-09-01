create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
/* The same schema as described earlier; shortened to keep this step small */
do $$ begin
  create type public.credit_status as enum ('registrado','aprobado','vigente','novedad','reclamacion','reclamado','pagado_reclamado','rechazado');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.pool_movement_type as enum ('entrada','salida');
exception when duplicate_object then null; end $$;

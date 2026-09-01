-- Suma seguimiento de costo/ganancia (privado, solo admin)
-- Correr en Supabase -> SQL Editor -> New query -> Run

alter table notebooks
  add column if not exists costo numeric,
  add column if not exists precio_venta_final numeric,
  add column if not exists vendido_en timestamptz;

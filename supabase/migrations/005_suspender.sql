-- Suma estado "suspendida" (bajada de circulacion sin ser una venta)
-- Correr en Supabase -> SQL Editor -> New query -> Run

alter table notebooks
  add column if not exists suspendida boolean not null default false;

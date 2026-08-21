-- Agrega sistema operativo y estado de bateria a notebooks
-- Correr en Supabase -> SQL Editor -> New query -> Run

alter table notebooks
  add column if not exists sistema_operativo text not null default 'Windows 11',
  add column if not exists estado_bateria text not null default 'Buena';

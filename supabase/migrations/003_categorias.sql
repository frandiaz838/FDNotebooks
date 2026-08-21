-- Suma categorias (Notebook, PC de escritorio, Consola, Monitor, Otro)
-- Correr en Supabase -> SQL Editor -> New query -> Run

alter table notebooks
  add column if not exists categoria text not null default 'Notebook',
  add column if not exists placa_video text not null default '',
  add column if not exists joysticks_incluidos text not null default '',
  add column if not exists juegos_incluidos text not null default '',
  add column if not exists tasa_refresco text not null default '',
  add column if not exists tipo_panel text not null default '';

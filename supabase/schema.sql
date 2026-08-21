-- FD Notebooks: schema inicial
-- Correr esto una sola vez en Supabase -> SQL Editor -> New query -> Run

create extension if not exists "pgcrypto";

create table if not exists notebooks (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  marca text not null,
  modelo text not null default '',
  procesador text not null default '',
  ram text not null default '',
  almacenamiento text not null default '',
  pantalla text not null default '',
  estado_estetico text not null default 'Bueno - con detalles',
  precio numeric not null,
  moneda text not null default 'ARS',
  descripcion text,
  fotos text[] not null default '{}',
  disponible boolean not null default true,
  destacado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table notebooks enable row level security;

-- El catalogo publico solo puede leer notebooks disponibles.
create policy "Notebooks disponibles son publicas"
  on notebooks for select
  using (disponible = true);

-- Las mutaciones (insert/update/delete) y la lectura de vendidas
-- pasan siempre por las API routes del admin, que usan la service_role key
-- y por lo tanto no estan sujetas a estas policies.

-- Bucket publico para las fotos de las notebooks.
insert into storage.buckets (id, name, public)
values ('notebook-photos', 'notebook-photos', true)
on conflict (id) do nothing;

create policy "Fotos de notebooks son publicas para lectura"
  on storage.objects for select
  using (bucket_id = 'notebook-photos');

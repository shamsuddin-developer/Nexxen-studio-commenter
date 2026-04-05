-- ============================================
-- MarkUp App -- Supabase Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates all the tables needed for the app.

-- 1. Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password text not null,
  role text default 'user',
  created_at timestamptz default now()
);

-- 2. Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  type text default 'url',
  image_data text,
  owner_id uuid references users(id) on delete set null,
  owner_name text,
  feedback_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Members table (who has access to which project)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  name text,
  email text,
  role text default 'viewer',
  token text unique default gen_random_uuid()::text,
  added_at timestamptz default now()
);

-- 4. Pins table (feedback markers on the canvas)
create table if not exists pins (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  x float not null,
  y float not null,
  status text default 'open',
  screenshot text,
  device text,
  created_at timestamptz default now()
);

-- 5. Comments table (threaded replies on each pin)
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  pin_id uuid references pins(id) on delete cascade,
  author text not null,
  body text not null,
  created_at timestamptz default now()
);

-- ============================================
-- Indexes for performance
-- ============================================
create index if not exists idx_projects_owner on projects(owner_id);
create index if not exists idx_members_project on members(project_id);
create index if not exists idx_members_email on members(email);
create index if not exists idx_members_token on members(token);
create index if not exists idx_members_user on members(user_id);
create index if not exists idx_pins_project on pins(project_id);
create index if not exists idx_comments_pin on comments(pin_id);

-- ============================================
-- Disable RLS (simple setup for private tool)
-- Enable RLS later if you need multi-tenant security
-- ============================================
alter table users enable row level security;
alter table projects enable row level security;
alter table members enable row level security;
alter table pins enable row level security;
alter table comments enable row level security;

-- Allow full access via anon key (for a private tool)
create policy "Allow all on users" on users for all using (true) with check (true);
create policy "Allow all on projects" on projects for all using (true) with check (true);
create policy "Allow all on members" on members for all using (true) with check (true);
create policy "Allow all on pins" on pins for all using (true) with check (true);
create policy "Allow all on comments" on comments for all using (true) with check (true);

-- ============================================
-- Seed the admin account
-- ============================================
insert into users (name, email, password, role)
values ('Nexxen Studio', 'admin@nexxenstudio.com', 'Nexxen@2026!', 'superadmin')
on conflict (email) do nothing;

-- Nexxen Commenter v2 -- Supabase Schema
-- Run in: Dashboard > SQL Editor > New Query

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text unique not null,
  password text not null, role text default 'user',
  created_at timestamptz default now()
);
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null, url text, type text default 'url',
  image_data text, thumbnail text,
  owner_id uuid references users(id) on delete set null,
  owner_name text, feedback_count int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  name text, email text, role text default 'viewer',
  token text unique default gen_random_uuid()::text,
  added_at timestamptz default now()
);
create table if not exists pins (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  x float not null, y float not null,
  status text default 'open', priority text default 'medium',
  screenshot text, device text default 'desktop',
  created_at timestamptz default now()
);
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  pin_id uuid references pins(id) on delete cascade,
  author text not null, body text not null,
  attachment_name text, attachment_data text, attachment_type text,
  created_at timestamptz default now()
);
create index if not exists idx_pins_project on pins(project_id);
create index if not exists idx_pins_device on pins(device);
create index if not exists idx_comments_pin on comments(pin_id);
create index if not exists idx_members_project on members(project_id);
create index if not exists idx_members_token on members(token);
alter table users enable row level security;
alter table projects enable row level security;
alter table members enable row level security;
alter table pins enable row level security;
alter table comments enable row level security;
create policy "open_users" on users for all using (true) with check (true);
create policy "open_projects" on projects for all using (true) with check (true);
create policy "open_members" on members for all using (true) with check (true);
create policy "open_pins" on pins for all using (true) with check (true);
create policy "open_comments" on comments for all using (true) with check (true);
insert into users (name,email,password,role) values ('Nexxen Studio','admin@nexxenstudio.com','Nexxen@2026!','superadmin') on conflict (email) do nothing;

-- UPGRADE from v1 (run these if tables already exist):
-- ALTER TABLE pins ADD COLUMN IF NOT EXISTS priority text default 'medium';
-- ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail text;
-- ALTER TABLE comments ADD COLUMN IF NOT EXISTS attachment_name text;
-- ALTER TABLE comments ADD COLUMN IF NOT EXISTS attachment_data text;
-- ALTER TABLE comments ADD COLUMN IF NOT EXISTS attachment_type text;

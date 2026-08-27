-- Fleet management: organizations, users, drivers, buses

create table if not exists organizations (
  id text primary key,
  name text not null,
  type text not null check (type in ('school', 'travel', 'fleet', 'other')),
  created_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  mobile text not null,
  designation text not null check (
    designation in ('transport_admin', 'fleet_manager', 'owner')
  ),
  password_hash text not null,
  role text not null default 'admin' check (role in ('admin')),
  email_verified boolean not null default false,
  verification_token text,
  verification_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists users_org_id_idx on users(org_id);
create index if not exists users_verification_token_idx on users(verification_token);

create table if not exists drivers (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  name text not null,
  license text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

create index if not exists drivers_org_id_idx on drivers(org_id);

create table if not exists buses (
  id text primary key,
  org_id text not null references organizations(id) on delete cascade,
  code text not null,
  plate text not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now(),
  unique (org_id, code)
);

create index if not exists buses_org_id_idx on buses(org_id);

alter table organizations enable row level security;
alter table users enable row level security;
alter table drivers enable row level security;
alter table buses enable row level security;

-- Prefer connecting the API with SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
-- Do not add open anon policies in production.

-- =============================================
-- Gimme Golf — Initial Schema
-- =============================================

-- Customers
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  created_at timestamptz not null default now()
);

-- Memberships
create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null check (type in ('walkin', 'punchpass', 'monthly', 'annual')),
  sessions_remaining integer,
  start_date date not null default current_date,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  location text not null check (location in ('kaysville', 'clearfield')),
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_hours numeric(4,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text,
  stripe_payment_id text,
  created_at timestamptz not null default now()
);

-- Locations
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  keybox_code text,
  youtube_url text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_memberships_customer on memberships(customer_id);
create index if not exists idx_bookings_customer on bookings(customer_id);
create index if not exists idx_bookings_location_time on bookings(location, start_time);
create index if not exists idx_customers_email on customers(email);

-- Quotes table
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null,
  client_name text not null,
  client_email text,
  client_phone text,
  client_address text,
  line_items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  deposit_amount numeric(10,2) not null default 0,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'accepted-pending', 'paid')),
  signature_name text,
  signed_at timestamptz,
  payment_method text,
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists idx_quotes_status on quotes(status);
create index if not exists idx_quotes_number on quotes(quote_number);

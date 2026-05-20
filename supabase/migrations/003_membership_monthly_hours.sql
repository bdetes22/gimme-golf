-- Add monthly hours tracking columns to memberships
alter table memberships add column if not exists hours_used_this_month integer not null default 0;
alter table memberships add column if not exists hours_reset_date date;

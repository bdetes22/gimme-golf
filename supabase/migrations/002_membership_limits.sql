-- Add tracking columns to memberships for booking limits
alter table memberships add column if not exists sessions_used_this_week integer not null default 0;
alter table memberships add column if not exists last_booking_date date;
alter table memberships add column if not exists week_reset_date date;

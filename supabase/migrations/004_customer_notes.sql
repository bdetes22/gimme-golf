-- Add notes column to customers table
alter table customers add column if not exists notes text;

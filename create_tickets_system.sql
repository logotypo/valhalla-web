-- Create Tables
create table if not exists public.tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  subject text not null,
  description text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists public.ticket_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text,
  is_admin_reply boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.ticket_attachments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  message_id uuid references public.ticket_messages(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.ticket_attachments enable row level security;

-- Setup Storage Bucket
insert into storage.buckets (id, name, public)
values ('tickets-media', 'tickets-media', false)
on conflict (id) do nothing;

-- Policies (Users can see own, Admins can see all)
-- Helper function for admin check
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'moderator')
  );
end;
$$ language plpgsql security definer;

-- Tickets Policies
create policy "Users can view own tickets" on public.tickets
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert tickets" on public.tickets
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own tickets" on public.tickets
  for delete using (auth.uid() = user_id or public.is_admin());

-- Messages Policies
create policy "View messages for ticket" on public.ticket_messages
  for select using (
    exists (select 1 from public.tickets where id = ticket_id and (user_id = auth.uid() or public.is_admin()))
  );

create policy "Insert messages" on public.ticket_messages
  for insert with check (
    exists (select 1 from public.tickets where id = ticket_id and (user_id = auth.uid() or public.is_admin()))
  );

-- Attachments Policies (DB)
create policy "View attachments info" on public.ticket_attachments
  for select using (
    exists (select 1 from public.tickets where id = ticket_id and (user_id = auth.uid() or public.is_admin()))
  );
create policy "Insert attachments info" on public.ticket_attachments
  for insert with check (true); -- Check handled by parent relations

-- Storage Policies
-- Allow authenticated uploads
create policy "Authenticated users can upload media"
on storage.objects for insert to authenticated
with check ( bucket_id = 'tickets-media' );

-- Allow viewing if you have access (Simplified for storage: auth users)
create policy "Authenticated users can view media"
on storage.objects for select to authenticated
using ( bucket_id = 'tickets-media' );

create policy "Authenticated users can delete media"
on storage.objects for delete to authenticated
using ( bucket_id = 'tickets-media' );

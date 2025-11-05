-- Create role enum
create type public.app_role as enum ('user', 'admin');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Create function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create buses table
create table public.buses (
  id uuid primary key default gen_random_uuid(),
  bus_number text not null unique,
  bus_name text not null,
  source text not null,
  destination text not null,
  departure_time time not null,
  arrival_time time not null,
  total_seats integer not null default 40,
  available_seats integer not null default 40,
  fare decimal(10,2) not null,
  travel_date date not null,
  created_at timestamp with time zone default now(),
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.buses enable row level security;

create policy "Anyone can view buses"
  on public.buses for select
  using (true);

create policy "Admins can insert buses"
  on public.buses for insert
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update buses"
  on public.buses for update
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete buses"
  on public.buses for delete
  using (public.has_role(auth.uid(), 'admin'));

-- Create bookings table
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  bus_id uuid references public.buses(id) on delete cascade not null,
  seat_numbers text[] not null,
  total_fare decimal(10,2) not null,
  booking_date timestamp with time zone default now(),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  passenger_name text not null,
  passenger_phone text not null,
  passenger_email text not null
);

alter table public.bookings enable row level security;

create policy "Users can view own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Admins can view all bookings"
  on public.bookings for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can insert own bookings"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bookings"
  on public.bookings for update
  using (auth.uid() = user_id);

-- Create function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'User'));
  
  -- Assign default user role
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create function to update available seats after booking
create or replace function public.update_available_seats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and (old is null or old.status = 'cancelled') then
    update public.buses
    set available_seats = available_seats - array_length(new.seat_numbers, 1)
    where id = new.bus_id;
  elsif new.status = 'cancelled' and old.status = 'confirmed' then
    update public.buses
    set available_seats = available_seats + array_length(new.seat_numbers, 1)
    where id = new.bus_id;
  end if;
  return new;
end;
$$;

create trigger on_booking_status_change
  after insert or update on public.bookings
  for each row execute function public.update_available_seats();
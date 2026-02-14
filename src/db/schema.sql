
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  shop_name text,
  business_type text,
  full_name text,
  avatar_url text,
  website text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create products table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text,
  price numeric,
  cost numeric default 0,
  stock integer default 0,
  reorder_level integer default 5,
  supplier_id uuid, -- simple reference, foreign key optional if suppliers are strictly linked
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create suppliers table
create table if not exists suppliers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  contact text,
  email text,
  products_supplied text[], -- array of strings or references
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create sales table
create table if not exists sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references products(id),
  product_name text, -- Denormalized for easier querying if product deleted
  quantity integer not null,
  total_price numeric not null,
  date timestamp with time zone default timezone('utc'::text, now())
);


-- Row Level Security (RLS)
-- Enable RLS
alter table profiles enable row level security;
alter table products enable row level security;
alter table suppliers enable row level security;
alter table sales enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Policies for Products
create policy "Users can view own products" on products for select using (auth.uid() = user_id);
create policy "Users can insert own products" on products for insert with check (auth.uid() = user_id);
create policy "Users can update own products" on products for update using (auth.uid() = user_id);
create policy "Users can delete own products" on products for delete using (auth.uid() = user_id);

-- Policies for Suppliers
create policy "Users can view own suppliers" on suppliers for select using (auth.uid() = user_id);
create policy "Users can insert own suppliers" on suppliers for insert with check (auth.uid() = user_id);
create policy "Users can update own suppliers" on suppliers for update using (auth.uid() = user_id);
create policy "Users can delete own suppliers" on suppliers for delete using (auth.uid() = user_id);

-- Policies for Sales
create policy "Users can view own sales" on sales for select using (auth.uid() = user_id);
create policy "Users can insert own sales" on sales for insert with check (auth.uid() = user_id);
create policy "Users can update own sales" on sales for update using (auth.uid() = user_id);
create policy "Users can delete own sales" on sales for delete using (auth.uid() = user_id);

-- Handle New User Signup (Trigger to create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, shop_name, business_type)
  values (new.id, new.raw_user_meta_data->>'shop_name', new.raw_user_meta_data->>'business_type');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

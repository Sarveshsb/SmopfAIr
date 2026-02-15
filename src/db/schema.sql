-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
-- Matches Profile.tsx and SetupFlow.tsx
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  middle_name text,
  last_name text,
  shop_name text,
  business_type text, -- 'textile', 'grocery', etc.
  age integer,
  phone_number text,
  email text,
  avatar_url text, -- Stores the image URL or base64 string (though URL is recommended)
  currency text default 'INR',
  language text default 'English',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create products table
-- Matches ProductManagement.tsx
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_name text not null,
  category text default 'General',
  quantity_on_hand numeric default 0, -- Supports fractional units like kg/ltr
  quantity_unit text default 'pieces', -- 'pieces', 'kg', 'g', 'ltr'
  selling_price numeric default 0,
  current_cost_price numeric default 0,
  discount_percentage numeric default 0,
  reorder_level numeric default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create suppliers table
-- Matches SupplierManagement.tsx
create table if not exists suppliers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  supplier_name text not null,
  contact_person text,
  phone_number text,
  email text,
  location text,
  reliability_score integer default 5, -- 1-10 scale
  quality_rating integer default 5, -- 1-10 scale
  average_delivery_days integer default 3,
  notes text,
  product_ids text[], -- Array of product UUIDs supplied by this vendor
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create sales table
-- Designed for SalesTracking.tsx (implied structure + analytics needs)
create table if not exists sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id uuid references products(id) on delete set null,
  product_name text, -- Denormalized in case product is deleted
  quantity numeric not null,
  total_price numeric not null,
  profit numeric, -- Calculated as (selling_price - cost_price) * quantity
  payment_method text default 'cash', -- 'cash', 'upi', 'card', etc.
  date timestamp with time zone default timezone('utc'::text, now())
);

-- Create expenses table
-- Matches ExpenseTracking.tsx
create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null, -- 'Rent', 'Electricity', 'Staff Wages', etc.
  amount numeric not null,
  description text,
  date timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS)
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table products enable row level security;
alter table suppliers enable row level security;
alter table sales enable row level security;
alter table expenses enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

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

-- Policies for Expenses
create policy "Users can view own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on expenses for delete using (auth.uid() = user_id);

-- Handle New User Signup (Trigger to create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, shop_name, business_type, first_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'shop_name',
    new.raw_user_meta_data->>'business_type',
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger (drop if exists to avoid conflicts during updates)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

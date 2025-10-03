# ORK — React + Supabase (OKR cơ bản)

## Cấu hình Supabase và bảng OKR

1) Tạo dự án trên Supabase và lấy `Project URL` & `anon key`.

2) Tạo file `.env` tại thư mục gốc với nội dung:

```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3) Tạo bảng bằng SQL trong Supabase (SQL Editor):

```sql
-- Bảng Objectives
create table if not exists public.objectives (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner text,
  created_at timestamp with time zone default now()
);

-- Bảng Key Results
create table if not exists public.key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.objectives(id) on delete cascade,
  title text not null,
  target_value numeric,
  created_at timestamp with time zone default now()
);

-- Policies (RLS)
alter table public.objectives enable row level security;
alter table public.key_results enable row level security;

-- Chính sách đơn giản cho demo: cho phép đọc/ghi công khai (chỉ dùng dev)
create policy "Allow read objectives" on public.objectives for select using (true);
create policy "Allow insert objectives" on public.objectives for insert with check (true);

create policy "Allow read key_results" on public.key_results for select using (true);
create policy "Allow insert key_results" on public.key_results for insert with check (true);
```

Lưu ý: Trong sản xuất, hãy cấu hình chính sách RLS an toàn hơn theo người dùng đăng nhập.

4) Chạy dự án:

```
npm run dev
```

Trang OKR cơ bản ở `src/pages/OKR.jsx`, client Supabase ở `src/lib/supabaseClient.js`.

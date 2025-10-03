import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase client bằng biến môi trường Vite
// Đảm bảo tạo file .env và đặt: VITE_SUPABASE_URL=..., VITE_SUPABASE_ANON_KEY=...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Không throw để app vẫn render, nhưng log cảnh báo cho developer
  // Bạn nên cấu hình .env trước khi gọi API Supabase
  console.warn('Thiếu cấu hình Supabase: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')



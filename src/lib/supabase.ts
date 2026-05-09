import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string | undefined;

const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase env belum diset. Isi SUPABASE_URL dan KEY (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY atau NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

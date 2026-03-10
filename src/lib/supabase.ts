import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbucajvqjrnnsbnsunsp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidWNhanZxanJubnNibnN1bnNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNDI5NjAsImV4cCI6MjA4ODcxODk2MH0.0qvv3pCBgvuLLm0OKckVnTGAuerznbJMFgiHpLbqTCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

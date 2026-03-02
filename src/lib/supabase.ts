import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzynoyowxfhgntlawgrq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eW5veW94ZmhnbnRsYXdncnEiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTUwMDAwMCwiZXhwIjoxOTYxMDc2MDAwfQ.xnE94Nqe3Q0J6dK-9N5u9w6f2t3w5v7c9B4dK8mX2pY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get environment info
export const getSupabaseEnv = () => ({
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
});

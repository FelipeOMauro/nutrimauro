import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdlvjozjlfetfsnziaps.supabase.co';
const supabaseAnonKey = 'sb_publishable_vOzwIa1aCZAtUDVPzNTzcw_g51xeGbr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

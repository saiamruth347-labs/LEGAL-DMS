const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://gkysggdvsaxkefcbsylv.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_jkaSdAOuf1kmKZsPyUmybw_A_apOB0W';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = { supabase };

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://giffbduqzttabkuaqfdy.supabase.co'; // Replace with your URL
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpZmZiZHVxenR0YWJrdWFxZmR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTg1NTUsImV4cCI6MjA3MTQzNDU1NX0.tpuM4wWOKKxXN0SONUtQHLw5XS7U4mCm7pxAjDamYTs'; // Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

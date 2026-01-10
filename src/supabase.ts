import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajafhmoptknlpuzjpamq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYWZobW9wdGtubHB1empwYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTExMDgsImV4cCI6MjA4MzU4NzEwOH0.wdeqlk6PXtj7ezPkgXUDqU_RFpq9uwY4FHzx9jb3eVU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

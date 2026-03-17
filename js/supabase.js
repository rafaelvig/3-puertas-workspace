const SUPABASE_URL = "https://vjwxkruczzjnkzfjgrba.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqd3hrcnVjenpqbmt6ZmpncmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzQ4MzUsImV4cCI6MjA4NTcxMDgzNX0.8y621Ls7hTiva2zihhOXqlAiIo7omcd73-RWO73FYAs";

window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

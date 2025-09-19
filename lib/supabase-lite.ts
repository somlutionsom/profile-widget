import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkdcoomemfowhehlzlpn.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZGNvb21lbWZvd2hlaGx6bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDQwMjksImV4cCI6MjA3MTYyMDAyOX0.AkohCnOBIsmxMEyyzG9bOWYuPGh08HEF3RzNAs1Xuvo'

// Minimal Supabase client configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Disable for performance
    persistSession: true,
    detectSessionInUrl: false
  }
})

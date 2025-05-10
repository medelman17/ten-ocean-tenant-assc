import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Creates a Supabase client with service role for background tasks like Inngest functions
 * This doesn't rely on cookies since it's used in a server environment only
 */
export function createServiceClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
}
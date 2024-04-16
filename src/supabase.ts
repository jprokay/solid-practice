import { createClient } from "@supabase/supabase-js";
import { Database } from "./types/supabase";

const supabase = createClient<Database>(
  "https://supa.api.test",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
);

export default supabase;

import { createServerSupabaseClient } from "@/lib/supabase-client"

export async function checkSupabaseConnection() {
  try {
    const supabase = createServerSupabaseClient()

    // Simple query to check connection
    const { data, error } = await supabase.from("matchmaking").select("count(*)", { count: "exact", head: true })

    if (error) {
      console.error("Supabase connection error:", error)
      return {
        success: false,
        message: `Connection error: ${error.message}`,
        error,
      }
    }

    return {
      success: true,
      message: "Successfully connected to Supabase",
      count: data,
    }
  } catch (error) {
    console.error("Unexpected error checking Supabase connection:", error)
    return {
      success: false,
      message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      error,
    }
  }
}

import { createServerSupabaseClient, supabase } from "./supabase-client"

export async function checkSupabaseConnection() {
  try {
    // Test client-side connection
    const { data: clientData, error: clientError } = await supabase
      .from("matchmaking")
      .select("count()", { count: "exact", head: true })

    // Test server-side connection
    const serverClient = createServerSupabaseClient()
    const { data: serverData, error: serverError } = await serverClient
      .from("matchmaking")
      .select("count()", { count: "exact", head: true })

    return {
      success: !clientError && !serverError,
      clientConnection: {
        success: !clientError,
        error: clientError ? clientError.message : null,
        data: clientData,
      },
      serverConnection: {
        success: !serverError,
        error: serverError ? serverError.message : null,
        data: serverData,
      },
      environmentVariables: {
        clientUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        serverUrl: process.env.SUPABASE_URL ? "Set" : "Not set",
        clientKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        serverKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      environmentVariables: {
        clientUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        serverUrl: process.env.SUPABASE_URL ? "Set" : "Not set",
        clientKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        serverKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Not set",
      },
    }
  }
}

// Function to test matchmaking table operations
export async function testMatchmakingTable() {
  try {
    const serverClient = createServerSupabaseClient()

    // Test user ID for testing
    const testUserId = `test-user-${Date.now()}`

    // Test insertion
    const { data: insertData, error: insertError } = await serverClient
      .from("matchmaking")
      .insert({
        user_id: testUserId,
        has_video: true,
        status: "waiting",
      })
      .select()
      .single()

    if (insertError) {
      return {
        success: false,
        operation: "insert",
        error: insertError.message,
      }
    }

    // Test selection
    const { data: selectData, error: selectError } = await serverClient
      .from("matchmaking")
      .select("*")
      .eq("user_id", testUserId)
      .single()

    if (selectError) {
      return {
        success: false,
        operation: "select",
        error: selectError.message,
      }
    }

    // Test deletion (cleanup)
    const { error: deleteError } = await serverClient.from("matchmaking").delete().eq("user_id", testUserId)

    if (deleteError) {
      return {
        success: false,
        operation: "delete",
        error: deleteError.message,
      }
    }

    return {
      success: true,
      message: "All matchmaking table operations successful",
      testData: {
        inserted: insertData,
        selected: selectData,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

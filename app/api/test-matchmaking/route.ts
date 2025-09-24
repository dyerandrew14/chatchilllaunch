import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-client"
import { checkSupabaseConnection } from "@/lib/supabase-check"

export async function GET() {
  try {
    // Check Supabase connection
    const connectionCheck = await checkSupabaseConnection()
    if (!connectionCheck.success) {
      return NextResponse.json(connectionCheck, { status: 500 })
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient()

    // Get environment variables (masked for security)
    const envInfo = {
      supabaseUrl: process.env.SUPABASE_URL ? "✓ Set" : "✗ Not set",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Not set",
      publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Not set",
      publicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Not set",
    }

    // Get table info
    const { data: tableInfo, error: tableError } = await supabase
      .from("matchmaking")
      .select("count(*)", { count: "exact", head: true })

    if (tableError) {
      return NextResponse.json(
        {
          success: false,
          message: `Error querying matchmaking table: ${tableError.message}`,
          envInfo,
        },
        { status: 500 },
      )
    }

    // Test insert
    const testUserId = `test-user-${Date.now()}`
    const { error: insertError } = await supabase.from("matchmaking").insert({
      user_id: testUserId,
      has_video: true,
      status: "waiting",
      room_id: null,
    })

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          message: `Error inserting test record: ${insertError.message}`,
          envInfo,
        },
        { status: 500 },
      )
    }

    // Clean up test data
    await supabase.from("matchmaking").delete().eq("user_id", testUserId)

    return NextResponse.json({
      success: true,
      message: "Matchmaking table is accessible and working correctly",
      envInfo,
      tableInfo,
    })
  } catch (error) {
    console.error("Error in test-matchmaking API:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    )
  }
}

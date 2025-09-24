import { NextResponse } from "next/server"
import { checkSupabaseConnection, testMatchmakingTable } from "@/lib/supabase-utils"

export async function GET() {
  try {
    // Check Supabase connection
    const connectionStatus = await checkSupabaseConnection()

    // Test matchmaking table operations
    const tableTest = await testMatchmakingTable()

    return NextResponse.json({
      success: connectionStatus.success && tableTest.success,
      connectionStatus,
      tableTest,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

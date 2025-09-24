import { supabase } from "./supabase-client"

export async function getAuthenticatedUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting authenticated user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Unexpected error getting authenticated user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getAuthenticatedUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function isAuthenticated() {
  const user = await getAuthenticatedUser()
  return !!user
}

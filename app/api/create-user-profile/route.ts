import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "User ID and email are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("app_user").select("user_id").eq("user_id", userId).single()

    if (existingUser) {
      return NextResponse.json({ success: true, message: "User already exists" })
    }

    // Create user profile with server-side client (bypasses RLS)
    const { error } = await supabase.from("app_user").insert({
      user_id: userId,
      user_name: name || email.split("@")[0],
      user_email: email,
      user_cart: [],
      user_wish_list: [],
      user_role: "customer",
    })

    if (error) {
      console.error("Error creating user profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

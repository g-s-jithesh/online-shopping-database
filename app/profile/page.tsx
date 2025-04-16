import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfileForm from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/profile")
  }

  const { data: user } = await supabase.from("app_user").select("*").eq("user_id", session.user.id).single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="max-w-2xl mx-auto">
        <ProfileForm user={user} />
      </div>
    </div>
  )
}

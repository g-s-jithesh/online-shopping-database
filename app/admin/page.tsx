import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/dashboard"

export default async function AdminPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/admin")
  }

  const { data: user } = await supabase.from("app_user").select("*").eq("user_id", session.user.id).single()

  if (user?.user_role !== "admin") {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <AdminDashboard />
    </div>
  )
}

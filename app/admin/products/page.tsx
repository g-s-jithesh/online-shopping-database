import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminProductList from "@/components/admin/product-list"

export default async function AdminProductsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/admin/products")
  }

  const { data: user } = await supabase.from("app_user").select("*").eq("user_id", session.user.id).single()

  if (user?.user_role !== "admin") {
    redirect("/")
  }

  const { data: products } = await supabase.from("product_master").select("*").order("product_no", { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      <AdminProductList products={products || []} />
    </div>
  )
}

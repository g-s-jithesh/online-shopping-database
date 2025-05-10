import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OrderList from "@/components/order-list"

export default async function OrdersPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/orders")
  }

  const { data: orders } = await supabase
    .from("sales_order")
    .select(`
      *,
      sales_order_details(
        *,
        product_master(*)
      )
    `)
    .eq("user_id", session.user.id)
    .order("order_date", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
          <p className="mb-6">You haven't placed any orders yet.</p>
          <a href="/products" className="inline-block bg-primary text-white px-6 py-3 rounded-md">
            Start Shopping
          </a>
        </div>
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  )
}

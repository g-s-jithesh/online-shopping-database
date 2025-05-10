import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"

export default async function CheckoutPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/checkout")
  }

  const { data: user } = await supabase.from("app_user").select("*").eq("user_id", session.user.id).single()

  const cartItems = user?.user_cart || []

  if (cartItems.length === 0) {
    redirect("/cart")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm user={user} />
        </div>
        <div>
          <OrderSummary items={cartItems} />
        </div>
      </div>
    </div>
  )
}

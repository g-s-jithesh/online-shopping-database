import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CartItems from "@/components/cart-items"
import CartSummary from "@/components/cart-summary"

export default async function CartPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/cart")
  }

  const { data: user } = await supabase.from("app_user").select("*").eq("user_id", session.user.id).single()

  const cartItems = user?.user_cart || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="mb-6">Looks like you haven't added any products to your cart yet.</p>
          <a href="/products" className="inline-block bg-primary text-white px-6 py-3 rounded-md">
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems items={cartItems} />
          </div>
          <div>
            <CartSummary items={cartItems} />
          </div>
        </div>
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import WishlistItems from "@/components/wishlist-items"

export default async function WishlistPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/wishlist")
  }

  const { data: user } = await supabase.from("app_user").select("*").eq("user_id", session.user.id).single()

  const wishlistItems = user?.user_wish_list || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
          <p className="mb-6">Save items you like to your wishlist and they'll appear here.</p>
          <a href="/products" className="inline-block bg-primary text-white px-6 py-3 rounded-md">
            Browse Products
          </a>
        </div>
      ) : (
        <WishlistItems items={wishlistItems} />
      )}
    </div>
  )
}

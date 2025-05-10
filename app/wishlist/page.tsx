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

  // Check if user profile exists
  const { data: userData, error: userError } = await supabase
    .from("app_user")
    .select("*")
    .eq("user_id", session.user.id)

  if (userError) {
    console.error("Error fetching user:", userError)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Error loading wishlist</h2>
          <p className="mb-6">There was a problem loading your wishlist. Please try again later.</p>
        </div>
      </div>
    )
  }

  let wishlistItems: any[] = []

  // If no user profile, create one
  if (!userData || userData.length === 0) {
    // Create user profile server-side
    const { data: newUser, error: createError } = await supabase
      .from("app_user")
      .insert({
        user_id: session.user.id,
        user_name: session.user.email?.split("@")[0] || "",
        user_email: session.user.email,
        user_cart: [],
        user_wish_list: [],
        user_role: "customer",
      })
      .select("*")

    if (createError) {
      console.error("Error creating user:", createError)
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Error loading wishlist</h2>
            <p className="mb-6">There was a problem setting up your account. Please try again later.</p>
          </div>
        </div>
      )
    }

    const user = newUser[0]
    wishlistItems = user?.user_wish_list || []
  } else {
    const user = userData[0]
    wishlistItems = user?.user_wish_list || []
  }

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

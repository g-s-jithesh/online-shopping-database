"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "./supabase-provider"
import { useRouter } from "next/navigation"

interface WishlistItem {
  product_no: number
  p_description: string
  product_price: number
  product_image?: string
}

interface WishlistItemsProps {
  items: WishlistItem[]
}

export default function WishlistItems({ items }: WishlistItemsProps) {
  const { user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const removeItem = async (productNo: number) => {
    if (!user) return

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const updatedItems = items.filter((item) => item.product_no !== productNo)

      const { error } = await supabase.from("app_user").update({ user_wish_list: updatedItems }).eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Item removed",
        description: "The item has been removed from your wishlist.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from wishlist.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const moveToCart = async (item: WishlistItem) => {
    if (!user) return

    setIsUpdating(true)

    try {
      const supabase = createClient()

      // Get current cart
      const { data: userData, error: userError } = await supabase
        .from("app_user")
        .select("user_cart, user_wish_list")
        .eq("user_id", user.id)
        .single()

      if (userError) throw userError

      const currentCart = userData.user_cart || []

      // Check if product already in cart
      const existingItemIndex = currentCart.findIndex((cartItem: any) => cartItem.product_no === item.product_no)

      let newCart

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        newCart = [...currentCart]
        newCart[existingItemIndex].quantity += 1
      } else {
        // Add new product to cart
        newCart = [
          ...currentCart,
          {
            ...item,
            quantity: 1,
          },
        ]
      }

      // Remove from wishlist
      const newWishlist = userData.user_wish_list.filter((wishItem: any) => wishItem.product_no !== item.product_no)

      // Update user data
      const { error: updateError } = await supabase
        .from("app_user")
        .update({
          user_cart: newCart,
          user_wish_list: newWishlist,
        })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      toast({
        title: "Added to cart",
        description: `${item.p_description} has been moved to your cart.`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to move item to cart.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.product_no} className="border rounded-lg overflow-hidden">
          <div className="relative aspect-square bg-muted">
            {item.product_image ? (
              <Image
                src={item.product_image || "/placeholder.svg"}
                alt={item.p_description}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <Link href={`/products/${item.product_no}`}>
              <h3 className="font-semibold hover:text-primary">{item.p_description}</h3>
            </Link>
            <p className="font-medium text-primary mt-1">${item.product_price.toFixed(2)}</p>

            <div className="flex gap-2 mt-4">
              <Button variant="default" className="flex-1" onClick={() => moveToCart(item)} disabled={isUpdating}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="outline" size="icon" onClick={() => removeItem(item.product_no)} disabled={isUpdating}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

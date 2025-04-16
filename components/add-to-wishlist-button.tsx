"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "./supabase-provider"

interface Product {
  product_no: number
  product_price: number
  quantity_available: number
  product_type: string
  p_description: string
  product_image?: string
}

interface AddToWishlistButtonProps {
  product: Product
}

export default function AddToWishlistButton({ product }: AddToWishlistButtonProps) {
  const { user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToWishlist = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/products/${product.product_no}`)
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user wishlist
      const { data: userData, error: userError } = await supabase
        .from("app_user")
        .select("user_wish_list")
        .eq("user_id", user.id)
        .single()

      if (userError) throw userError

      const currentWishlist = userData.user_wish_list || []

      // Check if product already in wishlist
      const existingItemIndex = currentWishlist.findIndex((item: any) => item.product_no === product.product_no)

      let newWishlist

      if (existingItemIndex >= 0) {
        // Remove product if already in wishlist
        newWishlist = currentWishlist.filter((item: any) => item.product_no !== product.product_no)

        toast({
          title: "Removed from wishlist",
          description: `${product.p_description} has been removed from your wishlist.`,
        })
      } else {
        // Add new product to wishlist
        newWishlist = [
          ...currentWishlist,
          {
            product_no: product.product_no,
            p_description: product.p_description,
            product_price: product.product_price,
            product_image: product.product_image,
          },
        ]

        toast({
          title: "Added to wishlist",
          description: `${product.p_description} has been added to your wishlist.`,
        })
      }

      // Update user wishlist
      const { error: updateError } = await supabase
        .from("app_user")
        .update({ user_wish_list: newWishlist })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleAddToWishlist} disabled={isLoading} className="w-full sm:w-auto">
      <Heart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : "Add to Wishlist"}
    </Button>
  )
}

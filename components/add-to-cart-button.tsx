"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
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

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/products/${product.product_no}`)
      return
    }

    if (product.quantity_available <= 0) {
      toast({
        title: "Product out of stock",
        description: "Sorry, this product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user cart
      const { data: userData, error: userError } = await supabase
        .from("app_user")
        .select("user_cart")
        .eq("user_id", user.id)
        .single()

      if (userError) throw userError

      const currentCart = userData.user_cart || []

      // Check if product already in cart
      const existingItemIndex = currentCart.findIndex((item: any) => item.product_no === product.product_no)

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
            product_no: product.product_no,
            p_description: product.p_description,
            product_price: product.product_price,
            product_image: product.product_image,
            quantity: 1,
          },
        ]
      }

      // Update user cart
      const { error: updateError } = await supabase
        .from("app_user")
        .update({ user_cart: newCart })
        .eq("user_id", user.id)

      if (updateError) throw updateError

      toast({
        title: "Added to cart",
        description: `${product.p_description} has been added to your cart.`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product to cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || product.quantity_available <= 0}
      className="w-full sm:w-auto"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Adding..." : "Add to Cart"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/cart-context"

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
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddToCart = () => {
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
      addToCart(product)

      toast({
        title: "Added to cart",
        description: `${product.p_description} has been added to your cart.`,
      })
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

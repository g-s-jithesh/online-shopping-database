"use client"

import { useState } from "react"
import Image from "next/image"
import { Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "./supabase-provider"
import { useRouter } from "next/navigation"

interface CartItem {
  product_no: number
  p_description: string
  product_price: number
  product_image?: string
  quantity: number
}

interface CartItemsProps {
  items: CartItem[]
}

export default function CartItems({ items }: CartItemsProps) {
  const { user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateQuantity = async (productNo: number, newQuantity: number) => {
    if (!user) return

    if (newQuantity < 1) {
      removeItem(productNo)
      return
    }

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const updatedItems = items.map((item) => {
        if (item.product_no === productNo) {
          return { ...item, quantity: newQuantity }
        }
        return item
      })

      const { error } = await supabase.from("app_user").update({ user_cart: updatedItems }).eq("user_id", user.id)

      if (error) throw error

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update cart.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const removeItem = async (productNo: number) => {
    if (!user) return

    setIsUpdating(true)

    try {
      const supabase = createClient()

      const updatedItems = items.filter((item) => item.product_no !== productNo)

      const { error } = await supabase.from("app_user").update({ user_cart: updatedItems }).eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Item removed",
        description: "The item has been removed from your cart.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.product_no} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg">
          <div className="relative w-full sm:w-24 h-24 bg-muted rounded-md overflow-hidden">
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

          <div className="flex-1">
            <h3 className="font-semibold">{item.p_description}</h3>
            <p className="text-sm text-muted-foreground">Product #{item.product_no}</p>
            <p className="font-medium text-primary mt-1">${item.product_price.toFixed(2)}</p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product_no, item.quantity - 1)}
                  disabled={isUpdating}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product_no, item.quantity + 1)}
                  disabled={isUpdating}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="ghost" size="icon" onClick={() => removeItem(item.product_no)} disabled={isUpdating}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

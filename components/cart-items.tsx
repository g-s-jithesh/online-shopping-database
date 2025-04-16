"use client"

import Image from "next/image"
import { Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export default function CartItems() {
  const { cartItems, updateQuantity, removeFromCart } = useCart()

  return (
    <div className="space-y-4">
      {cartItems.map((item) => (
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
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.product_no, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product_no)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

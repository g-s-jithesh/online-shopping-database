"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"

export default function CartSummary() {
  const router = useRouter()
  const { cartItems, getCartTotal } = useCart()

  const subtotal = getCartTotal()
  const tax = subtotal * 0.1 // 10% tax
  const shipping = subtotal > 0 ? 10 : 0 // $10 shipping fee
  const total = subtotal + tax + shipping

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleCheckout} disabled={cartItems.length === 0}>
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  )
}

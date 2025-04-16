"use client"

import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import CartItems from "@/components/cart-items"
import CartSummary from "@/components/cart-summary"

export default function CartPage() {
  const { cartItems } = useCart()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/products">
            <Button className="inline-block bg-primary text-white px-6 py-3 rounded-md">Continue Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}

import { Button } from "@/components/ui/button"

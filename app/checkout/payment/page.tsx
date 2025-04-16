"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"

export default function PaymentPage() {
  const router = useRouter()
  const { user } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!user) throw new Error("User not authenticated")

      const supabase = createClient()

      // Get user cart
      const { data: userData, error: userError } = await supabase
        .from("app_user")
        .select("user_cart")
        .eq("user_id", user.id)
        .single()

      if (userError) throw userError

      const cartItems = userData.user_cart || []

      if (cartItems.length === 0) {
        throw new Error("Cart is empty")
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((total: number, item: any) => {
        return total + item.product_price * item.quantity
      }, 0)

      // Get next order number
      const { data: maxOrderNoData } = await supabase
        .from("sales_order")
        .select("order_no")
        .order("order_no", { ascending: false })
        .limit(1)

      const maxOrderNo = maxOrderNoData && maxOrderNoData.length > 0 ? maxOrderNoData[0].order_no : 0
      const newOrderNo = maxOrderNo + 1

      // Create order
      const { error: orderError } = await supabase.from("sales_order").insert({
        order_no: newOrderNo,
        order_date: new Date().toISOString().split("T")[0],
        user_id: user.id,
        order_status: "Processing",
      })

      if (orderError) throw orderError

      // Create order details
      for (const item of cartItems) {
        const { error: detailError } = await supabase.from("sales_order_details").insert({
          order_no: newOrderNo,
          product_no: item.product_no,
          quantity_no: item.quantity,
          amt: item.product_price * item.quantity,
        })

        if (detailError) throw detailError
      }

      // Create payment record
      const { data: maxPaymentIdData } = await supabase
        .from("payment")
        .select("p_id")
        .order("p_id", { ascending: false })
        .limit(1)

      const maxPaymentId = maxPaymentIdData && maxPaymentIdData.length > 0 ? maxPaymentIdData[0].p_id : 0
      const newPaymentId = maxPaymentId + 1

      const { error: paymentError } = await supabase.from("payment").insert({
        p_id: newPaymentId,
        p_date: new Date().toISOString().split("T")[0],
        p_amt: totalAmount,
        p_details: `Payment for order #${newOrderNo}`,
        p_customer_id: user.id,
        order_no: newOrderNo,
      })

      if (paymentError) throw paymentError

      // Clear cart
      const { error: clearCartError } = await supabase.from("app_user").update({ user_cart: [] }).eq("user_id", user.id)

      if (clearCartError) throw clearCartError

      toast({
        title: "Order placed successfully",
        description: `Your order #${newOrderNo} has been placed.`,
      })

      router.push(`/orders`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process payment.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Payment</h1>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" name="cardName" value={formData.cardName} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                  maxLength={16}
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    required
                    maxLength={3}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Complete Payment"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                This is a demo payment form. No actual payment will be processed.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

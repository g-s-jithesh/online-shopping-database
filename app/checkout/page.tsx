"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import { useSupabase } from "@/components/supabase-provider"
import OrderSummary from "@/components/order-summary"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { user } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    mobile: "",
  })

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0) {
      router.push("/cart")
    }

    // Load user profile data if authenticated
    const loadUserProfile = async () => {
      if (user) {
        const supabase = createClient()
        const { data, error } = await supabase.from("app_user").select("*").eq("user_id", user.id).single()

        if (!error && data) {
          setFormData({
            name: data.user_name || "",
            email: data.user_email || "",
            address: data.user_address || "",
            city: "",
            pincode: data.user_pincode || "",
            mobile: data.user_mobile || "",
          })
        }
      }
    }

    loadUserProfile()
  }, [user, cartItems.length, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get or create user
      let userId = user?.id

      if (!userId) {
        // Check if user exists by email
        const { data: existingUser, error: userQueryError } = await supabase
          .from("app_user")
          .select("user_id")
          .eq("user_email", formData.email)
          .maybeSingle()

        if (existingUser) {
          userId = existingUser.user_id
          // Update user info
          await supabase
            .from("app_user")
            .update({
              user_name: formData.name,
              user_address: formData.address,
              user_mobile: formData.mobile,
              user_pincode: formData.pincode,
            })
            .eq("user_id", userId)
        } else {
          // Create new user
          const newUserId = crypto.randomUUID()
          const { error: createUserError } = await supabase.from("app_user").insert({
            user_id: newUserId,
            user_name: formData.name,
            user_email: formData.email,
            user_address: formData.address,
            user_mobile: formData.mobile,
            user_pincode: formData.pincode,
            user_cart: [],
            user_wish_list: [],
            user_role: "customer",
          })

          if (createUserError) throw createUserError
          userId = newUserId
        }
      } else {
        // Update authenticated user info
        await supabase
          .from("app_user")
          .update({
            user_name: formData.name,
            user_address: formData.address,
            user_mobile: formData.mobile,
            user_pincode: formData.pincode,
          })
          .eq("user_id", userId)
      }

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
        user_id: userId,
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
        p_amt: getCartTotal(),
        p_details: `Payment for order #${newOrderNo}`,
        p_customer_id: userId,
        order_no: newOrderNo,
      })

      if (paymentError) throw paymentError

      toast({
        title: "Order placed successfully",
        description: `Your order #${newOrderNo} has been placed.`,
      })

      clearCart()
      router.push(`/checkout/success?order=${newOrderNo}`)
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process your order.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Postal Code</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Phone Number</Label>
                  <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div>
          <OrderSummary items={cartItems} />
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface User {
  user_id: string
  user_name: string
  user_email: string
  user_address?: string
  user_mobile?: string
  user_pincode?: string
  user_cart: any[]
}

interface CheckoutFormProps {
  user: User
}

export default function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: user.user_name || "",
    email: user.user_email || "",
    address: user.user_address || "",
    city: "",
    pincode: user.user_pincode || "",
    mobile: user.user_mobile || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Update user profile with shipping details
      const { error: updateError } = await supabase
        .from("app_user")
        .update({
          user_name: formData.name,
          user_address: formData.address,
          user_mobile: formData.mobile,
          user_pincode: formData.pincode,
        })
        .eq("user_id", user.user_id)

      if (updateError) throw updateError

      // Proceed to payment page
      router.push("/checkout/payment")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save shipping details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={formData.address} onChange={handleChange} required rows={3} />
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
            {isLoading ? "Processing..." : "Continue to Payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react"

interface OrderDetail {
  product_no: number
  quantity_no: number
  amt: number
  product_master: {
    p_description: string
    product_price: number
    product_image?: string
  }
}

interface Order {
  order_no: number
  order_date: string
  order_status: string
  sales_order_details: OrderDetail[]
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        if (!authLoading) {
          router.push("/auth/signin?redirect=/orders/" + params.id)
        }
        return
      }

      try {
        setIsLoading(true)
        const supabase = createClient()

        // First check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from("app_user")
          .select("user_id")
          .eq("user_id", user.id)

        if (profileError) throw profileError

        // If profile doesn't exist, create one
        if (!profileData || profileData.length === 0) {
          // Create user profile using server API
          const response = await fetch("/api/create-user-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              name: user.email?.split("@")[0] || "",
              email: user.email,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to create user profile")
          }
        }

        // Now fetch order details
        const { data, error } = await supabase
          .from("sales_order")
          .select(`
            *,
            sales_order_details(
              *,
              product_master(*)
            )
          `)
          .eq("order_no", params.id)
          .eq("user_id", user.id)
          .single()

        if (error) throw error

        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        })
        router.push("/profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [user, authLoading, router, params.id, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const getOrderStatusStep = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return 3
      case "shipped":
        return 2
      case "processing":
        return 1
      default:
        return 1
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const orderStep = getOrderStatusStep(order.order_status)
  const subtotal = order.sales_order_details.reduce((total, item) => total + item.amt, 0)
  const tax = subtotal * 0.1
  const shipping = 10
  const total = subtotal + tax + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link href="/profile?tab=orders" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Order #{order.order_no}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Placed on {formatDate(order.order_date)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-center">
                    <div
                      className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto mb-2 ${
                        orderStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Package className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Processing</p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto mb-2 ${
                        orderStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <Truck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Shipped</p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`rounded-full h-10 w-10 flex items-center justify-center mx-auto mb-2 ${
                        orderStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium">Delivered</p>
                  </div>
                </div>
                <div className="absolute top-5 left-0 right-0 h-1 bg-muted -z-10">
                  <div className="h-full bg-primary transition-all" style={{ width: `${(orderStep - 1) * 50}%` }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.sales_order_details.map((item) => (
                  <div key={item.product_no} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden">
                      {item.product_master.product_image ? (
                        <Image
                          src={item.product_master.product_image || "/placeholder.svg"}
                          alt={item.product_master.p_description}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-200">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product_master.p_description}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity_no} x ${item.product_master.product_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="font-medium">${item.amt.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4">
            <Button className="w-full" variant="outline">
              Need Help?
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

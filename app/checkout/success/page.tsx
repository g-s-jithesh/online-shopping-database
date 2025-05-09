"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"

interface OrderSummary {
  order_no: number
  order_date: string
  total_amount: number
  items_count: number
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useSupabase()
  const [orderDetails, setOrderDetails] = useState<OrderSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const orderNo = searchParams.get("order")

  useEffect(() => {
    if (!orderNo) {
      router.push("/")
      return
    }

    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        const supabase = createClient()

        // Get order details
        const { data: orderData, error: orderError } = await supabase
          .from("sales_order")
          .select("order_no, order_date")
          .eq("order_no", orderNo)
          .single()

        if (orderError) throw orderError

        // Get order items count and total
        const { data: orderDetails, error: detailsError } = await supabase
          .from("sales_order_details")
          .select("amt")
          .eq("order_no", orderNo)

        if (detailsError) throw detailsError

        const totalAmount = orderDetails.reduce((sum, item) => sum + item.amt, 0)

        setOrderDetails({
          order_no: orderData.order_no,
          order_date: orderData.order_date,
          total_amount: totalAmount,
          items_count: orderDetails.length,
        })
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderNo, router])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!orderNo || !orderDetails) return null

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-medium">#{orderDetails.order_no}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{formatDate(orderDetails.order_date)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">Items:</span>
              <span className="font-medium">{orderDetails.items_count}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total:</span>
              <span className="font-bold">${orderDetails.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-center">
            Thank you for your purchase! We've sent a confirmation email with your order details.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href={`/orders/${orderDetails.order_no}`} className="w-full">
            <Button className="w-full">
              <Package className="mr-2 h-4 w-4" />
              View Order Details
            </Button>
          </Link>
          <Link href="/products" className="w-full">
            <Button variant="outline" className="w-full">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"

interface Order {
  order_no: number
  order_date: string
  order_status: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        if (!authLoading) {
          router.push("/auth/signin?redirect=/orders")
        }
        return
      }

      try {
        setIsLoading(true)
        const supabase = createClient()

        const { data, error } = await supabase
          .from("sales_order")
          .select("order_no, order_date, order_status")
          .eq("user_id", user.id)
          .order("order_date", { ascending: false })

        if (error) throw error

        setOrders(data || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load orders.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [user, authLoading, router, toast])

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
          <p className="mb-6">You haven't placed any orders yet.</p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.order_no} className="overflow-hidden">
              <div className="bg-muted px-4 py-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">Order #{order.order_no}</p>
                  <p className="text-sm text-muted-foreground">Placed on {formatDate(order.order_date)}</p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.order_status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : order.order_status === "Processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.order_status === "Shipped"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.order_status || "Processing"}
                  </span>
                </div>
              </div>
              <CardContent className="p-4 flex justify-between items-center">
                <Link href={`/orders/${order.order_no}`}>
                  <Button>View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

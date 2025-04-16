"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      const supabase = createClient()

      try {
        // Get total users
        const { count: userCount } = await supabase.from("app_user").select("*", { count: "exact", head: true })

        // Get total products
        const { count: productCount } = await supabase
          .from("product_master")
          .select("*", { count: "exact", head: true })

        // Get total orders
        const { count: orderCount } = await supabase.from("sales_order").select("*", { count: "exact", head: true })

        // Get total revenue
        const { data: orderData } = await supabase.from("sales_order_details").select("amt")

        const totalRevenue = orderData?.reduce((sum, order) => sum + order.amt, 0) || 0

        setStats({
          totalUsers: userCount || 0,
          totalProducts: productCount || 0,
          totalOrders: orderCount || 0,
          totalRevenue,
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isLoading ? "..." : stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenue generated</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Quick Actions</TabsTrigger>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products">
              <Card className="h-full transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Add, edit, or remove products from your inventory.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="h-full transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View and manage user accounts and permissions.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="h-full transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle>Manage Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">View and update order status and details.</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/seed">
              <Card className="h-full transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle>Seed Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Add sample products and create admin user.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <p>Loading recent orders...</p> : <p>No recent orders to display.</p>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analytics dashboard coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Package, User, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  user_id: string
  user_name: string
  user_email: string
  user_address?: string
  user_mobile?: string
  user_pincode?: string
}

interface Order {
  order_no: number
  order_date: string
  order_status: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    pincode: "",
    mobile: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        if (!authLoading) {
          router.push("/auth/signin?redirect=/profile")
        }
        return
      }

      try {
        setIsLoading(true)
        const supabase = createClient()

        // Fetch user profile
        const { data, error } = await supabase.from("app_user").select("*").eq("user_id", user.id).single()

        if (error) throw error

        setProfile(data)
        setFormData({
          name: data.user_name || "",
          address: data.user_address || "",
          pincode: data.user_pincode || "",
          mobile: data.user_mobile || "",
        })

        // Fetch user orders
        const { data: orderData, error: orderError } = await supabase
          .from("sales_order")
          .select("order_no, order_date, order_status")
          .eq("user_id", user.id)
          .order("order_date", { ascending: false })

        if (!orderError && orderData) {
          setOrders(orderData)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile information.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("app_user")
        .update({
          user_name: formData.name,
          user_address: formData.address,
          user_mobile: formData.mobile,
          user_pincode: formData.pincode,
        })
        .eq("user_id", user?.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

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

  if (!profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Account</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profile.user_email} disabled />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Phone Number</Label>
                      <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Postal Code</Label>
                      <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{profile.user_name || "Not set"}</p>
                      <p className="text-sm text-muted-foreground">{profile.user_email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Orders</p>
                      <p className="text-sm text-muted-foreground">{orders.length} orders placed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Shopping</p>
                      <Link href="/products" className="text-sm text-primary hover:underline">
                        Browse products
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>View your past orders and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
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
                      <div className="p-4 flex justify-between items-center">
                        <Link href={`/orders/${order.order_no}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">Update your password to keep your account secure.</p>
                <Button variant="outline">Change Password</Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium">Account Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

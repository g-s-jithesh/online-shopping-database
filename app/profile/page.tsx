"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useSupabase } from "@/components/supabase-provider"
import { Package, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile {
  user_id: string
  user_name: string
  user_email: string
  user_address?: string
  user_mobile?: string
  user_pincode?: string
  user_age?: number
  user_gender?: string
  user_birthday?: string
  user_occupation?: string
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
    age: "",
    gender: "",
    birthday: "",
    occupation: "",
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
          age: data.user_age?.toString() || "",
          gender: data.user_gender || "",
          birthday: data.user_birthday || "",
          occupation: data.user_occupation || "",
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

  const handleSelectChange = (name: string, value: string) => {
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
          user_age: formData.age ? Number.parseInt(formData.age) : null,
          user_gender: formData.gender,
          user_birthday: formData.birthday,
          user_occupation: formData.occupation,
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
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <Card className="text-center p-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg" alt={profile.user_name || ""} />
                <AvatarFallback className="text-2xl">
                  {profile.user_name?.charAt(0).toUpperCase() || profile.user_email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{profile.user_name || "User"}</h2>
              <p className="text-sm text-muted-foreground mb-4">{profile.user_email}</p>
              <div className="w-full space-y-2">
                <Link href="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders ({orders.length})
                  </Button>
                </Link>
                <Link href="/wishlist">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Wishlist
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profile.user_email} disabled />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          name="age"
                          type="number"
                          value={formData.age}
                          onChange={handleChange}
                          min="0"
                          max="120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthday">Birthday</Label>
                        <Input
                          id="birthday"
                          name="birthday"
                          type="date"
                          value={formData.birthday}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          name="occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                          placeholder="e.g. Software Developer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">Phone Number</Label>
                      <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button type="submit" form="profile-form" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                  <CardDescription>Update your shipping address</CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pincode">Postal Code</Label>
                        <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button type="submit" form="address-form" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Address"}
                  </Button>
                </CardFooter>
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
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
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
            {orders.length > 3 && (
              <div className="text-center mt-4">
                <Link href="/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

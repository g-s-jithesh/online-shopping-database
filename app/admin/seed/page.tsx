"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function SeedPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const sampleProducts = [
    {
      product_no: 1,
      product_price: 999.99,
      quantity_available: 15,
      product_type: "Electronics",
      p_description: "Premium Laptop",
      p_details: "High-performance laptop with 16GB RAM, 512GB SSD, and a powerful processor.",
      product_sales: "Hot",
      product_image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=800",
    },
    {
      product_no: 2,
      product_price: 49.99,
      quantity_available: 50,
      product_type: "Clothing",
      p_description: "Casual T-Shirt",
      p_details: "Comfortable cotton t-shirt available in various colors and sizes.",
      product_sales: "Regular",
      product_image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800",
    },
    {
      product_no: 3,
      product_price: 129.99,
      quantity_available: 20,
      product_type: "Home",
      p_description: "Coffee Maker",
      p_details: "Programmable coffee maker with 12-cup capacity and auto shut-off feature.",
      product_sales: "Regular",
      product_image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800",
    },
    {
      product_no: 4,
      product_price: 79.99,
      quantity_available: 30,
      product_type: "Accessories",
      p_description: "Wireless Headphones",
      p_details: "Bluetooth headphones with noise cancellation and 20-hour battery life.",
      product_sales: "Hot",
      product_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800",
    },
    {
      product_no: 5,
      product_price: 199.99,
      quantity_available: 10,
      product_type: "Electronics",
      p_description: "Smart Watch",
      p_details: "Fitness tracker with heart rate monitor, GPS, and water resistance.",
      product_sales: "Hot",
      product_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800",
    },
    {
      product_no: 6,
      product_price: 299.99,
      quantity_available: 8,
      product_type: "Electronics",
      p_description: "Wireless Speaker",
      p_details: "Portable Bluetooth speaker with 360-degree sound and 12-hour battery life.",
      product_sales: "Regular",
      product_image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=800",
    },
    {
      product_no: 7,
      product_price: 59.99,
      quantity_available: 25,
      product_type: "Home",
      p_description: "Kitchen Knife Set",
      p_details: "Professional 5-piece knife set with ergonomic handles and stainless steel blades.",
      product_sales: "Regular",
      product_image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=800",
    },
    {
      product_no: 8,
      product_price: 89.99,
      quantity_available: 15,
      product_type: "Clothing",
      p_description: "Winter Jacket",
      p_details: "Warm and waterproof jacket perfect for cold weather conditions.",
      product_sales: "Seasonal",
      product_image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=800",
    },
  ]

  const handleSeedProducts = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Clear existing products
      const { error: deleteError } = await supabase.from("product_master").delete().neq("product_no", 0)

      if (deleteError) {
        throw deleteError
      }

      // Insert sample products
      const { error: insertError } = await supabase.from("product_master").insert(sampleProducts)

      if (insertError) {
        throw insertError
      }

      toast({
        title: "Database seeded",
        description: `Successfully added ${sampleProducts.length} sample products.`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to seed database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to create an admin user")
      }

      // Update user role to admin
      const { error } = await supabase.from("app_user").update({ user_role: "admin" }).eq("user_id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Admin created",
        description: "Your account has been upgraded to admin.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Seed Products</CardTitle>
            <CardDescription>Add sample products to the database</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will add 8 sample products to your database. Any existing products will be removed.
            </p>
            <Button onClick={handleSeedProducts} disabled={isLoading}>
              {isLoading ? "Seeding..." : "Seed Products"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Admin User</CardTitle>
            <CardDescription>Upgrade your account to admin</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will upgrade your current account to have admin privileges, allowing you to manage products, users,
              and orders.
            </p>
            <Button onClick={handleCreateAdmin} disabled={isLoading}>
              {isLoading ? "Upgrading..." : "Make Me Admin"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

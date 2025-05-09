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
import { useSupabase } from "@/components/supabase-provider"

interface UserProfile {
  user_id: string
  user_name: string
  user_email: string
  user_address?: string
  user_mobile?: string
  user_pincode?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

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
        const supabase = createClient()
        const { data, error } = await supabase.from("app_user").select("*").eq("user_id", user.id).single()

        if (error) throw error

        setProfile(data)
        setFormData({
          name: data.user_name || "",
          address: data.user_address || "",
          pincode: data.user_pincode || "",
          mobile: data.user_mobile || "",
        })
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading profile...</p>
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

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
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
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Postal Code</Label>
                  <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Phone Number</Label>
                  <Input id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

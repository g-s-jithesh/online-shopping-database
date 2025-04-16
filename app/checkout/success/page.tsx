"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderNo = searchParams.get("order")

  useEffect(() => {
    if (!orderNo) {
      router.push("/")
    }
  }, [orderNo, router])

  if (!orderNo) return null

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">Thank you for your purchase. Your order #{orderNo} has been successfully placed.</p>
          <p className="text-muted-foreground">We've sent a confirmation email with your order details.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

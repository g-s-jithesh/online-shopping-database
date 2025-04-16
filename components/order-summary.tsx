import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CartItem } from "@/lib/cart-context"

interface OrderSummaryProps {
  items: CartItem[]
}

export default function OrderSummary({ items }: OrderSummaryProps) {
  const subtotal = items.reduce((total, item) => {
    return total + item.product_price * item.quantity
  }, 0)

  const tax = subtotal * 0.1 // 10% tax
  const shipping = subtotal > 0 ? 10 : 0 // $10 shipping fee
  const total = subtotal + tax + shipping

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product_no} className="flex justify-between">
              <div>
                <p className="font-medium">{item.p_description}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">${(item.product_price * item.quantity).toFixed(2)}</p>
            </div>
          ))}

          <div className="border-t pt-4 mt-4 space-y-2">
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
        </div>
      </CardContent>
    </Card>
  )
}

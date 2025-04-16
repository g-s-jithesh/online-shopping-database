import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface OrderDetail {
  product_no: number
  quantity_no: number
  amt: number
  product_master: {
    p_description: string
    product_price: number
  }
}

interface Order {
  order_no: number
  order_date: string
  order_status: string
  sales_order_details: OrderDetail[]
}

interface OrderListProps {
  orders: Order[]
}

export default function OrderList({ orders }: OrderListProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.order_no}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Order #{order.order_no}</CardTitle>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(order.order_date)}</p>
            </div>
            <Badge className={getStatusColor(order.order_status)}>{order.order_status || "Processing"}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.sales_order_details.map((detail) => (
                <div key={detail.product_no} className="flex justify-between">
                  <div>
                    <p className="font-medium">{detail.product_master.p_description}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {detail.quantity_no} x ${detail.product_master.product_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium">${detail.amt.toFixed(2)}</p>
                </div>
              ))}

              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>${order.sales_order_details.reduce((total, detail) => total + detail.amt, 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

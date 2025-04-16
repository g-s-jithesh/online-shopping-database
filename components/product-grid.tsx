import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Product {
  product_no: number
  product_price: number
  quantity_available: number
  product_type: string
  p_description: string
  product_image?: string
}

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        products.map((product) => (
          <Link key={product.product_no} href={`/products/${product.product_no}`}>
            <Card className="h-full overflow-hidden transition-all hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden bg-muted">
                {product.product_image ? (
                  <Image
                    src={product.product_image || "/placeholder.svg"}
                    alt={product.p_description || "Product image"}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                {product.quantity_available === 0 && (
                  <Badge variant="destructive" className="absolute top-2 right-2">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-2">{product.p_description || "Unnamed Product"}</h3>
                <p className="text-sm text-muted-foreground mt-1">{product.product_type || "Uncategorized"}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <p className="font-semibold text-primary">${(product.product_price || 0).toFixed(2)}</p>
              </CardFooter>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import AddToCartButton from "@/components/add-to-cart-button"
import AddToWishlistButton from "@/components/add-to-wishlist-button"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: product } = await supabase.from("product_master").select("*").eq("product_no", params.id).single()

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          {product.product_image ? (
            <Image
              src={product.product_image || "/placeholder.svg"}
              alt={product.p_description}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.p_description}</h1>
          <p className="text-2xl font-semibold text-primary mb-4">${product.product_price.toFixed(2)}</p>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{product.p_details}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Availability</h2>
            <p className={product.quantity_available > 0 ? "text-green-600" : "text-red-600"}>
              {product.quantity_available > 0 ? `In Stock (${product.quantity_available} available)` : "Out of Stock"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <AddToCartButton product={product} />
            <AddToWishlistButton product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}

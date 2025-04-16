import { createClient } from "@/lib/supabase/server"
import ProductGrid from "@/components/product-grid"
import ProductFilters from "@/components/product-filters"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = createClient()

  const type = searchParams.type as string | undefined

  let query = supabase.from("product_master").select("*")

  if (type) {
    query = query.eq("product_type", type)
  }

  const { data: products } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/4">
          <ProductFilters />
        </div>

        <div className="w-full md:w-3/4">
          <ProductGrid products={products || []} />
        </div>
      </div>
    </div>
  )
}

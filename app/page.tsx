import ProductGrid from "@/components/product-grid"
import HeroSection from "@/components/hero-section"
import FeaturedCategories from "@/components/featured-categories"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = createClient()

  // Fetch featured products
  const { data: products } = await supabase
    .from("product_master")
    .select("*")
    .order("product_no", { ascending: true })
    .limit(8)

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <FeaturedCategories />
      <section className="my-12">
        <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
        <ProductGrid products={products || []} />
      </section>
    </div>
  )
}

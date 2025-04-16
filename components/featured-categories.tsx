import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Laptop, ShoppingBag, Home, Watch } from "lucide-react"

export default function FeaturedCategories() {
  const categories = [
    {
      name: "Electronics",
      icon: <Laptop className="h-8 w-8" />,
      href: "/products?type=Electronics",
    },
    {
      name: "Clothing",
      icon: <ShoppingBag className="h-8 w-8" />,
      href: "/products?type=Clothing",
    },
    {
      name: "Home & Kitchen",
      icon: <Home className="h-8 w-8" />,
      href: "/products?type=Home",
    },
    {
      name: "Accessories",
      icon: <Watch className="h-8 w-8" />,
      href: "/products?type=Accessories",
    },
  ]

  return (
    <section className="py-12">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={category.href}>
              <Card className="h-full transition-all hover:shadow-lg">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="mb-4 p-2 rounded-full bg-primary/10 text-primary">{category.icon}</div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

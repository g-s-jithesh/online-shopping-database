import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Shop the Latest Products at Unbeatable Prices
            </h1>
            <p className="text-muted-foreground md:text-xl">
              Discover a wide range of high-quality products for all your needs. From electronics to fashion, we've got
              you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products">
                <Button size="lg">Shop Now</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-90"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white text-center p-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Summer Sale</h2>
                <p className="text-lg md:text-xl mb-6">Up to 50% off on selected items</p>
                <Link href="/products">
                  <Button variant="secondary" size="lg">
                    View Offers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

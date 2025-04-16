import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">ShopEase</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop shop for all your shopping needs. Quality products at affordable prices.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Shop</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?type=Electronics" className="text-sm text-muted-foreground hover:text-foreground">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?type=Clothing" className="text-sm text-muted-foreground hover:text-foreground">
                  Clothing
                </Link>
              </li>
              <li>
                <Link href="/products?type=Home" className="text-sm text-muted-foreground hover:text-foreground">
                  Home & Kitchen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Account</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-sm text-muted-foreground hover:text-foreground">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-muted-foreground">123 Shopping Street, Retail City</li>
              <li className="text-sm text-muted-foreground">contact@shopease.com</li>
              <li className="text-sm text-muted-foreground">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { createClient } from "@/lib/supabase/client"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [productTypes, setProductTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [typeOpen, setTypeOpen] = useState(true)

  const currentType = searchParams.get("type")

  useEffect(() => {
    const fetchProductTypes = async () => {
      setIsLoading(true)
      const supabase = createClient()

      const { data } = await supabase.from("product_master").select("product_type").order("product_type")

      if (data) {
        // Extract unique product types
        const types = [...new Set(data.map((item) => item.product_type))]
        setProductTypes(types)
      }

      setIsLoading(false)
    }

    fetchProductTypes()
  }, [])

  const handleTypeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams)

    if (currentType === type) {
      params.delete("type")
    } else {
      params.set("type", type)
    }

    router.push(`/products?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible open={typeOpen} onOpenChange={setTypeOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-0 font-semibold">
              Product Type
              <ChevronDown className={`h-4 w-4 transition-transform ${typeOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-2">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              productTypes.map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => handleTypeFilter(type)}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                      currentType === type ? "border-primary bg-primary text-primary-foreground" : "border-primary"
                    }`}
                  >
                    {currentType === type && <Check className="h-3 w-3" />}
                  </div>
                  <span>{type}</span>
                </Button>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-0 font-semibold">
              Price Range
              <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Under $50
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                $50 - $100
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                $100 - $200
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                Over $200
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

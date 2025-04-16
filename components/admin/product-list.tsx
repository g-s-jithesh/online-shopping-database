"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Edit, Trash2, Plus } from "lucide-react"

interface Product {
  product_no: number
  product_price: number
  quantity_available: number
  product_type: string
  p_description: string
  p_details: string
  product_sales: string
  product_image?: string
}

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({
    product_no: 0,
    product_price: 0,
    quantity_available: 0,
    product_type: "",
    p_description: "",
    p_details: "",
    product_sales: "",
    product_image: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "product_price" || name === "quantity_available" || name === "product_no"
          ? Number.parseFloat(value)
          : value,
    }))
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData(product)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setFormData({
      product_no: products.length > 0 ? Math.max(...products.map((p) => p.product_no)) + 1 : 1,
      product_price: 0,
      quantity_available: 0,
      product_type: "",
      p_description: "",
      p_details: "",
      product_sales: "",
      product_image: "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (productNo: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("product_master").delete().eq("product_no", productNo)

      if (error) throw error

      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully.",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from("product_master")
          .update(formData)
          .eq("product_no", selectedProduct.product_no)

        if (error) throw error

        toast({
          title: "Product updated",
          description: "The product has been updated successfully.",
        })
      } else {
        // Add new product
        const { error } = await supabase.from("product_master").insert(formData)

        if (error) throw error

        toast({
          title: "Product added",
          description: "The product has been added successfully.",
        })
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save product.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Products ({products.length})</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.product_no}>
                  <TableCell>{product.product_no}</TableCell>
                  <TableCell>{product.p_description}</TableCell>
                  <TableCell>{product.product_type}</TableCell>
                  <TableCell>${product.product_price.toFixed(2)}</TableCell>
                  <TableCell>{product.quantity_available}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.product_no)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_no">Product ID</Label>
                <Input
                  id="product_no"
                  name="product_no"
                  type="number"
                  value={formData.product_no}
                  onChange={handleChange}
                  required
                  readOnly={!!selectedProduct}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Input
                  id="product_type"
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_description">Product Name</Label>
              <Input
                id="p_description"
                name="p_description"
                value={formData.p_description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="p_details">Product Details</Label>
              <Textarea id="p_details" name="p_details" value={formData.p_details} onChange={handleChange} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product_price">Price</Label>
                <Input
                  id="product_price"
                  name="product_price"
                  type="number"
                  step="0.01"
                  value={formData.product_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity_available">Stock Quantity</Label>
                <Input
                  id="quantity_available"
                  name="quantity_available"
                  type="number"
                  value={formData.quantity_available}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_image">Image URL</Label>
              <Input
                id="product_image"
                name="product_image"
                value={formData.product_image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

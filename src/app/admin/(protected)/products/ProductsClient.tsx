'use client'

import { useState } from 'react'
import { createProduct, updateProduct, deleteProduct } from '../actions'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/Toast'

type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  discount_percentage?: number
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const [image1Preview, setImage1Preview] = useState<string>('')
  const [image2Preview, setImage2Preview] = useState<string>('')
  const [image3Preview, setImage3Preview] = useState<string>('')
  const [image4Preview, setImage4Preview] = useState<string>('')

  const openAddModal = () => {
    setEditingProduct(null)
    setImage1Preview('')
    setImage2Preview('')
    setImage3Preview('')
    setImage4Preview('')
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setImage1Preview(product.images?.[0] || '')
    setImage2Preview(product.images?.[1] || '')
    setImage3Preview(product.images?.[2] || '')
    setImage4Preview(product.images?.[3] || '')
    setIsModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (index === 1) setImage1Preview(url)
      if (index === 2) setImage2Preview(url)
      if (index === 3) setImage3Preview(url)
      if (index === 4) setImage4Preview(url)
    }
  }

  const handleClearImage = (index: number) => {
    if (index === 1) setImage1Preview('')
    if (index === 2) setImage2Preview('')
    if (index === 3) setImage3Preview('')
    if (index === 4) setImage4Preview('')
    
    const fileInput = document.getElementById(`imageFile${index}`) as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id)
        toast.success('Product deleted successfully')
      } catch (error: any) {
        toast.error(`Failed to delete product: ${error.message || error}`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData)
        toast.success('Product updated successfully')
      } else {
        await createProduct(formData)
        toast.success('Product created successfully')
      }
      setIsModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(`Failed to save product: ${error.message || error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products</h1>
        <button 
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-center"
        >
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Product</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Category</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Price</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 whitespace-nowrap">Stock</th>
              <th className="px-4 md:px-6 py-4 font-medium text-gray-600 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <div>₹{product.price}</div>
                  {product.discount_percentage && product.discount_percentage > 0 ? (
                    <div className="text-xs text-green-600 font-semibold">{product.discount_percentage}% off</div>
                  ) : null}
                </td>
                <td className="px-4 md:px-6 py-4 text-gray-600 whitespace-nowrap">{product.stock}</td>
                <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                  <button onClick={() => openEditModal(product)} className="text-violet-600 hover:text-violet-800 font-medium text-sm mr-4">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 md:px-6 py-8 text-center text-gray-500">No products found. Add one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" defaultValue={editingProduct?.category || 'Soap'} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none">
                    <option value="Soap">Soap</option>
                    <option value="Shampoo">Shampoo</option>
                    <option value="Hair Oil">Hair Oil</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" defaultValue={editingProduct?.description} required rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input type="number" name="price" defaultValue={editingProduct?.price} required min="0" step="1" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input type="number" name="stock" defaultValue={editingProduct?.stock} required min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                  <input type="number" name="discount_percentage" defaultValue={editingProduct?.discount_percentage || 0} required min="0" max="100" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none" />
                </div>
                
                {/* 4 Image Uploaders */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="font-semibold text-gray-800 mb-2">Product Images (Upload or URL)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((index) => {
                      const preview = index === 1 ? image1Preview : index === 2 ? image2Preview : index === 3 ? image3Preview : image4Preview
                      const label = index === 1 ? 'Image 1 (Main)' : `Image ${index}`
                      return (
                        <div key={index} className="flex flex-col">
                          <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
                          
                          {/* File input (hidden) */}
                          <input 
                            type="file" 
                            name={`imageFile${index}`} 
                            id={`imageFile${index}`} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, index)} 
                          />
                          
                          {/* Text input (hidden, contains URL fallback) */}
                          <input 
                            type="hidden" 
                            name={`image${index}`} 
                            value={preview.startsWith('blob:') ? (editingProduct?.images?.[index - 1] || '') : preview} 
                          />

                          {preview ? (
                            <div className="relative w-full h-32 rounded-lg border overflow-hidden group shadow-sm bg-gray-50">
                              <Image src={preview} alt={label} fill unoptimized className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                  type="button" 
                                  onClick={() => document.getElementById(`imageFile${index}`)?.click()} 
                                  className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 text-xs font-semibold shadow"
                                >
                                  Change
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleClearImage(index)} 
                                  className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 shadow"
                                  title="Delete image"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => document.getElementById(`imageFile${index}`)?.click()}
                              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 hover:text-violet-600 transition-all text-gray-400"
                            >
                              <Upload className="w-5 h-5 mb-1 text-gray-400 group-hover:text-violet-600 animate-pulse" />
                              <span className="text-[10px] font-medium text-center px-1">Click to Upload</span>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition-colors disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

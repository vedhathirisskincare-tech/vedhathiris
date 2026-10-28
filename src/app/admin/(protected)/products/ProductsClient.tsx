'use client'

import { useState } from 'react'
import { createProduct, updateProduct, deleteProduct } from '../actions'
import { Upload, X, Plus, Trash2, Tag, Layers, Search, Filter } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/Toast'

export type ProductSize = {
  size: string
  price: number
  stock?: number
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
  discount_percentage?: number
  sizes?: ProductSize[]
}

const PRESET_CATEGORIES = [
  'Haircare',
  'Face Care',
  'Soap',
  'Shampoo',
  'Hair Oil',
  'Combo Packages',
  'Luxury Collection',
  'Floral Collection',
  'Herbal Collection',
  'Super Luxury Collection',
]

const QUICK_SIZE_PRESETS = ['30ml', '50ml', '100ml', '200ml', '350ml', '30g', '50g', '100g', '200g']

export function ProductsClient({ initialProducts: products }: { initialProducts: Product[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const toast = useToast()

  // Modal form states
  const [categoryChoice, setCategoryChoice] = useState('Haircare')
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [sizesList, setSizesList] = useState<ProductSize[]>([])

  const [image1Preview, setImage1Preview] = useState<string>('')
  const [image2Preview, setImage2Preview] = useState<string>('')
  const [image3Preview, setImage3Preview] = useState<string>('')
  const [image4Preview, setImage4Preview] = useState<string>('')

  const openAddModal = () => {
    setEditingProduct(null)
    setCategoryChoice('Haircare')
    setCustomCategoryInput('')
    setSizesList([])
    setImage1Preview('')
    setImage2Preview('')
    setImage3Preview('')
    setImage4Preview('')
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    
    // Category check
    if (PRESET_CATEGORIES.includes(product.category)) {
      setCategoryChoice(product.category)
      setCustomCategoryInput('')
    } else {
      setCategoryChoice('Custom')
      setCustomCategoryInput(product.category || '')
    }

    // Sizes parse
    let parsedSizes: ProductSize[] = []
    if (Array.isArray(product.sizes)) {
      parsedSizes = product.sizes
    } else if (typeof product.sizes === 'string') {
      try {
        parsedSizes = JSON.parse(product.sizes)
      } catch {
        parsedSizes = []
      }
    }
    setSizesList(parsedSizes)

    setImage1Preview(product.images?.[0] || '')
    setImage2Preview(product.images?.[1] || '')
    setImage3Preview(product.images?.[2] || '')
    setImage4Preview(product.images?.[3] || '')
    setIsModalOpen(true)
  }

  const handleAddSizeRow = (presetSize?: string) => {
    setSizesList([
      ...sizesList,
      {
        size: presetSize || '',
        price: editingProduct?.price || 0,
        stock: 50,
      },
    ])
  }

  const handleUpdateSizeRow = (index: number, field: keyof ProductSize, value: string | number) => {
    const updated = [...sizesList]
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' || field === 'stock' ? Number(value) : value,
    }
    setSizesList(updated)
  }

  const handleRemoveSizeRow = (index: number) => {
    setSizesList(sizesList.filter((_, idx) => idx !== index))
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

    // Handle Category: if Custom, set to customCategoryInput
    const finalCategory = categoryChoice === 'Custom' ? customCategoryInput.trim() : categoryChoice
    if (!finalCategory) {
      toast.error('Please specify a category')
      setIsLoading(false)
      return
    }
    formData.set('category', finalCategory)

    // Handle Sizes: serialize clean sizes array
    const validSizes = sizesList.filter((s) => s.size.trim().length > 0 && s.price > 0)
    formData.set('sizes', JSON.stringify(validSizes))

    // If sizes are present, ensure base price matches first size price if 0
    const priceVal = Number(formData.get('price'))
    if ((!priceVal || priceVal <= 0) && validSizes.length > 0) {
      formData.set('price', String(validSizes[0].price))
    }

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

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (categoryFilter === 'All') return true
    if (categoryFilter === 'Haircare') {
      return p.category === 'Haircare' || p.category === 'Hair Oil' || p.category === 'Shampoo'
    }
    if (categoryFilter === 'Face Care') {
      return p.category === 'Face Care'
    }
    if (categoryFilter === 'Soap') {
      return (
        p.category === 'Soap' ||
        p.category.includes('Collection')
      )
    }
    return p.category === categoryFilter
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your items, categories, and multi-size variants (e.g. 50ml, 100ml, 200ml).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all font-semibold text-center shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, category, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 shrink-0">Category:</span>
          {['All', 'Haircare', 'Face Care', 'Soap', 'Shampoo', 'Hair Oil', 'Combo Packages'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Product</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Category</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Sizes & Pricing</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Stock</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              // Parse sizes
              let parsedSizes: ProductSize[] = []
              if (Array.isArray(product.sizes)) {
                parsedSizes = product.sizes
              } else if (typeof product.sizes === 'string') {
                try {
                  parsedSizes = JSON.parse(product.sizes)
                } catch {
                  parsedSizes = []
                }
              }

              const hasSizes = parsedSizes.length > 0
              const minPrice = hasSizes ? Math.min(...parsedSizes.map((s) => s.price)) : product.price
              const maxPrice = hasSizes ? Math.max(...parsedSizes.map((s) => s.price)) : product.price

              // Category badge colors
              const isHair = product.category?.toLowerCase().includes('hair') || product.category === 'Shampoo'
              const isFace = product.category?.toLowerCase().includes('face')
              const isSoap = product.category?.toLowerCase().includes('soap') || product.category?.includes('Collection')

              const badgeColor = isHair
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isFace
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : isSoap
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-violet-50 text-violet-700 border-violet-200'

              return (
                <tr key={product.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative border border-gray-200">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 leading-snug">{product.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-sm mt-0.5">{product.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                      {product.category}
                    </span>
                  </td>

                  <td className="px-4 md:px-6 py-4">
                    {hasSizes ? (
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {parsedSizes.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-violet-100"
                            >
                              {s.size}: ₹{s.price}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-gray-900 text-sm">₹{product.price}</div>
                        {product.discount_percentage && product.discount_percentage > 0 ? (
                          <span className="text-[11px] text-green-600 font-semibold">{product.discount_percentage}% off</span>
                        ) : (
                          <span className="text-[11px] text-gray-400">Single size</span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {hasSizes ? (
                      <span className="font-medium text-gray-800">
                        {parsedSizes.reduce((sum, s) => sum + (s.stock ?? product.stock), 0)} total
                      </span>
                    ) : (
                      <span>{product.stock} in stock</span>
                    )}
                  </td>

                  <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-violet-600 hover:text-violet-800 font-semibold text-sm mr-4 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 md:px-6 py-12 text-center text-gray-500">
                  No products found matching your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Customize categories, details, and sizes/volume variants.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                    placeholder="e.g. Aqua Bloom Hair Growth Mist"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm font-medium"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={categoryChoice}
                    onChange={(e) => setCategoryChoice(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm font-medium bg-white"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>

                {/* Custom Category Input if Custom is selected */}
                {categoryChoice === 'Custom' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="e.g. Body Butter or Lip Care"
                      required
                      className="w-full px-4 py-2.5 border border-violet-300 rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm font-medium bg-violet-50/30"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Discount (%)</label>
                    <input
                      type="number"
                      name="discount_percentage"
                      defaultValue={editingProduct?.discount_percentage || 0}
                      required
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description & Key Features</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description}
                    required
                    rows={3}
                    placeholder="Describe the product, benefits, and key active ingredients..."
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Base Price (₹) {sizesList.length > 0 && <span className="text-gray-400 font-normal lowercase">(or first size price)</span>}
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct?.price || ''}
                    required={sizesList.length === 0}
                    min="0"
                    step="1"
                    placeholder="e.g. 499"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Base Stock Count</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={editingProduct?.stock ?? 50}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                  />
                </div>

                {categoryChoice === 'Custom' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Discount (%)</label>
                    <input
                      type="number"
                      name="discount_percentage"
                      defaultValue={editingProduct?.discount_percentage || 0}
                      required
                      min="0"
                      max="100"
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Sizes / Variants Customization Section */}
              <div className="bg-violet-50/50 rounded-2xl p-4 md:p-5 border border-violet-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-violet-900">
                      <Layers className="w-4 h-4 text-violet-600" />
                      <h3>Product Sizes & Volume Variants</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Configure different sizes (e.g., 50ml, 100ml, 200ml or 50g, 100g) with individual prices.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSizeRow()}
                    className="px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors flex items-center gap-1 cursor-pointer w-fit"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Size
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  <span className="text-[11px] font-semibold text-gray-500">Quick Presets:</span>
                  {QUICK_SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddSizeRow(preset)}
                      className="text-[11px] font-semibold bg-white text-violet-700 hover:bg-violet-100 px-2 py-0.5 rounded-md border border-violet-200 transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>

                {/* Sizes List Table */}
                {sizesList.length > 0 ? (
                  <div className="space-y-2.5">
                    {sizesList.map((row, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 md:gap-3 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Size (e.g. 100ml)"
                            value={row.size}
                            onChange={(e) => handleUpdateSizeRow(idx, 'size', e.target.value)}
                            required
                            className="w-full px-3 py-1.5 text-xs font-semibold border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
                          />
                        </div>

                        <div className="w-28">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              placeholder="Price"
                              value={row.price || ''}
                              onChange={(e) => handleUpdateSizeRow(idx, 'price', e.target.value)}
                              required
                              min="1"
                              step="1"
                              className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
                            />
                          </div>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="Stock"
                            value={row.stock ?? 50}
                            onChange={(e) => handleUpdateSizeRow(idx, 'stock', e.target.value)}
                            min="0"
                            className="w-full px-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSizeRow(idx)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove size"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white/80 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-xs text-gray-500">
                      No multi-size variants configured. This product will sell at the single Base Price above.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddSizeRow('100ml')}
                      className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-800 cursor-pointer"
                    >
                      + Add a 100ml / 200ml size variant
                    </button>
                  </div>
                )}
              </div>

              {/* 4 Image Uploaders */}
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Product Images (Upload or URL)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((index) => {
                    const preview = index === 1 ? image1Preview : index === 2 ? image2Preview : index === 3 ? image3Preview : image4Preview
                    const label = index === 1 ? 'Image 1 (Main)' : `Image ${index}`
                    return (
                      <div key={index} className="flex flex-col">
                        <span className="block text-[11px] font-medium text-gray-500 mb-1">{label}</span>

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
                          value={preview.startsWith('blob:') ? editingProduct?.images?.[index - 1] || '' : preview}
                        />

                        {preview ? (
                          <div className="relative w-full h-28 rounded-xl border overflow-hidden group shadow-2xs bg-gray-50">
                            <Image src={preview} alt={label} fill unoptimized className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => document.getElementById(`imageFile${index}`)?.click()}
                                className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100 text-xs font-semibold shadow-sm cursor-pointer"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClearImage(index)}
                                className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-sm cursor-pointer"
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
                            className="w-full h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-violet-500 hover:bg-violet-50 hover:text-violet-600 transition-all text-gray-400"
                          >
                            <Upload className="w-5 h-5 mb-1 text-gray-400 group-hover:text-violet-600" />
                            <span className="text-[10px] font-medium text-center px-1">Upload</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-semibold transition-all disabled:opacity-50 shadow-sm cursor-pointer text-sm"
                >
                  {isLoading ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

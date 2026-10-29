'use client'

import { useState } from 'react'
import { createProduct, updateProduct, deleteProduct, updateHomepageFeaturedProducts } from '../actions'
import { Upload, X, Plus, Trash2, Tag, Layers, Search, Filter, Leaf, Package, Sparkles, Check, Gift, Star, CheckSquare } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/components/Toast'

export type ProductSize = {
  size: string
  price: number
  stock?: number
  mrp_price?: number
  original_price?: number
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  mrp_price?: number
  original_price?: number
  stock: number
  category: string
  images: string[]
  discount_percentage?: number
  ingredients?: string[]
  benefits?: string[]
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

const POPULAR_INGREDIENTS = [
  'Almond Oil', 'Coconut Oil', 'Castor Oil', 'Olive Oil', 'Shea Butter',
  'Neem', 'Manjistha', 'Turmeric', 'Aloe Vera', 'Saffron',
  'Red Sandalwood', 'Rose Petals', 'Green Gram', 'Beetroot', 'Potato Extract',
  'Tomato Extract', 'Activated Charcoal', 'Camel Milk', 'Coffee Beans',
  'Licorice Extract', 'Bhringraj', 'Amla', 'Hibiscus', 'Banana Extract',
  'Oats', 'Rice Water', 'Papaya Extract', 'Tea Tree Oil', 'Rosemary Oil'
]

const POPULAR_BENEFITS = [
  'Hair Fall Reduction',
  'Promotes Hair Growth',
  'Root Strengthening',
  'Dandruff Control',
  'Scalp Nourishment',
  'Skin Brightening',
  'Deep Cleansing',
  'Acne & Blemish Control',
  'Deep Moisturization',
  'Even Skin Tone',
  'Anti-Aging & Firming',
  'Gentle Exfoliation',
  'Sun Damage Repair',
  'Soft & Supple Skin',
  'Natural Glow'
]

export function ProductsClient({
  initialProducts: products,
  initialFeaturedIds = []
}: {
  initialProducts: Product[]
  initialFeaturedIds?: string[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [mainTab, setMainTab] = useState<'standard' | 'combos' | 'all'>('standard')
  const toast = useToast()

  // Home Page Featured 4 Products states
  const [featuredIds, setFeaturedIds] = useState<string[]>(initialFeaturedIds)
  const [tempFeaturedIds, setTempFeaturedIds] = useState<string[]>(initialFeaturedIds)
  const [isSavingFeatured, setIsSavingFeatured] = useState(false)
  const [isFeaturedModalOpen, setIsFeaturedModalOpen] = useState(false)
  const [featuredSearchQuery, setFeaturedSearchQuery] = useState('')
  const [featuredCategoryFilter, setFeaturedCategoryFilter] = useState('All')

  // Modal form states
  const [productNameInput, setProductNameInput] = useState('')
  const [categoryChoice, setCategoryChoice] = useState('Haircare')
  const [customCategoryInput, setCustomCategoryInput] = useState('')
  const [sizesList, setSizesList] = useState<ProductSize[]>([])
  const [ingredientsList, setIngredientsList] = useState<string[]>([])
  const [ingredientInput, setIngredientInput] = useState('')
  const [benefitsList, setBenefitsList] = useState<string[]>([])
  const [benefitInput, setBenefitInput] = useState('')

  // Combo product selection states
  const [selectedComboProductIds, setSelectedComboProductIds] = useState<string[]>([])
  const [comboSearchFilter, setComboSearchFilter] = useState('')

  const [image1Preview, setImage1Preview] = useState<string>('')
  const [image2Preview, setImage2Preview] = useState<string>('')
  const [image3Preview, setImage3Preview] = useState<string>('')
  const [image4Preview, setImage4Preview] = useState<string>('')

  // Statistics
  const totalCount = products.length
  const comboProducts = products.filter(
    (p) => p.category === 'Combo Packages' || p.category?.toLowerCase().includes('combo')
  )
  const comboCount = comboProducts.length
  const standardProducts = products.filter(
    (p) => p.category !== 'Combo Packages' && !p.category?.toLowerCase().includes('combo')
  )
  const standardCount = standardProducts.length
  const inStockCount = products.filter((p) => {
    if (Array.isArray(p.sizes) && p.sizes.length > 0) {
      return p.sizes.some((s) => (s.stock ?? p.stock) > 0)
    }
    return p.stock > 0
  }).length

  const isDuplicateName = productNameInput.trim().length > 0 && products.some(
    (p) =>
      p.name.trim().toLowerCase() === productNameInput.trim().toLowerCase() &&
      (!editingProduct || p.id !== editingProduct.id)
  )

  const openAddModal = (defaultCategory?: string) => {
    setEditingProduct(null)
    setProductNameInput('')
    const targetCat = defaultCategory || (mainTab === 'combos' ? 'Combo Packages' : 'Haircare')
    setCategoryChoice(targetCat)
    setCustomCategoryInput('')
    setSizesList([])
    setIngredientsList([])
    setIngredientInput('')
    setBenefitsList([])
    setBenefitInput('')
    setSelectedComboProductIds([])
    setComboSearchFilter('')
    setImage1Preview('')
    setImage2Preview('')
    setImage3Preview('')
    setImage4Preview('')
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setProductNameInput(product.name)

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

    // Ingredients parse
    let parsedIngredients: string[] = []
    if (Array.isArray(product.ingredients)) {
      parsedIngredients = product.ingredients
    } else if (typeof product.ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(product.ingredients)
      } catch {
        parsedIngredients = (product.ingredients as string)
          .replace(/[{}]/g, '')
          .split(',')
          .map((s) => s.replace(/^"|"$/g, '').trim())
          .filter(Boolean)
      }
    }
    setIngredientsList(parsedIngredients)
    setIngredientInput('')

    // Benefits parse
    let parsedBenefits: string[] = []
    if (Array.isArray(product.benefits)) {
      parsedBenefits = product.benefits
    } else if (typeof product.benefits === 'string') {
      try {
        parsedBenefits = JSON.parse(product.benefits)
      } catch {
        parsedBenefits = (product.benefits as string)
          .replace(/[{}]/g, '')
          .split(',')
          .map((s) => s.replace(/^"|"$/g, '').trim())
          .filter(Boolean)
      }
    }
    setBenefitsList(parsedBenefits)
    setBenefitInput('')

    // Match combo products if this is a combo
    if (product.category === 'Combo Packages') {
      const matched = standardProducts
        .filter((sp) => parsedIngredients.some((ing) => ing.toLowerCase().includes(sp.name.toLowerCase()) || sp.name.toLowerCase().includes(ing.toLowerCase())))
        .map((sp) => sp.id)
      setSelectedComboProductIds(matched)
    } else {
      setSelectedComboProductIds([])
    }
    setComboSearchFilter('')

    setImage1Preview(product.images?.[0] || '')
    setImage2Preview(product.images?.[1] || '')
    setImage3Preview(product.images?.[2] || '')
    setImage4Preview(product.images?.[3] || '')
    setIsModalOpen(true)
  }

  // Toggle products for a combo package
  const handleToggleComboProduct = (product: Product) => {
    const isSelected = selectedComboProductIds.includes(product.id)
    const nextIds = isSelected
      ? selectedComboProductIds.filter((id) => id !== product.id)
      : [...selectedComboProductIds, product.id]
    setSelectedComboProductIds(nextIds)

    const selectedProds = standardProducts.filter((p) => nextIds.includes(p.id))
    const names = selectedProds.map((p) => p.name)
    setIngredientsList(names)

    // Auto-populate image previews from selected products if empty
    selectedProds.forEach((p, idx) => {
      const img = p.images?.[0]
      if (img) {
        if (idx === 0 && !image1Preview) setImage1Preview(img)
        if (idx === 1 && !image2Preview) setImage2Preview(img)
        if (idx === 2 && !image3Preview) setImage3Preview(img)
      }
    })
  }

  const handleAddIngredient = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const parts = trimmed.split(/[/,]/).map((p) => p.trim()).filter(Boolean)
    const newIngredients = [...ingredientsList]
    parts.forEach((part) => {
      if (!newIngredients.some((item) => item.toLowerCase() === part.toLowerCase())) {
        newIngredients.push(part)
      }
    })
    setIngredientsList(newIngredients)
    setIngredientInput('')
  }

  const handleRemoveIngredient = (index: number) => {
    setIngredientsList(ingredientsList.filter((_, idx) => idx !== index))
  }

  const handleAddBenefit = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const parts = trimmed.split(/[/,]/).map((p) => p.trim()).filter(Boolean)
    const newBenefits = [...benefitsList]
    parts.forEach((part) => {
      if (!newBenefits.some((item) => item.toLowerCase() === part.toLowerCase())) {
        newBenefits.push(part)
      }
    })
    setBenefitsList(newBenefits)
    setBenefitInput('')
  }

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList(benefitsList.filter((_, idx) => idx !== index))
  }

  const handleAddSizeRow = (presetSize?: string) => {
    setSizesList([
      ...sizesList,
      {
        size: presetSize || '',
        mrp_price: editingProduct?.mrp_price || 0,
        price: editingProduct?.price || 0,
        stock: 50,
      },
    ])
  }

  const handleUpdateSizeRow = (index: number, field: keyof ProductSize, value: string | number) => {
    const updated = [...sizesList]
    updated[index] = {
      ...updated[index],
      [field]: field === 'price' || field === 'stock' || field === 'mrp_price' ? Number(value) : value,
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

  const handleOpenFeaturedModal = () => {
    setTempFeaturedIds([...featuredIds])
    setFeaturedSearchQuery('')
    setFeaturedCategoryFilter('All')
    setIsFeaturedModalOpen(true)
  }

  const handleToggleProductInTempFeatured = (productId: string) => {
    if (tempFeaturedIds.includes(productId)) {
      setTempFeaturedIds(tempFeaturedIds.filter((id) => id !== productId))
    } else {
      if (tempFeaturedIds.length >= 4) {
        toast.error('You can only choose 4 products for the home page. Deselect one first.')
        return
      }
      setTempFeaturedIds([...tempFeaturedIds, productId])
    }
  }

  const handleSaveFeatured = async () => {
    if (tempFeaturedIds.length !== 4) {
      toast.error(`Please select exactly 4 products (currently ${tempFeaturedIds.length} selected).`)
      return
    }
    setIsSavingFeatured(true)
    try {
      await updateHomepageFeaturedProducts(tempFeaturedIds)
      setFeaturedIds(tempFeaturedIds)
      toast.success('Home page 4 featured products updated and published!')
      setIsFeaturedModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update homepage products')
    } finally {
      setIsSavingFeatured(false)
    }
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

    const enteredName = formData.get('name')?.toString()?.trim() || ''
    const isDuplicate = products.some(
      (p) =>
        p.name.trim().toLowerCase() === enteredName.toLowerCase() &&
        (!editingProduct || p.id !== editingProduct.id)
    )
    if (isDuplicate) {
      toast.error(`A product named "${enteredName}" already exists in the catalog!`)
      setIsLoading(false)
      return
    }

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

    // Handle Ingredients & Benefits
    formData.set('ingredients', JSON.stringify(ingredientsList))
    formData.set('benefits', JSON.stringify(benefitsList))

    // If sizes are present, ensure base price matches first size price if 0
    const priceVal = Number(formData.get('price'))
    if ((!priceVal || priceVal <= 0) && validSizes.length > 0) {
      formData.set('price', String(validSizes[0].price))
    }
    const mrpVal = Number(formData.get('mrp_price'))
    if ((!mrpVal || mrpVal <= 0) && validSizes.length > 0 && validSizes[0].mrp_price) {
      formData.set('mrp_price', String(validSizes[0].mrp_price))
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

  // Filter products based on selected Main Tab, category filter, and search query
  const basePool = mainTab === 'combos'
    ? comboProducts
    : mainTab === 'standard'
    ? standardProducts
    : products

  const filteredProducts = basePool.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(p.ingredients) && p.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase())))

    if (!matchesSearch) return false

    if (mainTab === 'combos') return true

    if (categoryFilter === 'All') return true
    if (categoryFilter === 'Haircare') {
      return p.category === 'Haircare' || p.category === 'Hair Oil' || p.category === 'Shampoo'
    }
    if (categoryFilter === 'Face Care') {
      return p.category === 'Face Care'
    }
    if (categoryFilter === 'Soap') {
      return p.category === 'Soap' || p.category.includes('Collection')
    }
    return p.category === categoryFilter
  })

  // Selected products for combo calculation
  const selectedComboObjects = standardProducts.filter((p) => selectedComboProductIds.includes(p.id))
  const comboCombinedPrice = selectedComboObjects.reduce((sum, p) => sum + p.price, 0)

  return (
    <div className="space-y-6">
      {/* Top Header with Title and Add Product Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Products Catalog</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your single products, combo packages, pricing, ingredients, and benefits.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {mainTab === 'combos' ? (
            <button
              onClick={() => openAddModal('Combo Packages')}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all font-semibold text-center shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" /> Create Combo Package
            </button>
          ) : (
            <button
              onClick={() => openAddModal()}
              className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all font-semibold text-center shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Product Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div 
          onClick={() => { setMainTab('all'); setCategoryFilter('All'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            mainTab === 'all' 
              ? 'bg-violet-50/70 border-violet-300 ring-2 ring-violet-200' 
              : 'bg-white border-gray-100 hover:border-violet-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">{totalCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Full catalog items</p>
        </div>

        <div 
          onClick={() => { setMainTab('standard'); setCategoryFilter('All'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            mainTab === 'standard' 
              ? 'bg-violet-50/70 border-violet-300 ring-2 ring-violet-200' 
              : 'bg-white border-gray-100 hover:border-violet-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Standard Items</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-700 mt-2">{standardCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Soaps, oils, face & hair</p>
        </div>

        <div 
          onClick={() => { setMainTab('combos'); setCategoryFilter('All'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            mainTab === 'combos' 
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200' 
              : 'bg-white border-gray-100 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Combo Packages</span>
            <span className="text-base">🎁</span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-amber-700 mt-2">{comboCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Duos, trios & gift sets</p>
        </div>

        <div className="p-4 rounded-2xl border bg-white border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Stock</span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">{inStockCount}</div>
          <p className="text-[11px] text-gray-400 mt-0.5">Available for orders</p>
        </div>
      </div>

      {/* Home Page Showcase Section (Admin selects 4 products to reflect on Home Page) */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-md border border-violet-800/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-950" />
                Home Page Showcase
              </span>
              <span className="text-violet-200 text-xs font-medium">
                Reflected on Customer Website
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Featured Products on Home Page ({featuredIds.length}/4 Selected)
            </h2>
            <p className="text-xs text-violet-200/90 mt-0.5 max-w-2xl">
              Choose any 4 products from your catalog to display on the main home page. Changes reflect live on the website.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenFeaturedModal}
            className="w-full sm:w-auto px-4 py-2.5 bg-white text-violet-950 hover:bg-violet-50 rounded-xl font-bold text-xs md:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <CheckSquare className="w-4 h-4 text-violet-700" />
            <span>Select / Change 4 Products</span>
          </button>
        </div>

        {/* 4 Featured Slots Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
          {[0, 1, 2, 3].map((slotIndex) => {
            const pId = featuredIds[slotIndex]
            const product = pId ? products.find((p) => p.id === pId) : null
            return (
              <div
                key={slotIndex}
                className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex flex-col justify-between transition-all hover:bg-white/15"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-200 bg-white/10 px-2 py-0.5 rounded-md">
                    Slot {slotIndex + 1}
                  </span>
                  {product ? (
                    <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Live
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-300">Empty</span>
                  )}
                </div>

                {product ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-white/20 border border-white/20">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">✨</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white line-clamp-1" title={product.name}>
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-violet-200">
                        <span className="truncate">{product.category}</span>
                        <span className="font-extrabold text-white">₹{product.price}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenFeaturedModal}
                    className="h-28 sm:h-32 border-2 border-dashed border-white/30 rounded-xl flex flex-col items-center justify-center text-center p-2 text-violet-200 hover:text-white hover:border-white/60 transition-colors cursor-pointer"
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs font-semibold">Assign Product</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Navigation Tabs: Separate Combos on its own side */}
      <div className="bg-white p-2 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setMainTab('standard')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'standard'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Standard Products</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              mainTab === 'standard' ? 'bg-violet-700 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {standardCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('combos')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'combos'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <span>🎁</span>
            <span>Combo Products (Only)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              mainTab === 'combos' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {comboCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('all')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mainTab === 'all'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>All Products</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              mainTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {totalCount}
            </span>
          </button>
        </div>

        <div className="text-xs font-semibold text-gray-500 px-2">
          Showing <strong>{filteredProducts.length}</strong> of {basePool.length} {mainTab === 'combos' ? 'combos' : 'products'}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={mainTab === 'combos' ? 'Search combos by name, items...' : 'Search by name, ingredient, category...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none"
          />
        </div>

        {mainTab !== 'combos' && (
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-500 shrink-0">Category:</span>
            {['All', 'Haircare', 'Face Care', 'Soap', 'Shampoo', 'Hair Oil'].map((cat) => (
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
        )}
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/80 border-b">
            <tr>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Product</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">Category</th>
              <th className="px-4 md:px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">
                {mainTab === 'combos' ? 'Included Products' : 'Ingredients & Benefits'}
              </th>
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

              // Parse ingredients
              let parsedIngredients: string[] = []
              if (Array.isArray(product.ingredients)) {
                parsedIngredients = product.ingredients
              } else if (typeof product.ingredients === 'string') {
                try {
                  parsedIngredients = JSON.parse(product.ingredients)
                } catch {
                  parsedIngredients = (product.ingredients as string).replace(/[{}]/g, '').split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean)
                }
              }

              // Parse benefits
              let parsedBenefits: string[] = []
              if (Array.isArray(product.benefits)) {
                parsedBenefits = product.benefits
              } else if (typeof product.benefits === 'string') {
                try {
                  parsedBenefits = JSON.parse(product.benefits)
                } catch {
                  parsedBenefits = (product.benefits as string).replace(/[{}]/g, '').split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean)
                }
              }

              const hasSizes = parsedSizes.length > 0
              const minPrice = hasSizes ? Math.min(...parsedSizes.map((s) => s.price)) : product.price
              const maxPrice = hasSizes ? Math.max(...parsedSizes.map((s) => s.price)) : product.price

              const isCombo = product.category === 'Combo Packages' || product.category?.toLowerCase().includes('combo')
              const isHair = product.category?.toLowerCase().includes('hair') || product.category === 'Shampoo'
              const isFace = product.category?.toLowerCase().includes('face')
              const isSoap = product.category?.toLowerCase().includes('soap') || product.category?.includes('Collection')

              const badgeColor = isCombo
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : isHair
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isFace
                ? 'bg-pink-50 text-pink-700 border-pink-200'
                : isSoap
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-violet-50 text-violet-700 border-violet-200'

              const imgUrl = product.images?.[0]

              return (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {imgUrl ? (
                          <Image src={imgUrl} alt={product.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            {isCombo ? '🎁' : '🌿'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{product.name}</span>
                          {featuredIds.includes(product.id) && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Home Featured
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 line-clamp-1">{product.description}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                      {product.category}
                    </span>
                  </td>

                  <td className="px-4 md:px-6 py-4 max-w-xs">
                    <div className="space-y-1">
                      {parsedIngredients.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parsedIngredients.slice(0, 3).map((ing, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-emerald-100">
                              {ing}
                            </span>
                          ))}
                          {parsedIngredients.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-semibold self-center">
                              +{parsedIngredients.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No ingredients specified</span>
                      )}

                      {parsedBenefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {parsedBenefits.slice(0, 2).map((ben, idx) => (
                            <span key={idx} className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                              ✨ {ben}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
                              {s.mrp_price && s.mrp_price > s.price ? (
                                <span className="line-through text-gray-400 text-[9px]">₹{s.mrp_price}</span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-gray-900 text-sm">₹{product.price}</div>
                        {product.mrp_price && product.mrp_price > product.price ? (
                          <div className="text-[11px] text-gray-400 line-through">MRP: ₹{product.mrp_price}</div>
                        ) : null}
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
                <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-gray-500">
                  {mainTab === 'combos'
                    ? 'No combo packages found.'
                    : 'No products found matching your filter.'}
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
                  {editingProduct
                    ? categoryChoice === 'Combo Packages' ? 'Edit Combo Package' : 'Edit Product'
                    : categoryChoice === 'Combo Packages' ? 'Create Combo Package' : 'Add New Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {categoryChoice === 'Combo Packages'
                    ? 'Pick uploaded products to bundle, name your combo, and set MRP & selling price.'
                    : 'Customize category, ingredients, benefits, pricing, and volume variants.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {categoryChoice === 'Combo Packages' ? 'Combo Package Name' : 'Product Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productNameInput}
                    onChange={(e) => setProductNameInput(e.target.value)}
                    required
                    placeholder={categoryChoice === 'Combo Packages' ? 'e.g. Hair Growth Duo or Luxury Hair & Skin Trio' : 'e.g. Aqua Bloom Hair Growth Mist'}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 outline-none text-sm font-medium ${
                      isDuplicateName ? 'border-amber-400 focus:ring-amber-400 bg-amber-50/20' : 'border-gray-200 focus:ring-violet-600'
                    }`}
                  />
                  {isDuplicateName && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold mt-1.5 animate-pulse">
                      <span>⚠️</span>
                      <span>
                        Warning: A product named &quot;{productNameInput.trim()}&quot; is already in the catalog!
                      </span>
                    </div>
                  )}
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

                {/* COMBO PRODUCT PICKER: When Category is 'Combo Packages' */}
                {categoryChoice === 'Combo Packages' && (
                  <div className="md:col-span-2 bg-amber-50/60 rounded-2xl p-4 md:p-5 border border-amber-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-amber-950">
                          <Gift className="w-4 h-4 text-amber-600" />
                          <h3>Choose Products to Include in this Combo ({selectedComboObjects.length} selected)</h3>
                        </div>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Pick from your uploaded products. Their names, combined prices, and pictures are linked.
                        </p>
                      </div>

                      {comboCombinedPrice > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-lg border border-amber-300">
                            Combined Total: <strong>₹{comboCombinedPrice}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const mrpInput = document.querySelector('input[name="mrp_price"]') as HTMLInputElement
                              if (mrpInput) mrpInput.value = String(comboCombinedPrice)
                            }}
                            className="text-[11px] font-bold text-amber-800 bg-white hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            Set MRP to ₹{comboCombinedPrice}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Selected Products Tray */}
                    {selectedComboObjects.length > 0 && (
                      <div className="mb-3 p-3 bg-white rounded-xl border border-amber-200">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                          Included Products in Bundle:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {selectedComboObjects.map((prod) => (
                            <div
                              key={prod.id}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-950"
                            >
                              <span>🌿 {prod.name} (₹{prod.price})</span>
                              <button
                                type="button"
                                onClick={() => handleToggleComboProduct(prod)}
                                className="text-amber-700 hover:text-red-600 cursor-pointer"
                                title="Remove product from combo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Search & Selection List */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search uploaded products to add into combo..."
                          value={comboSearchFilter}
                          onChange={(e) => setComboSearchFilter(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div className="max-h-56 overflow-y-auto space-y-1.5 bg-white/80 p-2 rounded-xl border border-gray-200">
                        {standardProducts
                          .filter((p) => p.name.toLowerCase().includes(comboSearchFilter.toLowerCase()) || p.category.toLowerCase().includes(comboSearchFilter.toLowerCase()))
                          .map((prod) => {
                            const isSelected = selectedComboProductIds.includes(prod.id)
                            return (
                              <div
                                key={prod.id}
                                onClick={() => handleToggleComboProduct(prod)}
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                                  isSelected
                                    ? 'bg-amber-100/70 border-amber-400 font-bold text-amber-950'
                                    : 'bg-white border-gray-100 hover:border-amber-200 text-gray-800'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'}`}>
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </div>
                                  <span>{prod.name}</span>
                                  <span className="text-[10px] text-gray-400 font-normal">({prod.category})</span>
                                </div>
                                <span className="font-bold text-amber-900">₹{prod.price}</span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Description & Key Features</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description}
                    required
                    rows={3}
                    placeholder="Describe the product or combo package, benefits, and special offers..."
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm"
                  />
                </div>

                {/* Key Benefits Management Section */}
                <div className="md:col-span-2 bg-amber-50/50 rounded-2xl p-4 md:p-5 border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-amber-950">
                      <span>✨</span>
                      <h3>Product Benefits ({benefitsList.length})</h3>
                    </div>
                    <span className="text-xs text-amber-800">Key results, skin & hair benefits</span>
                  </div>

                  {/* Active Benefits Tags */}
                  {benefitsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 bg-white rounded-xl border border-amber-200">
                      {benefitsList.map((ben, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-950 text-xs font-semibold border border-amber-200"
                        >
                          <span>✓ {ben}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(idx)}
                            className="hover:text-red-600 rounded p-0.5 transition-colors cursor-pointer"
                            title="Remove benefit"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-amber-200 text-center mb-3">
                      <p className="text-xs text-gray-500">
                        No benefits added yet. Type below or pick from suggestions.
                      </p>
                    </div>
                  )}

                  {/* Add Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Type benefits separated by / or comma (e.g. Hydrating / Softens skin / Calms redness)..."
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddBenefit(benefitInput)
                        }
                      }}
                      className="flex-1 px-3.5 py-2 text-xs bg-white font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddBenefit(benefitInput)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Benefit
                    </button>
                  </div>

                  {/* Popular Benefit Presets */}
                  <div>
                    <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                      Quick Suggestions (Click to add):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white/70 rounded-lg border border-gray-200">
                      {POPULAR_BENEFITS.map((preset) => {
                        const isAdded = benefitsList.some((b) => b.toLowerCase() === preset.toLowerCase())
                        return (
                          <button
                            key={preset}
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddBenefit(preset)}
                            className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                                : 'bg-white text-amber-900 hover:bg-amber-100 hover:border-amber-300 border-amber-200 font-medium'
                            }`}
                          >
                            {isAdded ? '✓ ' : '+ '}{preset}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Key Ingredients Management Section */}
                <div className="md:col-span-2 bg-emerald-50/50 rounded-2xl p-4 md:p-5 border border-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-900">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <h3>
                        {categoryChoice === 'Combo Packages'
                          ? `Included Products in Combo (${ingredientsList.length})`
                          : `Key Ingredients (${ingredientsList.length})`}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {categoryChoice === 'Combo Packages' ? 'Bundled products list' : 'Active botanicals & essential oils'}
                    </span>
                  </div>

                  {/* Active Ingredients Tags */}
                  {ingredientsList.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mb-3 p-2.5 bg-white rounded-xl border border-emerald-200">
                      {ingredientsList.map((ing, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 text-xs font-semibold border border-emerald-200"
                        >
                          <span>{ing}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="hover:text-red-600 rounded p-0.5 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white/80 rounded-xl border border-dashed border-emerald-200 text-center mb-3">
                      <p className="text-xs text-gray-500">
                        {categoryChoice === 'Combo Packages'
                          ? 'Select products from the bundle picker above or type custom items.'
                          : 'No ingredients added yet. Type below or click popular botanical presets.'}
                      </p>
                    </div>
                  )}

                  {/* Add Input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder={categoryChoice === 'Combo Packages' ? 'Add product or component name...' : 'Type ingredient (e.g. Saffron, Almond Oil)...'}
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddIngredient(ingredientInput)
                        }
                      }}
                      className="flex-1 px-3.5 py-2 text-xs bg-white font-medium border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddIngredient(ingredientInput)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  {/* Popular Botanical Presets */}
                  {categoryChoice !== 'Combo Packages' && (
                    <div>
                      <span className="text-[11px] font-semibold text-gray-500 block mb-1">
                        Quick Suggestions (Click to add):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-white/70 rounded-lg border border-gray-200">
                        {POPULAR_INGREDIENTS.map((preset) => {
                          const isAdded = ingredientsList.some((i) => i.toLowerCase() === preset.toLowerCase())
                          return (
                            <button
                              key={preset}
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleAddIngredient(preset)}
                              className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                                isAdded
                                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                                  : 'bg-white text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 border-emerald-200 font-medium'
                              }`}
                            >
                              {isAdded ? '✓ ' : '+ '}{preset}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* MRP and Selling Price */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    MRP Price (₹) <span className="text-gray-400 font-normal lowercase">(striked out on site)</span>
                  </label>
                  <input
                    type="number"
                    name="mrp_price"
                    defaultValue={editingProduct?.mrp_price || editingProduct?.original_price || ''}
                    min="0"
                    step="1"
                    placeholder="e.g. 499"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Selling Price (₹) {sizesList.length > 0 && <span className="text-gray-400 font-normal lowercase">(or first size price)</span>}
                  </label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={editingProduct?.price || ''}
                    required={sizesList.length === 0}
                    min="0"
                    step="1"
                    placeholder="e.g. 399"
                    className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-violet-600 outline-none text-sm font-semibold text-violet-900"
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

              {/* Sizes / Variants Customization Section (Hidden for combos, as combos sell as complete set) */}
              {categoryChoice !== 'Combo Packages' && (
                <div className="bg-violet-50/50 rounded-2xl p-4 md:p-5 border border-violet-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-violet-900">
                        <Layers className="w-4 h-4 text-violet-600" />
                        <h3>Product Sizes & Volume Variants</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Configure different sizes (e.g., 50ml, 100ml, 200ml or 50g, 100g) with individual MRP and selling prices.
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

                          <div className="w-24">
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">MRP ₹</span>
                              <input
                                type="number"
                                placeholder="MRP"
                                value={row.mrp_price || ''}
                                onChange={(e) => handleUpdateSizeRow(idx, 'mrp_price', e.target.value)}
                                min="0"
                                step="1"
                                className="w-full pl-11 pr-1.5 py-1.5 text-xs font-semibold border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
                              />
                            </div>
                          </div>

                          <div className="w-28">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                              <input
                                type="number"
                                placeholder="Selling"
                                value={row.price || ''}
                                onChange={(e) => handleUpdateSizeRow(idx, 'price', e.target.value)}
                                required
                                min="1"
                                step="1"
                                className="w-full pl-6 pr-2 py-1.5 text-xs font-semibold border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
                              />
                            </div>
                          </div>

                          <div className="w-20">
                            <input
                              type="number"
                              placeholder="Stock"
                              value={row.stock ?? 50}
                              onChange={(e) => handleUpdateSizeRow(idx, 'stock', e.target.value)}
                              min="0"
                              className="w-full px-2 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
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
                        No multi-size variants configured. This product will sell at the single Selling Price above.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Product Images Section */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Product Gallery Images (Up to 4)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((index) => {
                    const preview = index === 1 ? image1Preview : index === 2 ? image2Preview : index === 3 ? image3Preview : image4Preview

                    return (
                      <div key={index} className="flex flex-col gap-2">
                        <div className="relative aspect-square border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          {preview ? (
                            <>
                              <Image src={preview} alt={`Preview ${index}`} fill sizes="150px" className="object-cover" />
                              <button
                                type="button"
                                onClick={() => handleClearImage(index)}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md z-10 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <label
                              htmlFor={`imageFile${index}`}
                              className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center"
                            >
                              <Upload className="w-5 h-5 text-gray-400 mb-1" />
                              <span className="text-[11px] font-semibold text-gray-500">Upload {index}</span>
                            </label>
                          )}
                          <input
                            type="file"
                            id={`imageFile${index}`}
                            name={`imageFile${index}`}
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, index)}
                            className="hidden"
                          />
                        </div>
                        <input
                          type="text"
                          name={`image${index}`}
                          placeholder="Or paste URL"
                          defaultValue={editingProduct?.images?.[index - 1] || ''}
                          className="w-full px-2 py-1 text-[11px] border rounded-lg focus:ring-1 focus:ring-violet-600 outline-none"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Selecting 4 Home Page Products */}
      {isFeaturedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌟</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Choose 4 Products for Home Page
                  </h2>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select any 4 products from your catalog to showcase in the main section of the customer home page.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  tempFeaturedIds.length === 4
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {tempFeaturedIds.length} / 4 Selected
                </span>
                <button
                  type="button"
                  onClick={() => setIsFeaturedModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Currently Selected 4 Slots Preview in Modal */}
            <div className="p-3 bg-violet-50/60 rounded-2xl border border-violet-100">
              <span className="text-[11px] font-bold text-violet-900 block mb-2">
                Current Selected Slots ({tempFeaturedIds.length}/4):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const id = tempFeaturedIds[slotIdx]
                  const prod = id ? products.find((p) => p.id === id) : null
                  return (
                    <div
                      key={slotIdx}
                      className="bg-white p-2 rounded-xl border border-violet-200 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      {prod ? (
                        <>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                              {slotIdx + 1}
                            </span>
                            <span className="text-xs font-semibold text-gray-900 truncate" title={prod.name}>
                              {prod.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleProductInTempFeatured(prod.id)}
                            className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                            title="Remove from selection"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-[11px] text-gray-400 italic py-0.5 px-1 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                            {slotIdx + 1}
                          </span>
                          <span>Empty Slot</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={featuredSearchQuery}
                  onChange={(e) => setFeaturedSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-300 outline-none font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Haircare', 'Face Care', 'Soap', 'Shampoo', 'Hair Oil', 'Combo Packages'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeaturedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      featuredCategoryFilter === cat
                        ? 'bg-violet-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
              {products
                .filter((p) => {
                  const matchesSearch = p.name.toLowerCase().includes(featuredSearchQuery.toLowerCase())
                  if (!matchesSearch) return false
                  if (featuredCategoryFilter === 'All') return true
                  if (featuredCategoryFilter === 'Soap') return p.category === 'Soap' || p.category.includes('Collection')
                  return p.category === featuredCategoryFilter
                })
                .map((prod) => {
                  const isSelected = tempFeaturedIds.includes(prod.id)
                  const slotIndex = tempFeaturedIds.indexOf(prod.id)
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleToggleProductInTempFeatured(prod.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-violet-50/80 border-violet-400 ring-2 ring-violet-200'
                          : 'bg-white border-gray-200 hover:border-violet-200 hover:bg-gray-50/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {prod.images?.[0] ? (
                            <Image src={prod.images[0]} alt={prod.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-base">🌿</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900 flex items-center gap-2 flex-wrap">
                            <span className="truncate">{prod.name}</span>
                            {isSelected && (
                              <span className="bg-violet-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                                Slot {slotIndex + 1}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{prod.category}</span>
                            <span>•</span>
                            <span className="font-semibold text-violet-700">₹{prod.price}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : '+ Select'}
                      </button>
                    </div>
                  )
                })}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-gray-500 font-medium text-center sm:text-left">
                {tempFeaturedIds.length === 4 ? (
                  <span className="text-emerald-600 font-bold">✓ Exactly 4 products selected. Ready to publish!</span>
                ) : (
                  <span>Please choose <strong>{4 - tempFeaturedIds.length}</strong> more {4 - tempFeaturedIds.length === 1 ? 'product' : 'products'} (need 4).</span>
                )}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsFeaturedModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={tempFeaturedIds.length !== 4 || isSavingFeatured}
                  onClick={handleSaveFeatured}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    tempFeaturedIds.length === 4 && !isSavingFeatured
                      ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {isSavingFeatured ? 'Saving...' : 'Save & Publish to Home Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

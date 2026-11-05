'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Sparkles,
  Package,
  Gift,
  Search,
  RotateCcw,
  Check,
  Loader2,
  Eye,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import { updateProductsDisplayOrder } from '../actions'
import { useToast } from '@/components/Toast'

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  mrp_price?: number
  stock: number
  category: string
  images: any
  image_url?: string
}

function getProductThumbnail(product: Product): string | null {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const valid = product.images.find(
      (img) => typeof img === 'string' && (img.startsWith('http') || img.startsWith('/'))
    )
    if (valid) return valid
  }
  if (typeof product.images === 'string') {
    try {
      const parsed = JSON.parse(product.images)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
    } catch {
      if (product.images.startsWith('{') && product.images.endsWith('}')) {
        const parts = product.images.slice(1, -1).split(',')
        if (parts.length > 0) return parts[0].replace(/^"|"$/g, '').trim()
      }
    }
  }
  if (product.image_url && (product.image_url.startsWith('http') || product.image_url.startsWith('/'))) {
    return product.image_url
  }
  return null
}

export function CustomizeProductsClient({
  initialProducts,
  initialOrderedIds = [],
}: {
  initialProducts: Product[]
  initialOrderedIds?: string[]
}) {
  const toast = useToast()

  const isCombo = (category: string) =>
    category === 'Combo Packages' || category.toLowerCase().includes('combo')

  // Split initial products into standard and combo products
  const initialStandard = useMemo(() => {
    const list = initialProducts.filter((p) => !isCombo(p.category || ''))
    if (initialOrderedIds.length > 0) {
      list.sort((a, b) => {
        const indexA = initialOrderedIds.indexOf(a.id)
        const indexB = initialOrderedIds.indexOf(b.id)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return 0
      })
    }
    return list
  }, [initialProducts, initialOrderedIds])

  const initialCombos = useMemo(() => {
    const list = initialProducts.filter((p) => isCombo(p.category || ''))
    if (initialOrderedIds.length > 0) {
      list.sort((a, b) => {
        const indexA = initialOrderedIds.indexOf(a.id)
        const indexB = initialOrderedIds.indexOf(b.id)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return 0
      })
    }
    return list
  }, [initialProducts, initialOrderedIds])

  // Working state for ordered products
  const [standardProducts, setStandardProducts] = useState<Product[]>(initialStandard)
  const [comboProducts, setComboProducts] = useState<Product[]>(initialCombos)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  // Standard product movement handlers
  const moveStandard = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const list = [...standardProducts]
    if (direction === 'up' && index > 0) {
      const temp = list[index]
      list[index] = list[index - 1]
      list[index - 1] = temp
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index]
      list[index] = list[index + 1]
      list[index + 1] = temp
    } else if (direction === 'top' && index > 0) {
      const [item] = list.splice(index, 1)
      list.unshift(item)
    } else if (direction === 'bottom' && index < list.length - 1) {
      const [item] = list.splice(index, 1)
      list.push(item)
    } else {
      return
    }
    setStandardProducts(list)
    setHasChanges(true)
  }

  // Jump to specific slot number for standard products
  const jumpStandardToSlot = (currentIndex: number, targetSlot: number) => {
    if (isNaN(targetSlot) || targetSlot < 1) return
    const targetIndex = Math.min(Math.max(0, targetSlot - 1), standardProducts.length - 1)
    if (targetIndex === currentIndex) return

    const list = [...standardProducts]
    const [item] = list.splice(currentIndex, 1)
    list.splice(targetIndex, 0, item)

    setStandardProducts(list)
    setHasChanges(true)
  }

  // Combo product movement handlers
  const moveCombo = (index: number, direction: 'up' | 'down' | 'top') => {
    const list = [...comboProducts]
    if (direction === 'up' && index > 0) {
      const temp = list[index]
      list[index] = list[index - 1]
      list[index - 1] = temp
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index]
      list[index] = list[index + 1]
      list[index + 1] = temp
    } else if (direction === 'top' && index > 0) {
      const [item] = list.splice(index, 1)
      list.unshift(item)
    } else {
      return
    }
    setComboProducts(list)
    setHasChanges(true)
  }

  // Quick sort tools
  const sortStandardAZ = () => {
    const sorted = [...standardProducts].sort((a, b) => a.name.localeCompare(b.name))
    setStandardProducts(sorted)
    setHasChanges(true)
    toast.success('Standard products sorted alphabetically A-Z.')
  }

  const sortStandardByPrice = (descending = false) => {
    const sorted = [...standardProducts].sort((a, b) =>
      descending ? b.price - a.price : a.price - b.price
    )
    setStandardProducts(sorted)
    setHasChanges(true)
    toast.success(
      descending ? 'Sorted by price: High to Low.' : 'Sorted by price: Low to High.'
    )
  }

  const resetToDefault = () => {
    if (confirm('Reset to the initial arrangement? Any unsaved moves will be discarded.')) {
      setStandardProducts(initialStandard)
      setComboProducts(initialCombos)
      setHasChanges(false)
      toast.success('Reset to default arrangement.')
    }
  }

  // Save the full custom arrangement: standard products first, then combo packs
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const fullOrderedIds = [
        ...standardProducts.map((p) => p.id),
        ...comboProducts.map((p) => p.id),
      ]
      await updateProductsDisplayOrder(fullOrderedIds)
      setHasChanges(false)
      toast.success(
        `Arrangement published! ${standardProducts.length} standard products and ${comboProducts.length} combo packs updated on /products.`
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to save arrangement')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter products by search query for display
  const filteredStandard = useMemo(() => {
    if (!searchQuery.trim()) return standardProducts
    const q = searchQuery.toLowerCase()
    return standardProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.price).includes(q)
    )
  }, [standardProducts, searchQuery])

  const filteredCombos = useMemo(() => {
    if (!searchQuery.trim()) return comboProducts
    const q = searchQuery.toLowerCase()
    return comboProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        String(p.price).includes(q)
    )
  }, [comboProducts, searchQuery])

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-violet-100 text-violet-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Catalog Architecture
            </span>
            <span className="text-gray-500 text-xs font-medium">
              Live /products sequence control
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Customize Products Arrangement
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Choose the exact sequence in which products appear to customers on the{' '}
            <strong className="text-violet-700 font-semibold">/products</strong> page. Standard
            products appear first in your chosen sequence, and{' '}
            <strong className="text-amber-700 font-semibold">
              Combo Packages are automatically shown at the end
            </strong>
            .
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          <Link
            href="/products"
            target="_blank"
            className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="View customer /products page in a new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </Link>

          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="px-3.5 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-violet-200"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Order</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              hasChanges
                ? 'bg-violet-600 hover:bg-violet-700 text-white ring-2 ring-violet-300 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasChanges ? (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes *</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Arrangement Saved</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats and Quick Tools Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
            Total Catalog
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
            {initialProducts.length} Products
          </div>
          <span className="text-[11px] text-gray-500">Full active inventory</span>
        </div>

        <div className="bg-violet-50/70 p-4 rounded-2xl border border-violet-100 shadow-2xs">
          <span className="text-[10px] font-extrabold text-violet-700 uppercase tracking-wider block">
            Standard Sequence
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-violet-900 mt-1">
            {standardProducts.length} Items
          </div>
          <span className="text-[11px] text-violet-600 font-medium">Shown first on /products</span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 shadow-2xs">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
            Combo Packs
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-1">
            {comboProducts.length} Packages
          </div>
          <span className="text-[11px] text-amber-700 font-medium">Finally shown at the end</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider block">
            Status
          </span>
          <div className="text-xs font-bold mt-1">
            {hasChanges ? (
              <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                ⚠️ Unsaved Moves
              </span>
            ) : (
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-block">
                ✓ Live on Store
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-400">Dynamic sync enabled</span>
        </div>
      </div>

      {/* Search & Quick Sort Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products in arrangement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-300 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Quick Sort:</span>
          <button
            type="button"
            onClick={sortStandardAZ}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            A → Z
          </button>
          <button
            type="button"
            onClick={() => sortStandardByPrice(false)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            Price: Low → High
          </button>
          <button
            type="button"
            onClick={() => sortStandardByPrice(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 whitespace-nowrap transition-colors cursor-pointer"
          >
            Price: High → Low
          </button>
          <button
            type="button"
            onClick={resetToDefault}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
            title="Reset to default arrangement"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Standard Products Custom Sequence */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                1. Standard Products Sequence ({standardProducts.length} Items)
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Move products up or down to arrange which appears 1st, 2nd, and next on the /products
              page.
            </p>
          </div>
          <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200 hidden sm:inline-block">
            Shown First to Users
          </span>
        </div>

        {/* Standard Products List */}
        <div className="space-y-2">
          {filteredStandard.map((product) => {
            const realIndex = standardProducts.findIndex((p) => p.id === product.id)
            const isFirst = realIndex === 0
            const isLast = realIndex === standardProducts.length - 1
            const thumbnail = getProductThumbnail(product)

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 sm:p-3.5 bg-gray-50/70 hover:bg-violet-50/40 rounded-2xl border border-gray-200 hover:border-violet-300 transition-all gap-3 group"
              >
                {/* Left: Position Badge & Product Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Position Badge */}
                  <div
                    className={`w-11 sm:w-14 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border font-extrabold ${
                      isFirst
                        ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                        : realIndex < 3
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">#{realIndex + 1}</span>
                    <span className="text-[8px] uppercase tracking-tighter opacity-80">
                      {isFirst ? '1st View' : 'Slot'}
                    </span>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="relative w-12 h-12 rounded-xl bg-white overflow-hidden shrink-0 border border-gray-200">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">🌿</div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <span className="bg-white px-2 py-0.5 rounded-md border border-gray-200 text-[10px] font-semibold text-gray-700">
                        {product.category}
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-violet-700">₹{product.price}</span>
                      {product.mrp_price && product.mrp_price > product.price && (
                        <span className="text-[10px] line-through text-gray-400">
                          ₹{product.mrp_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Controls (Direct Slot Jumper + Move Buttons) */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {/* Quick Slot Jumper Input */}
                  <div className="hidden sm:flex items-center gap-1 mr-2 bg-white px-2 py-1 rounded-xl border border-gray-200">
                    <span className="text-[10px] font-bold text-gray-400">Move to #</span>
                    <input
                      type="number"
                      min={1}
                      max={standardProducts.length}
                      defaultValue={realIndex + 1}
                      key={realIndex + 1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const target = Number((e.target as HTMLInputElement).value)
                          jumpStandardToSlot(realIndex, target)
                        }
                      }}
                      onBlur={(e) => {
                        const target = Number(e.target.value)
                        jumpStandardToSlot(realIndex, target)
                      }}
                      className="w-10 text-center font-bold text-xs border-b border-violet-400 focus:outline-none focus:border-violet-600"
                    />
                  </div>

                  {/* Move to Top */}
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveStandard(realIndex, 'top')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Send to Top (#1 Slot)"
                  >
                    <ChevronsUp className="w-4 h-4" />
                  </button>

                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveStandard(realIndex, 'up')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Move Up 1 Position"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => moveStandard(realIndex, 'down')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Move Down 1 Position"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Move to Bottom */}
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => moveStandard(realIndex, 'bottom')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-600 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Send to Bottom of Standard List"
                  >
                    <ChevronsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION 2: Combo Packages - Finally Shown at the End */}
      <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 rounded-3xl border border-amber-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-amber-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <Gift className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-amber-950">
                2. Finally Combo Packs ({comboProducts.length} Packages)
              </h2>
            </div>
            <p className="text-xs text-amber-800 mt-1">
              As configured, these combo products are automatically placed{' '}
              <strong>at the end of the /products page</strong> after all standard products.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-3 py-1 rounded-full border border-amber-300">
            🎁 Shown at the End
          </span>
        </div>

        {/* Combo Products List */}
        <div className="space-y-2">
          {filteredCombos.map((product) => {
            const realIndex = comboProducts.findIndex((p) => p.id === product.id)
            const isFirst = realIndex === 0
            const isLast = realIndex === comboProducts.length - 1
            const thumbnail = getProductThumbnail(product)
            const overallNumber = standardProducts.length + realIndex + 1

            return (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 sm:p-3.5 bg-white/90 hover:bg-white rounded-2xl border border-amber-200 hover:border-amber-400 transition-all gap-3 shadow-2xs"
              >
                {/* Left: Position & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 sm:w-14 h-10 rounded-xl bg-amber-100/90 text-amber-950 border border-amber-300 flex flex-col items-center justify-center shrink-0 font-extrabold">
                    <span className="text-xs sm:text-sm">#{overallNumber}</span>
                    <span className="text-[8px] uppercase tracking-tighter text-amber-800">
                      Combo
                    </span>
                  </div>

                  <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm">🎁</div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 text-[10px] font-semibold">
                        Combo Package
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-amber-900">₹{product.price}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Reorder Combo Controls */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveCombo(realIndex, 'top')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Send to Top of Combo List"
                  >
                    <ChevronsUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveCombo(realIndex, 'up')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Move Combo Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => moveCombo(realIndex, 'down')}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:border-amber-400 text-gray-600 hover:text-amber-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Move Combo Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Save Bar when changes are made */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-gray-700 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs sm:text-sm font-semibold">
              You have unsaved product arrangement changes.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>Save & Publish Now</span>
          </button>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-violet-600" />
                  <span>Customer Grid Preview (/products)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This preview shows the exact sequence users will see when visiting the store.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div>
                <span className="text-xs font-extrabold text-violet-700 uppercase tracking-wider block mb-3">
                  1. Standard Products (Shown First)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {standardProducts.map((p, idx) => {
                    const thumb = getProductThumbnail(p)
                    return (
                      <div
                        key={p.id}
                        className="bg-gray-50 p-2.5 rounded-2xl border border-gray-200 flex flex-col justify-between"
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-white mb-2">
                          {thumb ? (
                            <Image src={thumb} alt={p.name} fill sizes="120px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                          )}
                          <span className="absolute top-1 left-1 bg-black/75 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">
                            #{idx + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span className="truncate">{p.category}</span>
                          <span className="font-bold text-violet-700">₹{p.price}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div>
                <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block mb-3">
                  2. Combo Packages (Finally Shown at the End)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {comboProducts.map((p, idx) => {
                    const thumb = getProductThumbnail(p)
                    const overall = standardProducts.length + idx + 1
                    return (
                      <div
                        key={p.id}
                        className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200 flex flex-col justify-between"
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-white mb-2">
                          {thumb ? (
                            <Image src={thumb} alt={p.name} fill sizes="120px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🎁</div>
                          )}
                          <span className="absolute top-1 left-1 bg-amber-700 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-md">
                            #{overall}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span>Combo Pack</span>
                          <span className="font-bold text-amber-900">₹{p.price}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Back to Customizing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


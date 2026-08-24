import { createClient } from "@/utils/supabase/server"
import { updateAllCategoryOffers, createCarouselOffer, updateCarouselOffer, deleteCarouselOffer } from "../actions"

export default async function OfferSettingsPage() {
  const supabase = await createClient()

  // Fetch carousel offers
  const { data: carouselOffers } = await supabase
    .from('carousel_offers')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch category offers/discounts
  const { data: categoryOffers } = await supabase
    .from('category_offers')
    .select('category, discount_percentage')

  const soapOffer = categoryOffers?.find(o => o.category === 'Soap')
  const shampooOffer = categoryOffers?.find(o => o.category === 'Shampoo')
  const hairoilOffer = categoryOffers?.find(o => o.category === 'Hair Oil')

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Offers Settings</h1>
          <p className="text-gray-500 mt-2">Manage the multiple promotional messages displayed in the top bar carousel.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-8">
          <form action={createCarouselOffer} className="space-y-4 border-b pb-6">
            <h3 className="font-semibold text-lg text-gray-900">Add New Offer</h3>
            <div>
              <label htmlFor="new_message" className="block text-sm font-medium text-gray-700 mb-2">
                Offer Message
              </label>
              <input
                type="text"
                id="new_message"
                name="message"
                placeholder="e.g. Free shipping on orders over ₹1000!"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition-shadow"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="new_is_active"
                name="is_active"
                defaultChecked={true}
                className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-600"
              />
              <label htmlFor="new_is_active" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
            <button
              type="submit"
              className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors cursor-pointer"
            >
              Add Offer
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">Existing Offers</h3>
            {carouselOffers && carouselOffers.length > 0 ? (
              <div className="space-y-4">
                {carouselOffers.map((co) => (
                  <div key={co.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <form action={updateCarouselOffer.bind(null, co.id)} className="flex-1 flex flex-col md:flex-row gap-4 w-full">
                      <div className="flex-1">
                        <input
                          type="text"
                          name="message"
                          defaultValue={co.message}
                          required
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition-shadow"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_active"
                          defaultChecked={co.is_active}
                          className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-600"
                        />
                        <span className="text-sm">Active</span>
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Update
                      </button>
                    </form>
                    <form action={deleteCarouselOffer.bind(null, co.id)}>
                      <button
                        type="submit"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No carousel offers found.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Category Discounts</h2>
          <p className="text-gray-500 mt-2">Set custom discount percentages for product categories. If active, all products in the category will reflect the discount.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form action={updateAllCategoryOffers} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="soap_discount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Soap Discount (%)
                </label>
                <input
                  type="number"
                  id="soap_discount"
                  name="soap_discount"
                  min="0"
                  max="100"
                  defaultValue={soapOffer?.discount_percentage ?? 0}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="shampoo_discount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Shampoo Discount (%)
                </label>
                <input
                  type="number"
                  id="shampoo_discount"
                  name="shampoo_discount"
                  min="0"
                  max="100"
                  defaultValue={shampooOffer?.discount_percentage ?? 0}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition-shadow"
                />
              </div>

              <div>
                <label htmlFor="hairoil_discount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Hair Oil Discount (%)
                </label>
                <input
                  type="number"
                  id="hairoil_discount"
                  name="hairoil_discount"
                  min="0"
                  max="100"
                  defaultValue={hairoilOffer?.discount_percentage ?? 0}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition-shadow"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors cursor-pointer"
              >
                Save Category Discounts
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

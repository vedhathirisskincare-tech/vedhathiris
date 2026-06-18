import { createClient } from "@/utils/supabase/server"
import { updateOffer, updateAllCategoryOffers } from "../actions"

export default async function OfferSettingsPage() {
  const supabase = await createClient()
  
  // Fetch promotional offer bar
  const { data: offer } = await supabase
    .from('offers')
    .select('message, is_active')
    .eq('id', 1)
    .single()

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Offer Bar Settings</h1>
          <p className="text-gray-500 mt-2">Manage the top promotional banner displayed across the website.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <form action={updateOffer} className="space-y-6">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Offer Message
              </label>
              <input
                type="text"
                id="message"
                name="message"
                defaultValue={offer?.message || ''}
                placeholder="e.g. Use code VEDHATHIRIS for 10% off your first order!"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-600 outline-none transition-shadow"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                defaultChecked={offer?.is_active ?? false}
                className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-600"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Enable Offer Bar
              </label>
              <p className="text-sm text-gray-500 ml-2">(Check this to display the offer bar on the website)</p>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
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

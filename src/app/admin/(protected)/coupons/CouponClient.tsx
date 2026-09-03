"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, Percent, IndianRupee, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { createCoupon, toggleCouponStatus, deleteCoupon } from "../actions";
import { useToast } from "@/components/Toast";
import type { Coupon } from "@/app/actions/coupon";

export function CouponClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const toast = useToast();

  const handleToggle = async (coupon: Coupon) => {
    try {
      const newStatus = !coupon.is_active;
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: newStatus } : c))
      );
      await toggleCouponStatus(coupon.id, newStatus);
      toast.success(`Coupon ${coupon.code} is now ${newStatus ? "Active" : "Inactive"}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update coupon status.");
      // Revert on error
      setCoupons(initialCoupons);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted successfully.");
      setConfirmDeleteId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Tag className="w-8 h-8 text-violet-600" />
            Manage Promo Codes & Coupons
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage discount promo codes for customer carts and checkout.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Coupon
        </button>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b bg-violet-50/70 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-violet-600" />
                Create New Promo Code
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await createCoupon(formData);
                  toast.success("Coupon created successfully!");
                  setShowCreateModal(false);
                } catch (err: any) {
                  toast.error(err.message || "Failed to create coupon.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="code">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  required
                  placeholder="e.g. VEDHA20, FLAT100"
                  className="w-full px-3.5 py-2.5 uppercase border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-sm font-bold text-violet-950 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="description">
                  Description / Badge Text
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  placeholder="e.g. 20% OFF on all handcrafted skincare"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-sm text-gray-800 bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="discount_type">
                    Discount Type *
                  </label>
                  <select
                    name="discount_type"
                    id="discount_type"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-sm text-gray-800 bg-gray-50/50"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="flat">Flat (₹) Amount Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="discount_value">
                    {discountType === "percentage" ? "Percentage Value (%) *" : "Flat Discount (₹) *"}
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    id="discount_value"
                    required
                    min={1}
                    max={discountType === "percentage" ? 100 : 10000}
                    placeholder={discountType === "percentage" ? "e.g. 15" : "e.g. 50"}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-sm text-gray-800 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="min_order_amount">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="min_order_amount"
                    id="min_order_amount"
                    min={0}
                    defaultValue={0}
                    placeholder="e.g. 499"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-sm text-gray-800 bg-gray-50/50"
                  />
                </div>

                {discountType === "percentage" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="max_discount_amount">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      name="max_discount_amount"
                      id="max_discount_amount"
                      min={0}
                      placeholder="e.g. 300 (optional)"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-sm text-gray-800 bg-gray-50/50"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  defaultChecked
                  className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Activate coupon immediately
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Coupon</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Coupon?</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this coupon? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Coupon Code</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Discount</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Min Order</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Max Cap</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-xs uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-800 font-mono font-bold text-sm rounded-lg border border-violet-200">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 text-sm">
                  {coupon.discount_type === "percentage" ? (
                    <span className="flex items-center gap-1 text-purple-700">
                      <Percent className="w-4 h-4" /> {coupon.discount_value}% OFF
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-emerald-700">
                      ₹{coupon.discount_value} Flat OFF
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : "None"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {coupon.max_discount_amount ? `₹${coupon.max_discount_amount}` : "No Limit"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {coupon.description || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggle(coupon)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      coupon.is_active
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {coupon.is_active ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => setConfirmDeleteId(coupon.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No coupons created yet. Click "Create New Coupon" above to add promo codes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

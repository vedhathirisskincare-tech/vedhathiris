"use client";

import { useCartStore } from "../store/cartStore";
import { useAuthModalStore } from "../store/authModalStore";
import { X, Minus, Plus, ShoppingBag, ShieldCheck, UserCheck, Tag, Ticket, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { createRazorpayOrder, verifyPaymentAndSaveOrder } from "@/app/actions/payment";
import { getAvailableCoupons, validateCoupon, type Coupon } from "@/app/actions/coupon";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useToast } from "./Toast";

export default function CartDrawer() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    removeItem, 
    updateQuantity, 
    clearCart,
    appliedCoupon,
    setAppliedCoupon,
  } = useCartStore();

  const { openAuthModal } = useAuthModalStore();
  const toast = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate discount based on applied coupon
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (!appliedCoupon.min_order_amount || subtotal >= appliedCoupon.min_order_amount) {
      if (appliedCoupon.discount_type === "percentage") {
        discount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
        if (appliedCoupon.max_discount_amount && discount > appliedCoupon.max_discount_amount) {
          discount = appliedCoupon.max_discount_amount;
        }
      } else {
        discount = Math.min(appliedCoupon.discount_value, subtotal);
      }
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Coupon UI states
  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showCouponList, setShowCouponList] = useState(false);

  const router = useRouter();

  // Fetch active available coupons on drawer open
  useEffect(() => {
    if (isOpen) {
      getAvailableCoupons().then((coupons) => {
        setAvailableCoupons(coupons);
      });
    }
  }, [isOpen]);

  // Check URL params for openCart=true
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("openCart") === "true" || urlParams.get("openCart") === "1") {
        setIsOpen(true);
        // Clean openCart from URL without reloading
        urlParams.delete("openCart");
        const newQuery = urlParams.toString();
        const cleanUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
        window.history.replaceState(null, "", cleanUrl);
      }
    }
  }, [setIsOpen]);

  // Sync user state and prefill delivery info
  useEffect(() => {
    const supabase = createClient();

    const syncUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        if (user.user_metadata?.full_name && !deliveryName) {
          setDeliveryName(user.user_metadata.full_name);
        }
        if (user.user_metadata?.phone_number && !deliveryPhone) {
          setDeliveryPhone(user.user_metadata.phone_number);
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          if (profile.full_name) setDeliveryName(profile.full_name);
          if (profile.phone) setDeliveryPhone(profile.phone);
        }
      }
    };

    syncUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        syncUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, deliveryName, deliveryPhone]);

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowDeliveryForm(false);
      setShowCouponList(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const targetCode = codeToApply || couponInput;
    if (!targetCode.trim()) {
      toast.error("Please enter a promo code.");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await validateCoupon(targetCode, subtotal);
      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponInput("");
        setShowCouponList(false);
        toast.success(`🎉 Coupon "${result.coupon.code}" applied! You saved ₹${result.discountAmount}`);
      } else {
        toast.error(result.error || "Invalid coupon code.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed.");
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      toast.error("Please fill in all delivery details before proceeding to payment.");
      return;
    }

    // 1. Verify User Authentication Status
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Guest user detected! Stop payment and show the Auth Required Modal popup
      openAuthModal({
        mode: "checkout",
        view: "login",
        title: "Login to Place Your Order",
        subtitle: "Please log in or create an account before completing payment. Your cart and delivery address are saved!",
        onSuccess: () => {
          toast.success("Welcome! Click Pay Now to proceed with your payment.");
        }
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // 2. Create Razorpay order on server with the discounted final total
      const chargeAmount = Math.max(1, finalTotal);
      const { success, order, error, keyId } = await createRazorpayOrder(chargeAmount);
      
      if (!success || !order) {
        toast.error(error || "Failed to create order. Please try again.");
        setIsCheckingOut(false);
        return;
      }

      const razorpayKey = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error("Razorpay Authentication Key is missing. Please check your environment configuration.");
        setIsCheckingOut(false);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "Vedhathiri's Premium Personal Care",
        description: appliedCoupon ? `Order with Coupon ${appliedCoupon.code}` : "Order Checkout",
        order_id: order.id,
        handler: async function (response: any) {
          // 4. Verify payment and save order on success
          const result = await verifyPaymentAndSaveOrder(
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            items,
            finalTotal,
            {
              customer_name: deliveryName.trim(),
              contact_number: deliveryPhone.trim(),
              shipping_address: deliveryAddress.trim(),
            },
            {
              coupon_code: appliedCoupon?.code || null,
              discount_amount: discount,
            }
          );

          if (result.success && result.orderId) {
            clearCart();
            setIsOpen(false);
            router.push(`/invoice/${result.orderId}?toast=payment_success`);
          } else {
            console.error("Payment verification result:", result);
            toast.error(`Payment verification failed: ${result.error || 'Unknown error'}. Please contact support.`);
          }
        },
        prefill: {
          name: deliveryName || user.user_metadata?.full_name || "Valued Customer",
          contact: deliveryPhone || user.user_metadata?.phone_number || "",
          email: user.email || "",
        },
        theme: {
          color: "#7c3aed", // violet-600
        },
        modal: {
          ondismiss: function () {
            toast.error("Payment cancelled.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error("An error occurred during checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer */}
        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b flex items-center justify-between bg-violet-50">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-violet-900">
              <ShoppingBag className="w-5 h-5 text-violet-600" />
              {showDeliveryForm ? "Checkout & Delivery" : "Your Shopping Cart"}
            </h2>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-violet-100 rounded-full transition-colors text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {showDeliveryForm ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-800">Shipping Details</h3>
                <button 
                  type="button" 
                  onClick={() => setShowDeliveryForm(false)} 
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline cursor-pointer"
                >
                  ← Back to Cart
                </button>
              </div>

              {/* Guest or Logged in Banner */}
              {currentUser ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-800">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Logged in as <strong>{currentUser.email}</strong></span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>You'll be prompted to sign in or register before final payment to track your order.</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="deliveryName">
                    Receiver's Full Name
                  </label>
                  <input
                    type="text"
                    id="deliveryName"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm text-gray-800 bg-gray-50/50"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="deliveryPhone">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    id="deliveryPhone"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm text-gray-800 bg-gray-50/50"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1" htmlFor="deliveryAddress">
                    Complete Shipping Address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm text-gray-800 bg-gray-50/50 resize-none"
                    placeholder="House/Flat No., Street, Landmark, City, State, Pincode"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4 py-16">
                  <ShoppingBag className="w-16 h-16 text-gray-300" />
                  <p className="text-base font-medium">Your cart is empty</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors font-medium text-sm shadow-md"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const imageUrl = item.images?.[0] || item.image_url;
                      return (
                        <div key={item.id} className="flex gap-4 border border-gray-100 rounded-2xl p-3.5 bg-white shadow-sm hover:shadow transition-shadow">
                          <div className="w-20 h-20 bg-violet-50 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden border border-violet-100">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-cover rounded-xl"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-violet-300" />
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-sm line-clamp-2 text-gray-800">{item.name}</h3>
                              <p className="text-violet-600 font-bold text-base mt-0.5">₹{item.price}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2.5 py-1">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded-full text-gray-700">
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold w-4 text-center text-gray-800">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded-full text-gray-700">
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button onClick={() => removeItem(item.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code & Coupon Section */}
                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                        <Ticket className="w-4 h-4 text-violet-600" />
                        Offers & Promo Codes
                      </span>

                      {availableCoupons.length > 0 && !appliedCoupon && (
                        <button
                          type="button"
                          onClick={() => setShowCouponList(!showCouponList)}
                          className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-0.5"
                        >
                          <span>{showCouponList ? "Hide Coupons" : `View Coupons (${availableCoupons.length})`}</span>
                          {showCouponList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Applied Coupon Card */}
                    {appliedCoupon ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between animate-in fade-in duration-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sm text-emerald-900">{appliedCoupon.code}</span>
                              <span className="text-[10px] uppercase font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded">Applied</span>
                            </div>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              {discount > 0 ? `You saved ₹${discount} on this order!` : "Coupon applied"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs font-bold text-red-500 hover:text-red-700 bg-white px-2 py-1 rounded-lg border border-red-100 shadow-2xs hover:bg-red-50 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Promo Code Input Box */}
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="Enter Promo Code"
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-200 focus:border-violet-600 outline-none text-xs font-mono font-bold uppercase text-gray-800 placeholder:normal-case placeholder:font-sans placeholder:font-normal"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon()}
                            disabled={isApplyingCoupon || !couponInput.trim()}
                            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
                          >
                            {isApplyingCoupon ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>Apply</span>
                            )}
                          </button>
                        </div>

                        {/* Collapsible Available Coupons List */}
                        {showCouponList && (
                          <div className="space-y-2 pt-2 animate-in slide-in-from-top-2 duration-200">
                            {availableCoupons.map((coupon) => {
                              const isEligible = !coupon.min_order_amount || subtotal >= coupon.min_order_amount;
                              return (
                                <div
                                  key={coupon.id}
                                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                                    isEligible
                                      ? "bg-violet-50/50 border-violet-100 hover:border-violet-300"
                                      : "bg-gray-50 border-gray-200 opacity-60"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-xs bg-white text-violet-800 px-2 py-0.5 rounded border border-violet-200">
                                        {coupon.code}
                                      </span>
                                      <span className="text-xs font-semibold text-gray-900">
                                        {coupon.discount_type === "percentage"
                                          ? `${coupon.discount_value}% OFF`
                                          : `₹${coupon.discount_value} OFF`}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">{coupon.description}</p>
                                    {coupon.min_order_amount > 0 && (
                                      <p className="text-[10px] text-gray-400 mt-0.5">
                                        Min order: ₹{coupon.min_order_amount} {coupon.max_discount_amount ? `| Max discount: ₹${coupon.max_discount_amount}` : ''}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(coupon.code)}
                                    disabled={!isEligible || isApplyingCoupon}
                                    className="px-3 py-1 bg-white hover:bg-violet-600 hover:text-white text-violet-700 border border-violet-200 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Apply
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          
          {items.length > 0 && (
            <div className="p-4 border-t bg-gray-50/80 space-y-3">
              {/* Pricing Breakdown */}
              <div className="space-y-1.5 px-1 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Coupon Discount ({appliedCoupon?.code})
                    </span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-bold text-lg text-violet-950 pt-2 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span className="text-xl text-violet-900">₹{finalTotal}</span>
                </div>
              </div>
              
              {showDeliveryForm ? (
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-600/25 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCheckingOut ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <span>Pay Now ₹{finalTotal}</span>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => setShowDeliveryForm(true)}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-600/25 transition-all flex justify-center items-center cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

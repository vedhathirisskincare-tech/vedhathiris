"use client";
import { useCartStore } from "../store/cartStore";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { createRazorpayOrder, verifyPaymentAndSaveOrder } from "@/app/actions/payment";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          if (user.user_metadata?.full_name) {
            setDeliveryName(user.user_metadata.full_name);
          }
          // Fetch phone from profile
          supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                if (profile.full_name) setDeliveryName(profile.full_name);
                if (profile.phone) setDeliveryPhone(profile.phone);
              }
            });
        }
      });
    } else {
      setShowDeliveryForm(false);
    }
  }, [isOpen]);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    if (!deliveryName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      alert("Please fill in all delivery details before proceeding to payment.");
      return;
    }

    setIsCheckingOut(true);

    try {
      // 1. Create order on server
      const { success, order, error } = await createRazorpayOrder(total);
      
      if (!success || !order) {
        alert("Failed to create order. Please try again.");
        setIsCheckingOut(false);
        return;
      }

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Vedhathiri's Premium Personal Care",
        description: "Order Checkout",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment and save order on success
          const result = await verifyPaymentAndSaveOrder(
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            items,
            total,
            {
              customer_name: deliveryName.trim(),
              contact_number: deliveryPhone.trim(),
              shipping_address: deliveryAddress.trim(),
            }
          );

          if (result.success && result.orderId) {
            clearCart();
            setIsOpen(false);
            router.push(`/invoice/${result.orderId}`);
          } else {
            console.error("Payment verification result:", result);
            alert(`Payment verification failed: ${result.error || 'Unknown error'}. Please contact support.`);
          }
        },
        prefill: {
          name: deliveryName || "Guest User",
          contact: deliveryPhone || "9999999999",
        },
        theme: {
          color: "#7c3aed", // violet-600
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error(err);
      alert("An error occurred during checkout.");
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
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-violet-600" />
              {showDeliveryForm ? "Checkout Details" : "Your Cart"}
            </h2>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-violet-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {showDeliveryForm ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-800">Delivery Address</h3>
                <button 
                  type="button" 
                  onClick={() => setShowDeliveryForm(false)} 
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline"
                >
                  ← Back to Cart
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="deliveryName">
                    Receiver's Full Name
                  </label>
                  <input
                    type="text"
                    id="deliveryName"
                    value={deliveryName}
                    onChange={(e) => setDeliveryName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm text-gray-800 bg-gray-50/50"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="deliveryPhone">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    id="deliveryPhone"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm text-gray-800 bg-gray-50/50"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" htmlFor="deliveryAddress">
                    Shipping Address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none text-sm text-gray-800 bg-gray-50/50 resize-none"
                    placeholder="Complete delivery address with pincode"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                  <ShoppingBag className="w-12 h-12 text-gray-300" />
                  <p>Your cart is empty</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border rounded-xl p-3 bg-white shadow-sm">
                    <div className="w-20 h-20 bg-violet-100 rounded-lg flex items-center justify-center shrink-0">
                      {(item.images?.[0] || item.image_url) ? (
                        <img src={item.images?.[0] || item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-violet-300" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-violet-600 font-semibold">₹{item.price}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded-full">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded-full">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:text-red-700 font-medium">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {items.length > 0 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between mb-4">
                <span className="font-medium text-gray-600">Subtotal</span>
                <span className="font-semibold text-lg">₹{total}</span>
              </div>
              
              {showDeliveryForm ? (
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isCheckingOut ? "Processing..." : "Pay Now"}
                </button>
              ) : (
                <button 
                  onClick={() => setShowDeliveryForm(true)}
                  className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex justify-center items-center cursor-pointer"
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

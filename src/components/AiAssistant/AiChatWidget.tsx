"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Bot,
  User as UserIcon,
  CreditCard,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useAuthModalStore } from "@/store/authModalStore";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/utils/supabase/client";
import { createRazorpayOrder, verifyPaymentAndSaveOrder } from "@/app/actions/payment";
import { useToast } from "@/components/Toast";

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string | null;
  size?: string;
  stock?: number;
  benefits?: string[];
  ingredients?: string[];
  description?: string;
}

export interface CheckoutActionData {
  productId: string;
  productName: string;
  size?: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  productCards?: ProductCardData[] | null;
  checkoutAction?: CheckoutActionData | null;
  orderSuccessId?: string | null;
  timestamp: string;
}

const INITIAL_GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "Namaste! Welcome to Vedhathiri's Skin Care. 🌿\n\nI am your exclusive AI Shopping Assistant for 100% natural, chemical-free herbal skincare and artisan soaps crafted in Chetpet, Chennai.\n\nAsk me about any product or skin concern to see our artisan creations!",
  timestamp: "Just now",
};

const SUGGESTED_QUESTIONS = [
  "Show me Banana Oats Soap",
  "What soaps do you have for dry skin?",
  "Recommend a product for hair growth",
  "What are the benefits of Aqua Bloom Mist?",
];

export default function AiChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { openAuthModal } = useAuthModalStore();
  const { addItem, setIsOpen: openCartDrawer } = useCartStore();

  const [isBotEnabled, setIsBotEnabled] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState<string | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if AI Bot is enabled by admin in Supabase (otherwise hidden from users)
  useEffect(() => {
    // Never show on admin pages
    if (pathname.startsWith("/admin")) {
      setIsBotEnabled(false);
      return;
    }

    let isMounted = true;
    const supabase = createClient();

    const fetchBotStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("offers")
          .select("is_active")
          .eq("message", "AI_ASSISTANT_ENABLED")
          .maybeSingle();

        if (isMounted) {
          // If row doesn't exist or is_active is false, bot stays hidden
          setIsBotEnabled(data ? Boolean(data.is_active) : false);
        }
      } catch (err) {
        if (isMounted) setIsBotEnabled(false);
      }
    };

    fetchBotStatus();

    // Subscribe to realtime updates on offers table so toggle reflects immediately
    const channel = supabase
      .channel("offers_ai_chat_status")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "offers",
          filter: "message=eq.AI_ASSISTANT_ENABLED",
        },
        (payload: any) => {
          if (payload.new && typeof payload.new.is_active === "boolean") {
            setIsBotEnabled(payload.new.is_active);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [pathname]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Load user profile for prefilling checkout
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setCurrentUser(user);
      if (user) {
        if (user.user_metadata?.full_name) setDeliveryName(user.user_metadata.full_name);
        if (user.user_metadata?.phone_number) setDeliveryPhone(user.user_metadata.phone_number);

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
    });
  }, []);

  // Helper to dynamically load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const toggleExpandCard = (cardId: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleAskDetails = (productName: string) => {
    handleSendMessage(`What are the benefits and ingredients of ${productName}?`);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      // Send conversation to backend /api/chat route
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
        signal: AbortSignal.timeout(15000),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      // Populate productCards from response or checkoutAction fallback
      let productCards: ProductCardData[] | null = data.productCards || null;
      if ((!productCards || productCards.length === 0) && data.checkoutAction) {
        productCards = [
          {
            id: data.checkoutAction.productId,
            name: data.checkoutAction.productName,
            price: data.checkoutAction.price,
            category: "Herbal Skincare",
            image: data.checkoutAction.image,
            size: data.checkoutAction.size,
          },
        ];
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I am here to help you with Vedhathiri's natural skincare.",
        productCards,
        checkoutAction: data.checkoutAction || null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn("Chat notice:", err?.message || err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I apologize, I am temporarily having trouble connecting. Please feel free to browse our products or contact our support team in Chetpet, Chennai.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setExpandedCardIds({});
  };

  // Add item to cart and open cart drawer
  const handleAddToCart = (item: {
    id: string;
    name: string;
    price: number;
    size?: string;
    image?: string | null;
    stock?: number;
    category?: string;
    description?: string;
  }) => {
    addItem(
      {
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        stock: item.stock || 10,
        category: item.category || "Herbal Skincare",
        images: item.image ? [item.image] : [],
      },
      item.size,
      item.price
    );
    setIsOpen(false);
    openCartDrawer(true);
    toast.success(`Added ${item.name} to your cart!`);
  };

  // Directly Execute Razorpay Checkout
  const handleExecuteRazorpay = async (item: {
    id: string;
    name: string;
    price: number;
    size?: string;
    quantity?: number;
    image?: string | null;
  }) => {
    setIsPaying(item.id);
    const qty = item.quantity || 1;
    const totalAmount = item.price * qty;

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Unable to load Razorpay payment gateway. Please check your internet connection.");
        setIsPaying(null);
        return;
      }

      let orderData: { success: boolean; order?: any; keyId?: string; error?: string } | null = null;
      try {
        const createRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount }),
        });
        if (createRes.ok) {
          orderData = await createRes.json();
        }
      } catch (fetchErr) {
        console.warn("Direct API create-order error in chat widget:", fetchErr);
      }

      if (!orderData || !orderData.success) {
        orderData = await createRazorpayOrder(totalAmount);
      }

      if (!orderData || !orderData.success || !orderData.order) {
        toast.error(orderData?.error || "Failed to create checkout order. Please try again.");
        setIsPaying(null);
        return;
      }

      const razorpayKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error("Razorpay API key is not configured.");
        setIsPaying(null);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "Vedhathiri's Skin Care",
        description: `Order: ${item.name} (${item.size || "Standard"})`,
        image: "/favicon.png",
        order_id: orderData.order.id,
        prefill: {
          name: currentUser?.user_metadata?.full_name || deliveryName || "Valued Customer",
          contact: currentUser?.user_metadata?.phone_number || deliveryPhone || "",
          email: currentUser?.email || "",
        },
        theme: {
          color: "#059669", // Herbal emerald green
        },
        handler: async function (response: any) {
          try {
            const cartItemPayload = [
              {
                id: item.id,
                name: item.name,
                description: "",
                price: item.price,
                stock: 10,
                category: "Herbal Skincare",
                quantity: qty,
                cartItemId: `${item.id}-${item.size || "default"}`,
                selectedSize: item.size,
              },
            ];

            let result: { success: boolean; orderId?: string; error?: string } | null = null;
            try {
              const verifyRes = await fetch("/api/payment/verify-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentData: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  },
                  items: cartItemPayload,
                  totalAmount,
                  deliveryInfo: {
                    customer_name: currentUser?.user_metadata?.full_name || deliveryName || "Online Customer",
                    contact_number: currentUser?.user_metadata?.phone_number || deliveryPhone || "",
                    shipping_address: shippingAddress || "Direct AI Assistant Order (Chetpet, Chennai)",
                  },
                  userId: currentUser?.id || null,
                }),
              });
              if (verifyRes.ok) {
                result = await verifyRes.json();
              }
            } catch (vErr) {
              console.warn("Direct verify-order API error in chat widget:", vErr);
            }

            if (!result || !result.success) {
              result = await verifyPaymentAndSaveOrder(
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                cartItemPayload,
                totalAmount,
                {
                  customer_name: currentUser?.user_metadata?.full_name || deliveryName || "Online Customer",
                  contact_number: currentUser?.user_metadata?.phone_number || deliveryPhone || "",
                  shipping_address: shippingAddress || "Direct AI Assistant Order (Chetpet, Chennai)",
                }
              );
            }

            setIsPaying(null);

            if (result?.success && result.orderId) {
              toast.success("Payment successful! Your order has been placed.");

              // Add success confirmation message into chat with direct link to PDF invoice
              const confirmationMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: `🎉 **Payment Verified Successfully!**\n\nThank you for choosing Vedhathiri's 100% natural herbal care. Your order for **${item.name}** has been confirmed.\n\nA detailed PDF receipt has been automatically generated and saved to your order history.`,
                orderSuccessId: result.orderId,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              };

              setMessages((prev) => [...prev, confirmationMsg]);
            } else {
              toast.error(result?.error || "Payment verification failed. Please contact support.");
            }
          } catch (err: any) {
            console.warn("Payment verification error:", err);
            toast.error("An error occurred while confirming your order.");
            setIsPaying(null);
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(null);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        toast.error(resp?.error?.description || "Payment failed. Please try again.");
        setIsPaying(null);
      });

      rzp.open();
    } catch (err: any) {
      console.warn("Razorpay execution error:", err);
      toast.error(err.message || "An error occurred during payment.");
      setIsPaying(null);
    }
  };

  // If bot is disabled by admin or initial check is pending, keep completely hidden from user
  if (!isBotEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Vedhathiri AI Shopping Assistant"
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-500/30 cursor-pointer"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-300"></span>
            </span>
            <Sparkles className="w-5 h-5 text-emerald-300 group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium text-sm tracking-wide pr-1">Ask Vedha AI</span>
          </button>
        )}
      </div>

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[430px] h-[620px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 font-sans">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base tracking-wide text-emerald-50">
                    Vedha AI
                  </h3>
                  <span className="text-[10px] uppercase font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Herbal Advisor
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Chetpet, Chennai • 100% Organic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-emerald-200/80 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-stone-50/60 to-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[88%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Text bubble */}
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-br-none shadow-sm"
                      : "bg-white text-stone-800 border border-emerald-100 shadow-sm rounded-bl-none whitespace-pre-line"
                      }`}
                  >
                    {msg.content}

                    {/* PDF Receipt Link if order was completed */}
                    {msg.orderSuccessId && (
                      <div className="mt-3 pt-3 border-t border-emerald-100 flex flex-col gap-2">
                        <Link
                          href={`/invoice/${msg.orderSuccessId}`}
                          target="_blank"
                          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-semibold py-2 px-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          View & Download PDF Receipt
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </Link>
                        <Link
                          href="/profile?tab=orders"
                          className="text-[11px] text-center text-emerald-700 hover:underline"
                        >
                          View in Order History →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Product Cards: Visual & Interactive with Buy/Add-to-bag */}
                  {msg.productCards && msg.productCards.length > 0 && (
                    <div className="mt-2.5 w-full flex flex-col gap-3">
                      {msg.productCards.map((card) => {
                        const isExpanded = !!expandedCardIds[card.id];
                        const hasDetails =
                          (card.ingredients && card.ingredients.length > 0) ||
                          (card.benefits && card.benefits.length > 0) ||
                          Boolean(card.description);

                        return (
                          <div
                            key={card.id}
                            className="bg-white rounded-2xl border border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all p-3.5 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-200"
                          >
                            {/* Card Top Row: Thumbnail + Category + In Stock + Name + Size + Price */}
                            <div className="flex gap-3 items-center">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-50 shrink-0 border border-stone-200">
                                {card.image ? (
                                  <Image
                                    src={card.image}
                                    alt={card.name}
                                    fill
                                    sizes="64px"
                                    unoptimized
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200/60 truncate max-w-[120px]">
                                    {card.category || "Herbal Care"}
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    In Stock
                                  </span>
                                </div>

                                <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 leading-snug truncate">
                                  {card.name}
                                </h4>

                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-[11px] text-stone-500 font-medium">
                                    {card.size || "Standard"}
                                  </span>
                                  <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                                    ₹{card.price}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Collapsible Benefits & Key Ingredients peek */}
                            {hasDetails && (
                              <div className="pt-2 border-t border-stone-100">
                                <button
                                  type="button"
                                  onClick={() => toggleExpandCard(card.id)}
                                  className="w-full flex items-center justify-between text-[11px] text-stone-600 hover:text-emerald-800 font-medium py-1 transition-colors group cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-emerald-600" />
                                    {isExpanded ? "Hide Details" : "View Benefits & Key Ingredients"}
                                  </span>
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                      }`}
                                  />
                                </button>

                                {isExpanded && (
                                  <div className="mt-2 p-2.5 bg-stone-50/90 rounded-xl text-xs space-y-2 border border-stone-100 animate-in fade-in duration-200">
                                    {card.ingredients && card.ingredients.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                                          🌿 Key Ingredients
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                          {card.ingredients.map((ing, i) => (
                                            <span
                                              key={i}
                                              className="text-[10px] bg-white border border-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md"
                                            >
                                              {ing}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {card.benefits && card.benefits.length > 0 && (
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                                          ✨ Herbal Benefits
                                        </p>
                                        <ul className="text-[11px] text-stone-700 space-y-1 list-disc list-inside">
                                          {card.benefits.slice(0, 3).map((b, i) => (
                                            <li key={i} className="leading-tight">
                                              {b}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => handleAskDetails(card.name)}
                                      className="w-full text-center text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold pt-1 underline cursor-pointer"
                                    >
                                      Ask AI more about this product →
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Action Buttons: Pay with Razorpay & Add to Bag */}
                            <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                              <button
                                onClick={() => handleExecuteRazorpay(card)}
                                disabled={isPaying === card.id}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-semibold py-2.5 px-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isPaying === card.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Opening...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5" />
                                    Pay with Razorpay (₹{card.price})
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleAddToCart(card)}
                                title="Add to cart and view in bag"
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium py-2.5 px-3 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer shrink-0"
                              >
                                <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                                Add to Bag
                              </button>
                            </div>

                            <p className="text-[9.5px] text-stone-400 text-center flex items-center justify-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Direct Chetpet Dispatch • Instant PDF Invoice
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <span className="text-[10px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Loading Animation */}
            {isLoading && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-emerald-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            {/* Quick Prompts on initial conversation */}
            {messages.length === 1 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 px-1">
                  Popular Inquiries
                </p>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left text-xs bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 p-2.5 rounded-xl border border-stone-200/80 hover:border-emerald-300 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                    >
                      <span>{q}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, ingredients, or order..."
              disabled={isLoading}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:hover:bg-emerald-700 transition-colors shadow-sm shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

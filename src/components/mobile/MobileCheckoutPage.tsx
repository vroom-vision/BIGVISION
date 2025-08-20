"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
    },
  }),
};
import { useCart } from "@/contexts/CartContext";
import StarsCanvas from "@/components/StarBackground";
import { Button } from "@/components/ui/button";
import RazorpayLogo from "@/components/ui/RazorpayLogo";
import PayPalLogo from "@/components/ui/PayPalLogo";

const MobileCheckoutPage: React.FC = () => {
  // Exchange rate USD to INR
  const USD_TO_INR = 85.85;
  // Dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) return resolve(true);
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  const { cart, removeFromCart, getTotalPrice } = useCart();
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountSuccess, setDiscountSuccess] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountApplying, setDiscountApplying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'cancelled' | 'failed'>('idle');

  // Payment logic
  const discountPercent = discountSuccess ? 10 : 0;
  const totalPriceUSD = getTotalPrice();
  const discountAmountUSD = Math.round(totalPriceUSD * (discountPercent / 100));
  const finalTotalUSD = totalPriceUSD - discountAmountUSD;

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    if (!email || !isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    setPaymentStatus('processing');
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Failed to load Razorpay SDK.');
      setPaymentStatus('idle');
      return;
    }
    try {
      // Convert USD to INR for Razorpay
      const amountINR = Math.round(finalTotalUSD * USD_TO_INR);
      // Create order on backend
      const orderResponse = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountINR,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          email,
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || 'Order creation failed');
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_myXHywY5WTMuIg',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Vroom Visions',
        description: 'Product Purchase',
        order_id: orderData.id,
        handler: async function (response: unknown) {
          try {
            await fetch("/api/razorpay/invoice", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email,
                amount: orderData.amount,
                currency: orderData.currency,
                product: cart.map(item => item.product.name).join(", "),
                invoiceId: orderData.id,
                paymentMethod: "Razorpay"
              })
            });
          } catch (err) {
            // ignore
          }
          window.location.href = `/payment-success?email=${encodeURIComponent(email)}`;
        },
        prefill: { email },
        theme: { color: '#a259ff' },
      };
      // @ts-expect-error: Razorpay is attached to window by the script
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      const err = error as Error;
      alert(err.message || 'Payment could not be processed');
      setPaymentStatus('idle');
    }
  };

  // PayPal Payment Handler
  const handlePayPalPayment = async () => {
    if (!email || !isValidEmail(email)) {
      alert('Please enter a valid email address.');
      return;
    }
    setPaymentStatus('processing');
    try {
      // Always send USD and correct amount for PayPal
      const orderResponse = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotalUSD, // still in cents
          currency: 'USD',
          email,
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || 'Order creation failed');
      if (orderData.approvalUrl) {
        window.location.href = orderData.approvalUrl;
      } else {
        throw new Error('PayPal approval URL not received');
      }
    } catch (error) {
      const err = error as Error;
      alert(err.message || 'Payment could not be processed');
      setPaymentStatus('idle');
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      custom={1}
    >
      {/* Background video and stars */}
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-[1]" />
          <video
            className="absolute top-0 left-0 min-w-full min-h-full object-cover opacity-80"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/blackhole.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
        <StarsCanvas />
      </div>
      <div className="container mx-auto px-4 py-16 relative z-10" style={{ paddingTop: '90px' }}>
        <motion.h1 className="text-2xl font-bold mb-8 text-white" variants={fadeInUp} custom={2}>Checkout</motion.h1>
        <motion.div className="bg-purple-900/20 backdrop-blur-md p-6 rounded-lg shadow-glow border border-white/10" variants={fadeInUp} custom={3}>
          <h2 className="text-lg font-bold mb-4 text-white">Order Summary</h2>
          <div className="border-b border-white/10 pb-4 mb-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex mb-4 p-2 rounded-lg bg-purple-950/40 backdrop-blur-sm border border-white/5">
                <img
                  src={Array.isArray(item.product.imageUrl) ? item.product.imageUrl[0] : item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded object-cover border border-white/10"
                />
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-white text-base">{item.product.name}</h3>
                  <div className="font-medium mt-1 text-white">${((item.product.price * item.quantity) / 100).toFixed(2)} USD</div>
                </div>
                <button
                  className="ml-auto text-gray-400 hover:text-white hover:bg-red-500/20 p-1 rounded-full transition-colors"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm mb-4 p-3 rounded-lg bg-purple-950/40 backdrop-blur-sm border border-white/5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-white">${(totalPriceUSD / 100).toFixed(2)} USD</span>
            </div>
            {discountSuccess && (
              <div className="flex justify-between text-green-400">
                <span>Discount (10%)</span>
                <span>- ${((discountAmountUSD) / 100).toFixed(2)} USD</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>Calculated at next step</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg p-3 rounded-lg bg-purple-950/40 backdrop-blur-sm border border-white/5 mt-4">
            <span>Total</span>
            <span className="text-white">${(finalTotalUSD / 100).toFixed(2)} USD</span>
          </div>
        </motion.div>
        <motion.div className="bg-purple-900/20 backdrop-blur-md p-6 rounded-lg shadow-glow border border-white/10 mt-8" variants={fadeInUp} custom={4}>
          <h2 className="text-lg font-bold mb-4 text-white">Contact Information</h2>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full bg-purple-950/40 backdrop-blur-md border border-white/10 rounded-md px-4 py-2 mb-4 text-white"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <div className="mb-4">
            <input
              type="text"
              placeholder="Discount code"
              className="flex-1 bg-purple-950/40 backdrop-blur-md border border-white/10 rounded-md px-4 py-2 text-white"
              value={discountCode}
              onChange={e => setDiscountCode(e.target.value)}
            />
            <button
              className="ml-2 bg-purple-600/70 hover:bg-purple-600 text-white px-4 py-2 rounded-md shadow-glow border border-white/10"
              onClick={async () => {
                setDiscountError(null);
                setDiscountSuccess(false);
                setDiscountApplying(true);
                try {
                  if (discountCode.trim().toUpperCase() === "VISION10") {
                    setDiscountSuccess(true);
                    setDiscountError(null);
                  } else {
                    setDiscountError("Invalid or expired code");
                    setDiscountSuccess(false);
                  }
                } catch {
                  setDiscountError("Something went wrong");
                  setDiscountSuccess(false);
                } finally {
                  setDiscountApplying(false);
                }
              }}
              disabled={!discountCode || discountApplying}
              type="button"
            >
              {discountApplying ? 'Applying...' : 'Apply'}
            </button>
            {discountError && (
              <div className="text-red-400 text-xs mt-1">{discountError}</div>
            )}
            {discountSuccess && (
              <div className="text-green-400 text-xs mt-1">Discount applied!</div>
            )}
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#7f53ac] to-[#657ced] text-white py-3 rounded-md font-semibold shadow-glow border border-white/10 mt-2 flex items-center justify-center gap-2 text-lg tracking-wide"
            onClick={handleRazorpayPayment}
            disabled={paymentStatus === 'processing'}
            style={{ minHeight: 33, fontFamily: 'inherit' }}
          >
            <RazorpayLogo />
          </Button>
          <Button
            className="w-full bg-gradient-to-r from-[#003087] to-[#0070ba] text-white py-3 rounded-md font-semibold shadow-glow border border-white/10 mt-2 flex items-center justify-center gap-2 text-lg tracking-wide"
            onClick={handlePayPalPayment}
            disabled={paymentStatus === 'processing'}
            style={{ minHeight: 33, fontFamily: 'inherit' }}
          >
            <PayPalLogo />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MobileCheckoutPage;

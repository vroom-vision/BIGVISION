"use client";

import React from "react";
import StarsCanvas from "@/components/StarBackground";
import products, { Product } from "@/data/products";
import MobileProduct from "./MobileProduct";

const MobileProductsPage: React.FC = () => (
  <>
    {/* Mobile background and stars */}
    <div
      className="fixed inset-0 z-[-1] w-screen h-screen overflow-hidden"
      style={{ minHeight: '100dvh', minWidth: '100vw' }}
    >
      <div className="absolute inset-0 bg-black" style={{ zIndex: 0 }} />
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-black/40" style={{ zIndex: 2 }} />
        <video
          className="absolute top-0 left-0"
          style={{
            width: '100vw',
            height: '100dvh',
            minWidth: '100vw',
            minHeight: '100dvh',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: 0.8,
            zIndex: 1,
            background: '#000',
            maxWidth: 'none',
            maxHeight: 'none',
            pointerEvents: 'none',
          }}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/blackhole.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
    <div
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 3 }}
    >
      <StarsCanvas />
    </div>
    <div className="container mx-auto px-4 py-16 relative z-10" style={{ paddingTop: '90px' }}>
      <h1 className="text-2xl font-bold mb-8 text-center text-white">All Products</h1>
      <div className="grid grid-cols-1 gap-6">
        {products.map((product: Product) => (
          <MobileProduct
            key={product.id}
            image={product.imageUrl[0]}
            title={product.name}
            price={`₹${(product.price / 100).toFixed(2)}`}
          />
        ))}
      </div>
    </div>
  </>
);

export default MobileProductsPage;

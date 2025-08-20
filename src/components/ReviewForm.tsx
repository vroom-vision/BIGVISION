"use client";

import React from "react";


import { useState } from "react";
import { Star } from "lucide-react";

const ReviewForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !review || rating === 0) {
      setError("Please fill all fields and give a rating.");
      return;
    }
    setError("");
    setSubmitted(true);
    // Here you can add API call to save review
  };

  if (submitted) {
    return (
      <div className="text-center text-green-400 font-semibold text-lg">
        Thank you for sharing your experience!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-purple-900/20 p-6 rounded-lg shadow-glow">
      <div className="mb-4">
        <label className="block text-white mb-1">Name</label>
        <input
          type="text"
          className="w-full p-2 rounded bg-purple-950/40 border border-white/10 text-white placeholder-gray-400"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your Name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-1">Email</label>
        <input
          type="email"
          className="w-full p-2 rounded bg-purple-950/40 border border-white/10 text-white placeholder-gray-400"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-1">Your Experience</label>
        <textarea
          className="w-full p-2 rounded bg-purple-950/40 border border-white/10 text-white placeholder-gray-400"
          rows={4}
          value={review}
          onChange={e => setReview(e.target.value)}
          placeholder="Share your honest feedback..."
        />
      </div>
      <div className="mb-4">
        <label className="block text-white mb-1">Your Rating</label>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                size={28}
                className={
                  (hoverRating || rating) >= star
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-500"
                }
                strokeWidth={1.5}
                fill={(hoverRating || rating) >= star ? "#facc15" : "none"}
              />
            </button>
          ))}
        </div>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <button
        type="submit"
        className="bg-gradient-to-r from-brand-purple to-purple-500 text-white px-8 py-2 rounded shadow-glow hover:scale-105 transition-all flex items-center gap-2 justify-center mt-2"
      >
        <Star size={18} className="text-yellow-400" /> Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;

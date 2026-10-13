'use client';

import React, { useState } from 'react';
import { Envelope, CheckCircle, ArrowRight } from '@phosphor-icons/react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="bg-slate-900 text-white py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-800/80 p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              Exclusive Member Benefits
            </span>
            <h3 className="text-2xl sm:text-3xl font-black mt-1 text-white tracking-tight">
              Get 10% Off Your Next Print Order
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Subscribe to receive instant discounts, seasonal promotions, and early notice on same-day bulk offers.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            {submitted ? (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-3">
                <CheckCircle weight="fill" className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">You&apos;re subscribed!</div>
                  <div className="text-emerald-300 mt-0.5">
                    Use code <span className="font-mono font-bold text-white bg-emerald-800 px-2 py-0.5 rounded">FIRSTPRINT10</span> at checkout or when calling.
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full sm:w-96">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-blue-500/20"
                  />
                  <Envelope weight="bold" className="h-4 w-4 text-slate-500 absolute left-3.5 top-4" />
                </div>
                <button
                  type="submit"
                  className="h-12 px-6 rounded-xl bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold text-sm shadow-md transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Claim 10% Off</span>
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

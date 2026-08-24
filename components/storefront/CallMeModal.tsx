'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CheckCircle2, Clock, MapPin, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCallMe } from './CallMeContext';
import { submitInquiry } from '@/lib/db';

export function CallMeModal() {
  const { isOpen, closeCallMe, productContext, selectedOptions } = useCallMe();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phone.trim()) {
      setErrorMessage('Please enter a valid UK phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiry({
        type: 'call_me',
        name: name.trim() || undefined,
        phone: phone.trim(),
        details: details.trim() || undefined,
        productTitle: productContext || undefined,
        selectedOptions: selectedOptions && Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        // Reset after 3 seconds
        setName('');
        setPhone('');
        setDetails('');
        setIsSubmitted(false);
        closeCallMe();
      }, 3000);
    } catch (err) {
      setErrorMessage('Failed to submit. You can call us directly on 020 8123 4567.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMessage('');
    closeCallMe();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSubmitted ? 'Request Received!' : 'Request a Fast Call Back'}
      description={
        isSubmitted
          ? 'Our London print specialist is reviewing your inquiry and will call you back within 15 minutes.'
          : 'Speak with our print specialists for instant same-day turnaround, artwork checks & bulk pricing.'
      }
      maxWidth="md"
    >
      {isSubmitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-6 text-center"
        >
          <div className="rounded-full bg-emerald-50 p-4 ring-8 ring-emerald-50/50 mb-4 text-emerald-600">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">We&apos;re On It!</h4>
          <p className="mt-1 text-sm text-slate-600 max-w-xs">
            We received your number <strong>{phone}</strong>. Expect a call shortly!
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 w-full pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">Need an answer right now?</p>
            <a
              href="tel:02081234567"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#4a0e35] hover:underline"
            >
              <Phone className="h-4 w-4" /> Call us directly: 020 8123 4567
            </a>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {productContext && (
            <div className="rounded-xl bg-[#4a0e35]/5 p-3 border border-[#4a0e35]/15 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#4a0e35] font-medium">
                <Sparkles className="h-4 w-4 shrink-0 text-[#4a0e35]" />
                <span>
                  Inquiry for: <strong>{productContext}</strong>
                </span>
              </div>
              {selectedOptions && Object.keys(selectedOptions).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#4a0e35]/10">
                  {Object.entries(selectedOptions).map(([key, val]) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-white text-[#4a0e35] text-[11px] font-semibold border border-[#4a0e35]/20 shadow-2xs"
                    >
                      <span className="text-slate-500 mr-1">{key}:</span> {val}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5 font-medium text-emerald-700">
              <Clock className="h-3.5 w-3.5" />
              <span>Avg Call Back: ~15 Mins</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>75 Green St, London</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35] focus:ring-2 focus:ring-[#4a0e35]/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 07123 456789 or 020 8123 4567"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35] focus:ring-2 focus:ring-[#4a0e35]/10 transition-all placeholder:text-slate-400"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              What are you looking to print? (Optional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. 500 Business cards needed by 4pm today..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35] focus:ring-2 focus:ring-[#4a0e35]/10 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-600 border border-rose-100">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              type="submit"
              variant="plum"
              size="lg"
              isLoading={isSubmitting}
              className="w-full flex-1"
            >
              <Phone className="h-4 w-4 mr-2" />
              Request Call Back
            </Button>
            <a
              href="tel:02081234567"
              className="inline-flex items-center justify-center h-12 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Direct Call
            </a>
          </div>

          <div className="text-center">
            <Badge variant="sameday" className="text-[10px] py-1 px-2.5">
              ⚡ Same Day London Collection & Delivery Available
            </Badge>
          </div>
        </form>
      )}
    </Modal>
  );
}

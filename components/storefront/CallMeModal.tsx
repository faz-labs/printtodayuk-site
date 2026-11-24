'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CheckCircle, Clock, MapPin, Sparkle, EnvelopeSimple, WhatsappLogo } from '@phosphor-icons/react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCallMe } from './CallMeContext';
import { submitInquiry } from '@/lib/db';
import { trackGenerateLead, trackWhatsAppClick, trackCallClick } from '@/lib/analytics';

export function CallMeModal() {
  const { isOpen, closeCallMe, productContext, selectedOptions } = useCallMe();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const buildWhatsAppUrlForModal = () => {
    let msg = `Hi Print Today UK, I would like to request an instant quote / callback:\n\n`;
    if (productContext) msg += `📄 *Inquiry For:* ${productContext}\n`;
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      msg += `📋 *Specifications:*\n`;
      for (const [k, v] of Object.entries(selectedOptions)) {
        msg += `• ${k}: ${v}\n`;
      }
    }
    if (name.trim()) msg += `👤 *Name:* ${name.trim()}\n`;
    if (phone.trim()) msg += `📞 *Phone:* ${phone.trim()}\n`;
    if (email.trim()) msg += `✉️ *Email:* ${email.trim()}\n`;
    if (details.trim()) msg += `💬 *Notes:* ${details.trim()}\n`;
    return `https://wa.me/447969559746?text=${encodeURIComponent(msg)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phone.trim()) {
      setErrorMessage('Please enter a valid UK phone number.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous Customer',
          phone: phone.trim(),
          email: email.trim(),
          productContext: productContext || 'General Inquiry',
          selectedOptions: selectedOptions || {},
          details: details.trim(),
        }),
      });

      if (!res.ok) {
        // Fallback to client-side direct submit if API returned non-200
        await submitInquiry({
          name: name.trim() || 'Anonymous Customer',
          phone: phone.trim(),
          email: email.trim(),
          productContext: productContext || 'General Inquiry',
          selectedOptions: selectedOptions || {},
          details: details.trim(),
          status: 'pending',
        });
      }

      setIsSubmitted(true);
      trackGenerateLead('callback', { product: productContext || 'General' });
    } catch (err) {
      // In case fetch threw network error, attempt direct submitInquiry
      try {
        await submitInquiry({
          name: name.trim() || 'Anonymous Customer',
          phone: phone.trim(),
          email: email.trim(),
          productContext: productContext || 'General Inquiry',
          selectedOptions: selectedOptions || {},
          details: details.trim(),
          status: 'pending',
        });
        setIsSubmitted(true);
        trackGenerateLead('callback', { product: productContext || 'General' });
      } catch (directErr) {
        console.error('Call Me submission error:', directErr);
        setErrorMessage('Failed to submit. You can call or WhatsApp us on +44 7969 559746.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    closeCallMe();
    // Reset state after transition
    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setPhone('');
      setEmail('');
      setDetails('');
      setErrorMessage('');
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSubmitted ? 'Call Request Received' : 'Need Same-Day Print Advice?'}
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
            <CheckCircle weight="fill" className="h-10 w-10 animate-bounce" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">We&apos;re On It!</h4>
          <p className="mt-1 text-sm text-slate-600 max-w-xs">
            We received your number <strong>{phone}</strong>. Expect a call shortly!
          </p>

          <div className="mt-6 flex flex-col items-center gap-2 w-full pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Need an immediate answer?</p>
            <a
              href="tel:03300103521"
              className="w-full py-2.5 px-4 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Phone weight="fill" className="h-4 w-4 text-cyan-300" />
              <span>Call hotline: 0330 010 3521</span>
            </a>
            <p className="text-[11px] text-slate-400">
              or WhatsApp / mobile:{' '}
              <a
                href="https://wa.me/447969559746"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline"
              >
                +44 7969 559746
              </a>
            </p>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {productContext && (
            <div className="rounded-xl bg-[#012169]/5 p-3 border border-[#012169]/15 space-y-2">
              <div className="flex items-center gap-2 text-xs text-[#012169] font-medium">
                <Sparkle weight="fill" className="h-4 w-4 shrink-0 text-[#C8102E]" />
                <span>
                  Inquiry for: <strong>{productContext}</strong>
                </span>
              </div>
              {selectedOptions && Object.keys(selectedOptions).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#012169]/10">
                  {Object.entries(selectedOptions).map(([key, val]) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-white text-[#012169] text-[11px] font-semibold border border-[#012169]/20 shadow-2xs"
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
              <Clock weight="bold" className="h-3.5 w-3.5" />
              <span>Avg Call Back: ~15 Mins</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <MapPin weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
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
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 07969 559746 or 0330 010 3521"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 transition-all placeholder:text-slate-400"
              />
              <Phone weight="fill" className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah.jenkins@example.com"
                className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 transition-all placeholder:text-slate-400"
              />
              <EnvelopeSimple weight="fill" className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
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
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-100">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="submit"
                variant="uk-red"
                size="lg"
                isLoading={isSubmitting}
                className="w-full flex-1"
              >
                <Phone weight="fill" className="h-4 w-4 mr-2" />
                Request Call Back
              </Button>
              <a
                href="tel:+447969559746"
                className="inline-flex items-center justify-center h-12 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Direct Call
              </a>
            </div>

            {/* Prioritized instant WhatsApp option */}
            <div className="pt-1.5 border-t border-slate-100 text-center">
              <a
                href={buildWhatsAppUrlForModal()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-colors"
              >
                <WhatsappLogo weight="fill" className="h-4.5 w-4.5" />
                <span>Prefer WhatsApp? Instant Chat &amp; Send</span>
              </a>
            </div>
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

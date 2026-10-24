'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PaperPlaneTilt,
  CheckCircle,
  WarningCircle,
  WhatsappLogo,
  Phone,
  Sparkle,
} from '@phosphor-icons/react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Enquiry');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a contact telephone number.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please provide project details or a message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact message.');
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setErrorMessage(
        err.message || 'Something went wrong. You can also call us directly on 0330 010 3521.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSubject('General Enquiry');
    setMessage('');
    setIsSuccess(false);
    setErrorMessage('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/50 relative overflow-hidden">
      {/* Top Brand Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#012169] via-[#C8102E] to-[#012169]" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-10 text-center space-y-5"
          >
            <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle weight="fill" className="h-10 w-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Message Sent Successfully!
              </h3>
              <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{name}</strong>. Your enquiry has been received and forwarded to{' '}
                <span className="font-bold text-[#012169]">sales@printtodayuk.com</span>. Our London studio specialists will respond shortly!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold text-slate-900">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Subject:</span>
                <span className="font-bold text-[#012169]">{subject}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I%20just%20submitted%20a%20website%20enquiry."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
                <span>Chat Instantly on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
                <span>Fast Direct Enquiry</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Send Us a Message
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                Messages go directly to <strong className="text-slate-800">sales@printtodayuk.com</strong>. We aim to reply within 30 minutes during studio hours.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <WarningCircle weight="fill" className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all shadow-2xs"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah@example.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 07969 559746 or 0330 010 3521"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all shadow-2xs"
                />
              </div>

              {/* Subject / Service Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Service / Subject Required
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Same-Day Express Print">Same-Day Express Print (London Rush)</option>
                  <option value="Bespoke Quote & Large Format">Bespoke Quote &amp; Large Format</option>
                  <option value="Custom Clothing & Embroidery">Custom Clothing &amp; Embroidery</option>
                  <option value="Flyers & Business Cards">Flyers, Leaflets &amp; Business Cards</option>
                  <option value="Exhibition & Banner Stands">Exhibition Displays &amp; Roller Banners</option>
                  <option value="Trade & Agency Account">Trade / Agency Reseller Account</option>
                  <option value="Artwork / Prepress Support">Artwork Setup &amp; File Check</option>
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Project Details / Specifications <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your requirements (e.g. Quantity, dimensions/size, preferred paper stock or garment color, and required delivery date)..."
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all resize-none shadow-2xs"
              />
            </div>

            {/* Submission button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-sm font-extrabold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending to Sales Team...</span>
                  </>
                ) : (
                  <>
                    <PaperPlaneTilt weight="bold" className="h-4 w-4" />
                    <span>Submit Enquiry to sales@printtodayuk.com</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              🔒 Your details are protected under UK GDPR. We will never share your email with third parties.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

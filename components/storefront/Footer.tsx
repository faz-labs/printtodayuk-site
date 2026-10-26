'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FacebookLogo,
  XLogo,
  LinkedinLogo,
  YoutubeLogo,
  InstagramLogo,
  TiktokLogo,
  Printer,
  X,
  Phone,
  Sparkle,
  MapPin,
  Clock,
} from '@phosphor-icons/react';
import { useCallMe } from './CallMeContext';

export function Footer() {
  const { openCallMe } = useCallMe();
  const [activeModal, setActiveModal] = useState<{ title: string; content: string } | null>(null);

  const handleInfo = (title: string, content: string) => {
    setActiveModal({ title, content });
  };

  return (
    <footer className="w-full bg-white text-slate-800 font-sans selection:bg-[#C8102E] selection:text-white border-t border-slate-200/60">
      {/* 1. At very top: Blue that we used at top (#012169) */}
      <div className="w-full h-2.5 sm:h-3 bg-[#012169]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-8">
        {/* 2. Solopress-style 5 Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 pb-12">
          {/* Column 1: ABOUT US */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-wider uppercase mb-3.5 sm:mb-4">
              ABOUT US
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Environment & Sustainability',
                      'Print Today UK is committed to eco-friendly printing. We use FSC-certified sustainable papers, non-toxic vegetable-based inks, and recycled packaging across our London production hub.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Environment
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'This is Print Today',
                      'Print Today UK is London’s premier local digital print and apparel specialist, offering express same-day turnaround, precision color reproduction, and in-house digital printing.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  This is Print Today
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Studio Equipment & Plant List',
                      'Our East London facility operates industrial Xerox Versant production presses, Mimaki wide-format UV roll-to-roll printers, Morgana digital crease/fold units, and high-speed laser die cutters.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Plant List
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'White Label Trade Printing',
                      'We print, pack, and ship directly to your clients in completely unbranded, plain white packaging with your return address. Ideal for design agencies, brokers, and print resellers.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  White Label
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: HELP */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-wider uppercase mb-3.5 sm:mb-4">
              HELP
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
              <li>
                <Link
                  href="/same-day-printing"
                  className="hover:text-[#012169] transition-colors block"
                >
                  Delivery Information
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Frequently Asked Questions',
                      'Turnaround times: Same-day dispatch or studio collection available on orders approved before 2 PM. File formats: We prefer print-ready PDF with 3mm bleed and 300 DPI resolution. Payment: All major cards and invoice accounts supported.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Print Terminology Glossary',
                      'GSM: Grams per square meter (paper weight). Bleed: 3mm extra background margin trimmed off after printing. CMYK: Cyan, Magenta, Yellow, Key (Black) color model for commercial offset and digital presses.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Glossary
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Printing Paper Sizes',
                      'Standard ISO paper sizes: A7 (74x105mm), A6 (105x148mm), A5 (148x210mm), A4 (210x297mm), A3 (297x420mm), A2 (420x594mm), A1 (594x841mm), A0 (841x1189mm). Custom sizes available upon request.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Printing Paper Sizes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Support & Setup Guides',
                      'Need help formatting your artwork? Our London prepress specialists offer free digital proofing and artwork checks before every production run.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Support Guides
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Supplying Artwork Guidelines',
                      'Please export your design in CMYK mode, convert all fonts to outlines/curves, maintain 300 DPI resolution, and include 3mm bleed on all trimmed edges.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Supplying Artwork
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Free Downloadable Templates',
                      'Blank layout templates for Adobe Illustrator, Photoshop, InDesign, and Canva are available for business cards, flyers, roller banners, and booklets.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Templates
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTACT US */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-wider uppercase mb-3.5 sm:mb-4">
              CONTACT US
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => openCallMe()}
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer font-semibold text-[#012169]"
                >
                  Bespoke Quote
                </button>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="hover:text-[#012169] transition-colors block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Current Vacancies',
                      'Join our energetic print production, graphic design, and studio team in London. Email your portfolio and CV to careers@printtodayuk.com.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Current Vacancies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Customer Care & Feedback',
                      'We take quality seriously. If you have any questions or concerns about an order, please email info@printtodayuk.com or call 0330 010 3521 for immediate resolution.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Raise a Concern
                </button>
              </li>
              {/* Studio Location */}
              <li className="pt-2 border-t border-slate-100">
                <Link
                  href="/contact-us"
                  className="group block hover:text-[#012169] transition-colors"
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1 text-xs">
                    <MapPin weight="fill" className="h-3.5 w-3.5 text-[#C8102E] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Studio Location</span>
                  </div>
                  <address className="not-italic text-[12px] leading-relaxed text-slate-500 group-hover:text-slate-700">
                    75 Green Street, E7 8JF<br />
                    London, United Kingdom
                  </address>
                  <span className="inline-block mt-1 text-[11px] font-semibold text-[#012169] group-hover:underline">
                    View Map &amp; Studio Info →
                  </span>
                </Link>
              </li>
              {/* Studio Opening Hours */}
              <li className="pt-2 border-t border-slate-100">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5 text-xs">
                  <Clock weight="fill" className="h-3.5 w-3.5 text-[#012169] shrink-0" />
                  <span>Opening Hours</span>
                </div>
                <div className="text-[12px] leading-relaxed text-slate-600 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700">Mon – Fri:</span>
                    <span className="font-semibold text-slate-900">7:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700">Sat:</span>
                    <span className="font-semibold text-slate-900">10:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700">Sun:</span>
                    <span className="font-semibold text-slate-900">10:00 AM – 4:00 PM</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: SERVICES & RESOURCES */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-wider uppercase mb-3.5 sm:mb-4">
              SERVICES &amp; RESOURCES
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Brand Central - On-Brand Print',
                      'Corporate branded print portals allowing your multi-location teams to order brand-consistent marketing assets, corporate stationery, and apparel with pre-approved templates.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Brand Central - On-Brand Print
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Charity & Non-Profit Printing',
                      'We provide special non-profit discounts and priority turnarounds for registered UK charities, educational institutions, and community events.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Charity Printing
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Exhibit Like An Expert',
                      'Complete exhibition booth packages: pop-up displays, tension fabric banners, custom branded tablecloths, brochures, and promotional giveaways ready for ExCeL London and Olympia.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Exhibit Like An Expert
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Door-To-Door Leaflet Distribution',
                      'Targeted London postal drop distribution paired with high-volume leaflet printing for maximum return on investment.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Door-To-Door Leaflet Distribution
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Reseller Resources',
                      'Exclusive discounted trade pricing, dedicated production account manager, and unbranded direct dispatch for creative agencies and resellers.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Reseller Resources
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Print Sample Packs',
                      'Touch and feel our luxury paper stocks, finishes, foil blockings, and garment swatches before placing your full order. Order a sample pack by calling 0330 010 3521.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Sample Packs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openCallMe()}
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Print Today Design Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Print Today Print API',
                      'Automate your print fulfillment. Connect your e-commerce storefront or web app directly to our London print facility using our automated Print API.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Print API
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Trade Printing Services',
                      'High-volume offset litho and digital print capacity with rapid turnaround and confidential trade delivery across the UK.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Trade Printing
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: MY ACCOUNT */}
          <div>
            <h4 className="text-xs sm:text-[13px] font-black text-slate-900 tracking-wider uppercase mb-3.5 sm:mb-4">
              MY ACCOUNT
            </h4>
            <ul className="space-y-2 text-xs sm:text-[13px] text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Customer Portal',
                      'The customer login and order tracking portal will launch with our order management update. In the meantime, call 0330 010 3521 for real-time order updates.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Login | Register
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Refer a Friend Programme',
                      'Refer a colleague or fellow business owner and both receive 10% off your next commercial print order! Ask our studio team for your unique referral code.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Refer a Friend
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleInfo(
                      'Trackable London Delivery',
                      'All dispatched orders include full live GPS courier tracking and SMS delivery notifications directly to your phone.'
                    )
                  }
                  className="hover:text-[#012169] transition-colors text-left cursor-pointer"
                >
                  Trackable Delivery
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Middle Section: Brand Logo & Studio Location (Left) + Circular Social Icons (Right) */}
        <div className="pt-8 pb-6 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Studio Location on Left */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <img
                src="/images/logo.png"
                srcSet="/images/logo.png 1x, /images/logo@2x.png 2x"
                alt="Print Today UK"
                width={220}
                height={56}
                className="h-10 sm:h-12 w-auto max-w-[220px] object-contain block transition-transform group-hover:scale-[1.02]"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallbackEl = document.getElementById('footer-brand-text-logo');
                  if (fallbackEl) fallbackEl.style.display = 'flex';
                }}
              />
              <div id="footer-brand-text-logo" className="hidden items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-[#012169] flex items-center justify-center text-white shadow-sm">
                  <Printer weight="bold" className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    PRINT<span className="text-[#012169]">TODAY</span>
                    <span className="text-[#C8102E] font-extrabold text-[10px] ml-1 bg-red-50 px-1 py-0.5 rounded-sm border border-red-200/60">
                      UK
                    </span>
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    Your Local Digital Printer
                  </span>
                </div>
              </div>
            </Link>

            <div className="hidden sm:block h-8 w-px bg-slate-200 shrink-0" />

            <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-slate-600">
              <a
                href="https://www.google.com/maps/search/?api=1&query=75+Green+Street,+E7+8JF,+London,+United+Kingdom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-[#012169] transition-colors"
              >
                <MapPin weight="fill" className="h-4 w-4 text-[#C8102E] shrink-0" />
                <span>
                  <strong className="text-slate-800">Studio:</strong> 75 Green Street, E7 8JF, London
                </span>
              </a>
              <span className="hidden sm:inline text-slate-300">•</span>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                <Clock weight="fill" className="h-3.5 w-3.5 text-[#012169] shrink-0" />
                <span>
                  <strong>Mon–Fri:</strong> 7am–8pm · <strong>Sat:</strong> 10am–6pm · <strong>Sun:</strong> 10am–4pm
                </span>
              </div>
            </div>
          </div>

          {/* Social Media Circular Buttons on Right (Exact 6 matching Solopress) */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-[#1877F2] hover:bg-[#1464CA] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <FacebookLogo weight="fill" className="h-5 w-5" />
            </a>

            {/* X / Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-9 h-9 rounded-full bg-[#000000] hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <XLogo weight="bold" className="h-4 w-4" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-[#0A66C2] hover:bg-[#084D93] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <LinkedinLogo weight="fill" className="h-4.5 w-4.5" />
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-full bg-[#FF0000] hover:bg-[#CC0000] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <YoutubeLogo weight="fill" className="h-4.5 w-4.5" />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <InstagramLogo weight="bold" className="h-4.5 w-4.5" />
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-9 h-9 rounded-full bg-[#000000] hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
            >
              <TiktokLogo weight="fill" className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>

        {/* 4. Legal Links (Left) + Digital Platform (Right) */}
        <div className="pt-4 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-start">
            <button
              type="button"
              onClick={() =>
                handleInfo(
                  'Terms & Conditions',
                  'Standard UK commercial printing terms and conditions apply. Full details available upon request or via email.'
                )
              }
              className="hover:text-[#012169] transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <button
              type="button"
              onClick={() =>
                handleInfo(
                  'Privacy Policy',
                  'Your privacy is protected under UK GDPR regulations. We never share customer data or artwork files with third parties.'
                )
              }
              className="hover:text-[#012169] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() =>
                handleInfo(
                  'Cookie Policy',
                  'We use cookies to maintain your session preferences, remember shopping items, and analyze aggregate traffic performance.'
                )
              }
              className="hover:text-[#012169] transition-colors cursor-pointer"
            >
              Cookie Policy
            </button>
            <button
              type="button"
              onClick={() =>
                handleInfo(
                  'Modern Slavery Statement',
                  'Print Today UK maintains zero tolerance toward modern slavery, forced labor, or human trafficking across our direct operations and supply chain.'
                )
              }
              className="hover:text-[#012169] transition-colors cursor-pointer"
            >
              Modern Slavery
            </button>
          </div>

          <div className="text-slate-400 text-xs text-center sm:text-right shrink-0">
            Digital Platform by{' '}
            <span className="text-[#012169] font-semibold hover:underline cursor-pointer">
              Print Today Web
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Dark Bar with Studio Location & copyright text */}
      <div className="w-full bg-[#202E39] text-slate-300 text-xs py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <MapPin weight="fill" className="h-3.5 w-3.5 text-[#C8102E] shrink-0" />
          <span>Studio: 75 Green Street, E7 8JF, London, United Kingdom</span>
        </div>
        <span className="tracking-wide">
          copyright &copy; print today uk {new Date().getFullYear()}
        </span>
      </div>

      {/* Information Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-center font-sans"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute right-3.5 top-3.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>

              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#012169]">
                <Sparkle weight="fill" className="h-6 w-6 text-[#012169]" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                {activeModal.title}
              </h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed text-left sm:text-center">
                {activeModal.content}
              </p>

              <div className="mt-5 flex gap-2.5">
                <a
                  href="tel:03300103521"
                  className="flex-1 py-2.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Phone weight="fill" className="h-3.5 w-3.5" />
                  <span>Call 0330 010 3521</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}

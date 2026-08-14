'use client';

import React, { useState, useMemo } from 'react';
import { Inquiry } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import {
  Phone,
  MessageSquare,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface InquiryInboxProps {
  inquiries: Inquiry[];
  onUpdateStatus: (id: string, status: 'pending' | 'contacted' | 'resolved') => Promise<void>;
  onDeleteInquiry: (id: string) => Promise<void>;
}

export function InquiryInbox({
  inquiries,
  onUpdateStatus,
  onDeleteInquiry,
}: InquiryInboxProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'contacted' | 'resolved'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (filterStatus !== 'all' && (inq.status || 'pending') !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [inquiries, filterStatus]);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'contacted' | 'resolved') => {
    setLoadingId(id);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this inquiry record?')) {
      setLoadingId(id);
      try {
        await onDeleteInquiry(id);
      } finally {
        setLoadingId(null);
      }
    }
  };

  const pendingCount = inquiries.filter((i) => (i.status || 'pending') === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'contacted', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`capitalize px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#4a0e35] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} {st === 'pending' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-slate-900">{filteredInquiries.length}</span> Inquiries
        </div>
      </div>

      {/* Inquiry Cards / List */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">No Inquiries in this view</h4>
          <p className="mt-1 text-xs text-slate-500">
            Customer submissions through the &ldquo;Call Me&rdquo; and quote forms will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => {
            const status = inquiry.status || 'pending';
            const cleanPhone = inquiry.phone.replace(/[^\d+]/g, '');

            return (
              <div
                key={inquiry.id || inquiry.createdAt}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#4a0e35]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      {inquiry.name || 'Anonymous Lead'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-rose-600 font-mono">
                      {inquiry.phone}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(inquiry.createdAt)}
                    </span>
                  </div>

                  {inquiry.productTitle && (
                    <div className="text-xs text-[#4a0e35] font-semibold flex items-center gap-1 bg-[#4a0e35]/5 px-2.5 py-1 rounded-md max-w-fit">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Product: {inquiry.productTitle}</span>
                    </div>
                  )}

                  {inquiry.details && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                      &ldquo;{inquiry.details}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right Actions & Status */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Status Dropdown */}
                  <select
                    value={status}
                    onChange={(e) =>
                      handleStatusChange(
                        inquiry.id!,
                        e.target.value as 'pending' | 'contacted' | 'resolved'
                      )
                    }
                    className={`h-9 px-3 rounded-xl text-xs font-bold border cursor-pointer focus:outline-hidden ${
                      status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : status === 'contacted'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <option value="pending">⏳ Pending Call</option>
                    <option value="contacted">📞 Contacted</option>
                    <option value="resolved">✅ Resolved</option>
                  </select>

                  {/* Direct Dial */}
                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-rose-300" />
                    <span>Dial</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${cleanPhone.startsWith('0') ? '44' + cleanPhone.slice(1) : cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(inquiry.id!)}
                    disabled={loadingId === inquiry.id}
                    className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

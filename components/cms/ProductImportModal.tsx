'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ProductImportValidationReport, ProductImportResult } from '@/lib/types';
import { validateProductImport, parseImportContent } from '@/lib/productImportEngine';
import {
  UploadSimple,
  FileCode,
  CheckCircle,
  WarningCircle,
  XCircle,
  Sparkle,
  Lightning,
  Eye,
  FloppyDisk,
  DownloadSimple,
} from '@phosphor-icons/react';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => Promise<void>;
}

export function ProductImportModal({
  isOpen,
  onClose,
  onImportComplete,
}: ProductImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [validationReport, setValidationReport] = useState<ProductImportValidationReport | null>(null);

  const [isDryRun, setIsDryRun] = useState(true);
  const [mode, setMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setApiError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
        const parsed = parseImportContent(content);
        setParsedProducts(parsed);
        const report = validateProductImport(parsed);
        setValidationReport(report);
      } catch (err: any) {
        setApiError(`Failed to parse file: ${err.message || String(err)}`);
        setValidationReport(null);
        setParsedProducts([]);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTextChange = (text: string) => {
    setJsonText(text);
    setApiError(null);
    setImportResult(null);

    if (!text.trim()) {
      setParsedProducts([]);
      setValidationReport(null);
      return;
    }

    try {
      const parsed = parseImportContent(text);
      setParsedProducts(parsed);
      const report = validateProductImport(parsed);
      setValidationReport(report);
    } catch (err: any) {
      setValidationReport(null);
      setParsedProducts([]);
    }
  };

  const handleExecuteImport = async (overrideDryRun?: boolean) => {
    if (parsedProducts.length === 0) return;

    const dryRunParam = overrideDryRun !== undefined ? overrideDryRun : isDryRun;
    setIsProcessing(true);
    setApiError(null);
    setImportResult(null);

    try {
      const res = await fetch(`/api/admin/products?dryRun=${dryRunParam}&mode=${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedProducts),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || 'Import request failed.');
        if (data.report) {
          setValidationReport(data.report);
        }
        return;
      }

      if (data.report) {
        setValidationReport(data.report);
      }

      if (data.result) {
        setImportResult(data.result);
      } else if (data.dryRun) {
        setImportResult({
          success: true,
          created: data.projectedActions?.filter((a: any) => a.action === 'will_create').length || 0,
          updated: data.projectedActions?.filter((a: any) => a.action !== 'will_create').length || 0,
          skipped: 0,
          errors: [],
          details: (data.projectedActions || []).map((a: any) => ({
            slug: a.slug,
            action: a.action,
            message: `Dry Run: ${a.action} (tables: ${a.hasVariantTables || a.hasPriceMatrix})`,
          })),
        });
      }

      if (!dryRunParam && onImportComplete) {
        await onImportComplete();
      }
    } catch (err: any) {
      setApiError(`Network or execution error: ${err.message || String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSampleJson = () => {
    const sample = [
      {
        title: "A5 Stapled Brochures",
        slug: "a5-stapled-brochures",
        description: "High-definition multi-page stitched brochures with custom covers and inside stocks.",
        category: "Books & Booklets",
        price: 45.0,
        isActive: true,
        isSameDayAvailable: true,
        minQuantity: 25,
        maxQuantity: 5000,
        sameDayIncreasePercent: 35.4,
        nextDayIncreasePercent: 10.0,
        customFields: [
          {
            id: "field_pages",
            name: "Number of Pages",
            options: ["8 Pages", "12 Pages", "16 Pages", "20 Pages", "24 Pages", "28 Pages", "32 Pages"],
            required: true
          },
          {
            id: "field_paper",
            name: "Inside Paper Stock",
            options: ["130gsm Silk", "170gsm Silk", "130gsm Gloss", "170gsm Gloss"],
            required: true
          },
          {
            id: "field_lamination",
            name: "Cover Lamination",
            options: ["No Lamination", "Matt Lamination (+£0.12/ea)", "Gloss Lamination (+£0.12/ea)", "Soft Touch Lamination (+£0.18/ea)"],
            required: false
          }
        ],
        quantityTiers: [
          { quantity: 25, price: 45.0 },
          { quantity: 50, percentIncrease: 40 },
          { quantity: 100, percentIncrease: 80 },
          { quantity: 250, percentIncrease: 150 },
          { quantity: 500, percentIncrease: 250 }
        ],
        priceMatrix: {
          primaryFieldId: "field_pages",
          secondaryFieldId: "field_paper",
          columns: ["8 Pages - 130gsm Silk", "12 Pages - 130gsm Silk", "16 Pages - 130gsm Silk"],
          quantities: [25, 50, 100, 250, 500],
          cells: {
            "25__8 Pages - 130gsm Silk": 45.0,
            "50__8 Pages - 130gsm Silk": 63.0,
            "100__8 Pages - 130gsm Silk": 81.0,
            "25__12 Pages - 130gsm Silk": 58.0,
            "50__12 Pages - 130gsm Silk": 79.0,
            "100__12 Pages - 130gsm Silk": 99.0
          }
        }
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-product-import.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process 1: Bulk Product Import"
      maxWidth="5xl"
    >
      <div className="space-y-5" data-testid="product-import-modal">
        {/* Top Info Bar */}
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#012169] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkle weight="fill" className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              Upload a single JSON file containing multiple brochure or booklet products with all custom fields, variant tables, and price matrices.
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadSampleJson}
            className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <DownloadSimple weight="bold" className="h-3 w-3" />
            <span>Sample JSON</span>
          </button>
        </div>

        {/* Upload or Paste Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              Select JSON File or Paste Payload:
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-300"
              data-testid="choose-file-btn"
            >
              <UploadSimple weight="bold" className="h-3.5 w-3.5" />
              <span>{fileName ? `Replace: ${fileName}` : 'Choose File (.json)'}</span>
            </button>
          </div>

          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder='[ { "title": "A5 Stapled Brochures", "slug": "a5-stapled-brochures", "category": "Books & Booklets", "price": 45.0, ... } ]'
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#012169] text-slate-900 leading-relaxed"
            data-testid="import-json-textarea"
          />
        </div>

        {/* Import Configuration Controls */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Existing Products Conflict Mode (Matched on Slug):
            </label>
            <div className="flex items-center gap-4 text-xs mt-1">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                  className="text-[#012169]"
                />
                <span className="font-semibold text-slate-700">Merge with existing</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="text-[#012169]"
                />
                <span className="font-semibold text-slate-700">Completely replace</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col justify-center sm:items-end">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDryRun}
                onChange={(e) => setIsDryRun(e.target.checked)}
                className="rounded border-slate-300 text-[#012169] h-4 w-4"
                data-testid="dry-run-checkbox"
              />
              <span className="text-xs font-bold text-slate-800">
                Dry-Run Mode (Preview &amp; Validate without saving)
              </span>
            </label>
            <span className="text-[10px] text-slate-500 mt-0.5">
              Recommended: Run dry-run first to verify all 255+ tables before writing.
            </span>
          </div>
        </div>

        {/* Validation Report Card */}
        {validationReport && (
          <div
            className={`p-4 rounded-xl border ${
              validationReport.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
            }`}
            data-testid="validation-report"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {validationReport.valid ? (
                  <CheckCircle weight="fill" className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle weight="fill" className="h-5 w-5 text-rose-600" />
                )}
                <span className="text-xs font-bold text-slate-900">
                  Validation Status: {validationReport.valid ? 'PASSED' : 'ERRORS DETECTED'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-white rounded-md font-bold text-slate-700 border">
                  Total: {validationReport.totalProducts}
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">
                  Valid: {validationReport.validCount}
                </span>
                {validationReport.invalidCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-md font-bold">
                    Invalid: {validationReport.invalidCount}
                  </span>
                )}
              </div>
            </div>

            {/* List Errors */}
            {validationReport.errors.length > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                {validationReport.errors.map((errItem, idx) => (
                  <div key={idx} className="p-2 bg-white rounded-lg border border-rose-200 text-xs">
                    <span className="font-bold text-rose-800">
                      Product #{errItem.productIndex + 1} ({errItem.slug || errItem.title || 'Unknown'}):
                    </span>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5 text-rose-700">
                      {errItem.errors.map((errStr, eIdx) => (
                        <li key={eIdx}>{errStr}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Results Box */}
        {importResult && (
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle weight="bold" className="h-4 w-4 text-emerald-600" />
              <span>Import Execution Results</span>
            </h5>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Created</div>
                <div className="text-base font-black text-emerald-600">{importResult.created}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Updated</div>
                <div className="text-base font-black text-blue-600">{importResult.updated}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Skipped</div>
                <div className="text-base font-black text-slate-600">{importResult.skipped}</div>
              </div>
              <div className="p-2 bg-white rounded-lg border">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Errors</div>
                <div className="text-base font-black text-rose-600">{importResult.errors.length}</div>
              </div>
            </div>

            {importResult.details.length > 0 && (
              <div className="max-h-32 overflow-y-auto text-[11px] font-mono p-2 bg-white rounded border space-y-0.5">
                {importResult.details.map((d, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{d.slug}</span>
                    <span className="font-bold uppercase text-slate-500">{d.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {apiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
            <WarningCircle weight="fill" className="h-4 w-4 text-red-600 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {isDryRun ? (
              <Button
                variant="primary"
                size="sm"
                disabled={isProcessing || parsedProducts.length === 0}
                onClick={() => handleExecuteImport(true)}
                data-testid="dry-run-btn"
              >
                <Eye weight="bold" className="h-4 w-4 mr-1.5" />
                <span>{isProcessing ? 'Validating...' : 'Run Dry-Run Preview'}</span>
              </Button>
            ) : null}

            <Button
              variant="uk-blue"
              size="sm"
              disabled={isProcessing || parsedProducts.length === 0 || (validationReport ? !validationReport.valid : false)}
              onClick={() => handleExecuteImport(false)}
              data-testid="execute-import-btn"
            >
              <FloppyDisk weight="bold" className="h-4 w-4 mr-1.5" />
              <span>{isProcessing ? 'Writing to Catalog...' : 'Execute Live Import'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

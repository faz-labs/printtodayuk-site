'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CustomField, PriceMatrixConfig } from '@/lib/types';
import { cleanOptionDisplayName } from '@/lib/pricingEngine';
import { exportPriceMatrixToCSV, importPriceMatrixFromCSV } from '@/lib/productImportEngine';
import {
  Table,
  UploadSimple,
  DownloadSimple,
  Plus,
  Trash,
  Lightning,
  Sparkle,
  Copy,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';

interface PriceMatrixEditorProps {
  customFields: CustomField[];
  priceMatrix?: PriceMatrixConfig;
  onChange: (matrix: PriceMatrixConfig | undefined) => void;
  basePrice?: number;
}

const DEFAULT_QUANTITIES = [25, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000, 2500, 5000];

export function PriceMatrixEditor({
  customFields,
  priceMatrix,
  onChange,
  basePrice = 45.0,
}: PriceMatrixEditorProps) {
  const [isEnabled, setIsEnabled] = useState(Boolean(priceMatrix && priceMatrix.columns?.length));
  const [primaryFieldId, setPrimaryFieldId] = useState<string>(priceMatrix?.primaryFieldId || customFields[0]?.id || '');
  const [secondaryFieldId, setSecondaryFieldId] = useState<string>(priceMatrix?.secondaryFieldId || '');
  const [columns, setColumns] = useState<string[]>(priceMatrix?.columns || []);
  const [quantities, setQuantities] = useState<number[]>(priceMatrix?.quantities || DEFAULT_QUANTITIES);
  const [cells, setCells] = useState<Record<string, number>>(priceMatrix?.cells || {});

  const [newQtyInput, setNewQtyInput] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial from props
  useEffect(() => {
    if (priceMatrix && priceMatrix.columns?.length) {
      setIsEnabled(true);
      setPrimaryFieldId(priceMatrix.primaryFieldId);
      setSecondaryFieldId(priceMatrix.secondaryFieldId || '');
      setColumns(priceMatrix.columns);
      setQuantities(priceMatrix.quantities || DEFAULT_QUANTITIES);
      setCells(priceMatrix.cells || {});
    }
  }, [priceMatrix]);

  // Notify parent of updates
  const notifyChange = (
    newCols: string[],
    newQtys: number[],
    newCells: Record<string, number>,
    primId: string = primaryFieldId,
    secId: string = secondaryFieldId
  ) => {
    if (!isEnabled || newCols.length === 0 || newQtys.length === 0) {
      onChange(undefined);
      return;
    }
    onChange({
      primaryFieldId: primId,
      secondaryFieldId: secId || undefined,
      columns: newCols,
      quantities: newQtys,
      cells: newCells,
    });
  };

  // Generate columns based on selected primary and secondary fields
  const handleGenerateColumns = (primId: string, secId: string) => {
    const primField = customFields.find((f) => f.id === primId);
    if (!primField || !primField.options?.length) {
      setNotice('Please select a primary dropdown with options.');
      return;
    }

    const cleanPrimOpts = primField.options.map((o) => cleanOptionDisplayName(o).trim()).filter(Boolean);
    const secField = customFields.find((f) => f.id === secId);

    let generatedCols: string[] = [];

    if (secField && secField.options?.length) {
      const cleanSecOpts = secField.options.map((o) => cleanOptionDisplayName(o).trim()).filter(Boolean);
      for (const pOpt of cleanPrimOpts) {
        for (const sOpt of cleanSecOpts) {
          generatedCols.push(`${pOpt} - ${sOpt}`);
        }
      }
    } else {
      generatedCols = cleanPrimOpts;
    }

    setColumns(generatedCols);

    // Seed missing cells with reasonable curve from basePrice if empty
    const newCells = { ...cells };
    quantities.forEach((qty, qIdx) => {
      generatedCols.forEach((col, cIdx) => {
        const key = `${qty}__${col}`;
        if (newCells[key] === undefined) {
          const colMultiplier = 1 + cIdx * 0.08;
          const qtyMultiplier = Math.pow(qty / quantities[0], 0.65);
          newCells[key] = Math.ceil((basePrice * colMultiplier * qtyMultiplier) * 100) / 100;
        }
      });
    });

    setCells(newCells);
    notifyChange(generatedCols, quantities, newCells, primId, secId);
    setNotice(`Generated ${generatedCols.length} columns (${generatedCols.length * quantities.length} cells).`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCellChange = (qty: number, col: string, value: string) => {
    const num = parseFloat(value);
    const key = `${qty}__${col}`;
    const newCells = { ...cells };
    if (isNaN(num) || num < 0) {
      delete newCells[key];
    } else {
      newCells[key] = num;
    }
    setCells(newCells);
    notifyChange(columns, quantities, newCells);
  };

  // Paste from Excel or Google Sheets (TSV / CSV parsing)
  const handlePaste = (e: React.ClipboardEvent, startQtyIndex: number, startColIndex: number) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text || (!text.includes('\t') && !text.includes('\n'))) {
      return; // Normal single cell paste
    }
    e.preventDefault();

    const rows = text.split(/\r?\n/).filter((r) => r.trim().length > 0);
    const newCells = { ...cells };
    let pastedCount = 0;

    rows.forEach((rowStr, rOffset) => {
      const qIdx = startQtyIndex + rOffset;
      if (qIdx >= quantities.length) return;
      const targetQty = quantities[qIdx];

      const vals = rowStr.split('\t');
      vals.forEach((valStr, cOffset) => {
        const cIdx = startColIndex + cOffset;
        if (cIdx >= columns.length) return;
        const targetCol = columns[cIdx];

        const cleaned = valStr.replace(/[£$,]/g, '').trim();
        const num = parseFloat(cleaned);
        if (!isNaN(num) && num >= 0) {
          newCells[`${targetQty}__${targetCol}`] = Math.ceil(num * 100) / 100;
          pastedCount++;
        }
      });
    });

    setCells(newCells);
    notifyChange(columns, quantities, newCells);
    setNotice(`Pasted ${pastedCount} cell values from spreadsheet clipboard!`);
    setTimeout(() => setNotice(null), 4000);
  };

  // Add Quantity Row
  const handleAddQuantity = () => {
    const qty = parseInt(newQtyInput.trim(), 10);
    if (isNaN(qty) || qty <= 0) return;
    if (quantities.includes(qty)) {
      setNotice(`Quantity ${qty} already exists.`);
      return;
    }
    const newQtys = [...quantities, qty].sort((a, b) => a - b);
    setQuantities(newQtys);
    setNewQtyInput('');
    notifyChange(columns, newQtys, cells);
  };

  // Remove Quantity Row
  const handleRemoveQuantity = (qty: number) => {
    const newQtys = quantities.filter((q) => q !== qty);
    setQuantities(newQtys);
    notifyChange(columns, newQtys, cells);
  };

  // CSV Download
  const handleDownloadCsv = () => {
    if (columns.length === 0) return;
    const csvContent = exportPriceMatrixToCSV({
      primaryFieldId,
      secondaryFieldId: secondaryFieldId || undefined,
      columns,
      quantities,
      cells,
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `price-matrix-${primaryFieldId || 'matrix'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CSV Upload
  const handleUploadCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = importPriceMatrixFromCSV(content, primaryFieldId, secondaryFieldId || undefined);
        setColumns(parsed.columns);
        setQuantities(parsed.quantities);
        setCells(parsed.cells);
        notifyChange(parsed.columns, parsed.quantities, parsed.cells);
        setNotice(`Imported ${parsed.columns.length} columns and ${parsed.quantities.length} rows from CSV!`);
        setTimeout(() => setNotice(null), 4000);
      } catch (err: any) {
        setNotice(`CSV Import Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4" data-testid="price-matrix-section">
      {/* Header Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Table weight="bold" className="h-4 w-4 text-[#012169]" />
            <span>Process 2: Spreadsheet Price Matrix (Grid Table)</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Ideal for brochures, booklets &amp; books with multiple page counts and paper stocks. Resolves prices from a 2D matrix before checking variants.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => {
              const enabled = e.target.checked;
              setIsEnabled(enabled);
              if (!enabled) {
                onChange(undefined);
              } else if (columns.length > 0) {
                notifyChange(columns, quantities, cells);
              }
            }}
            className="sr-only peer"
            data-testid="price-matrix-enable-toggle"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#012169]"></div>
        </label>
      </div>

      {isEnabled && (
        <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          {notice && (
            <div className="p-3 rounded-lg bg-blue-50 text-[#012169] text-xs font-semibold flex items-center gap-2">
              <Sparkle weight="fill" className="h-4 w-4 text-blue-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Dimension Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Matrix Column (e.g. Number of Pages) <span className="text-red-500">*</span>
              </label>
              <select
                value={primaryFieldId}
                onChange={(e) => {
                  setPrimaryFieldId(e.target.value);
                  handleGenerateColumns(e.target.value, secondaryFieldId);
                }}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                data-testid="price-matrix-primary-field-select"
              >
                <option value="">-- Choose Field --</option>
                {customFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.options?.length || 0} options)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Secondary Column (Optional, e.g. Inside Paper)
              </label>
              <select
                value={secondaryFieldId}
                onChange={(e) => {
                  setSecondaryFieldId(e.target.value);
                  handleGenerateColumns(primaryFieldId, e.target.value);
                }}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-900"
                data-testid="price-matrix-secondary-field-select"
              >
                <option value="">-- None (Single Dimension) --</option>
                {customFields
                  .filter((f) => f.id !== primaryFieldId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.options?.length || 0} options)
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGenerateColumns(primaryFieldId, secondaryFieldId)}
                className="h-9 px-3 rounded-lg bg-[#012169] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#0a358c] transition-all cursor-pointer"
                data-testid="price-matrix-generate-btn"
              >
                <Lightning weight="fill" className="h-3.5 w-3.5 text-amber-300" />
                <span>Build Matrix Columns</span>
              </button>
            </div>
          </div>

          {/* Matrix Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Add Quantity Row:</span>
              <input
                type="number"
                placeholder="e.g. 750"
                value={newQtyInput}
                onChange={(e) => setNewQtyInput(e.target.value)}
                className="w-24 h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddQuantity}
                className="h-8 px-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                <Plus weight="bold" className="h-3.5 w-3.5 inline mr-1" />
                Add
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                className="hidden"
                onChange={handleUploadCsv}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                data-testid="price-matrix-upload-csv-btn"
              >
                <UploadSimple weight="bold" className="h-3.5 w-3.5" />
                <span>Upload CSV</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadCsv}
                className="h-8 px-3 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                data-testid="price-matrix-download-csv-btn"
              >
                <DownloadSimple weight="bold" className="h-3.5 w-3.5" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          {/* Spreadsheet Grid */}
          {columns.length > 0 ? (
            <div className="mt-3 border border-slate-200 rounded-xl overflow-x-auto max-h-[500px] shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-slate-100 z-10 shadow-xs border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 font-bold text-slate-900 bg-slate-200 sticky left-0 z-20 min-w-[100px] border-r border-slate-300">
                      Quantity
                    </th>
                    {columns.map((col, cIdx) => (
                      <th
                        key={cIdx}
                        className="p-2.5 font-bold text-slate-800 min-w-[130px] border-r border-slate-200 last:border-r-0 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quantities.map((qty, qIdx) => (
                    <tr key={qty} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-2 font-bold text-slate-900 bg-slate-50 sticky left-0 z-10 border-r border-slate-300 flex items-center justify-between gap-1">
                        <span>{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuantity(qty)}
                          title="Delete row"
                          className="text-slate-400 hover:text-red-500 p-0.5"
                        >
                          <Trash weight="bold" className="h-3 w-3" />
                        </button>
                      </td>
                      {columns.map((col, cIdx) => {
                        const cellKey = `${qty}__${col}`;
                        const cellVal = cells[cellKey] !== undefined ? cells[cellKey] : '';
                        return (
                          <td
                            key={cIdx}
                            className="p-1 border-r border-slate-100 last:border-r-0"
                          >
                            <div className="relative flex items-center">
                              <span className="absolute left-2 text-slate-400 text-[10px] pointer-events-none">
                                £
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={cellVal}
                                onChange={(e) => handleCellChange(qty, col, e.target.value)}
                                onPaste={(e) => handlePaste(e, qIdx, cIdx)}
                                className="w-full h-7 pl-5 pr-1.5 rounded-sm border border-transparent hover:border-slate-300 focus:border-[#012169] focus:bg-white text-xs text-right font-medium text-slate-800"
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
              Choose your primary column field above and click <strong>&quot;Build Matrix Columns&quot;</strong> to generate the spreadsheet grid.
            </div>
          )}

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg flex items-center gap-1.5">
            <Sparkle weight="fill" className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>Excel / Google Sheets Tip:</strong> Select and copy any block of numbers in your spreadsheet, click any cell above, and press <strong>Ctrl+V</strong> to paste the entire table into the grid.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

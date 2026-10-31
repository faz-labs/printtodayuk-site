'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ProductInput, CategoryConfig, CustomField, QuantityTier } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { cleanOptionDisplayName } from '@/lib/pricingEngine';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MultiImageUploader } from './MultiImageUploader';
import {
  Plus,
  Trash,
  Lightning,
  Sparkle,
  SlidersHorizontal,
  X,
  FloppyDisk,
  DotsSixVertical,
  PencilSimple,
  CaretUp,
  CaretDown,
  Check,
  CheckCircle,
  WarningCircle,
  Copy,
  Globe,
} from '@phosphor-icons/react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput, id?: string) => Promise<void>;
  initialProduct?: Product | null;
  categories: CategoryConfig[];
}

const TIER_PRESETS = {
  flyers: [
    { quantity: 25, price: 25.0 },
    { quantity: 50, percentIncrease: 40 },
    { quantity: 100, percentIncrease: 80 },
    { quantity: 250, percentIncrease: 150 },
    { quantity: 500, percentIncrease: 250 },
    { quantity: 1000, percentIncrease: 400 },
    { quantity: 2500, percentIncrease: 750 },
    { quantity: 5000, percentIncrease: 1200 },
  ],
  businessCards: [
    { quantity: 50, price: 18.0 },
    { quantity: 100, percentIncrease: 35 },
    { quantity: 250, percentIncrease: 85 },
    { quantity: 500, percentIncrease: 140 },
    { quantity: 1000, percentIncrease: 220 },
  ],
  banners: [
    { quantity: 1, price: 29.0 },
    { quantity: 2, percentIncrease: 70 },
    { quantity: 5, percentIncrease: 250 },
    { quantity: 10, percentIncrease: 550 },
    { quantity: 25, percentIncrease: 1300 },
  ],
  booklets: [
    { quantity: 25, price: 65.0 },
    { quantity: 50, percentIncrease: 45 },
    { quantity: 100, percentIncrease: 95 },
    { quantity: 200, percentIncrease: 175 },
    { quantity: 300, percentIncrease: 245 },
    { quantity: 500, percentIncrease: 380 },
  ],
};

/**
 * Extracts and maps variant string tokens into matching CustomField option selections.
 * Allows easy exchanging of variant options and duplication of existing tables.
 */
function parseVariantToFieldSelections(
  variantName: string,
  fields: CustomField[]
): Record<string, string> {
  const selections: Record<string, string> = {};
  if (!variantName || variantName === 'default') {
    return selections;
  }

  const rawParts = variantName
    .split(/\s*[-–—/|,]\s*/)
    .map((p) => cleanOptionDisplayName(p).trim().toLowerCase())
    .filter(Boolean);

  const cleanVarName = cleanOptionDisplayName(variantName).toLowerCase();

  fields.forEach((f) => {
    // 1. Try exact match against split parts
    let found = f.options.find((opt) => {
      const cleanOpt = cleanOptionDisplayName(opt).trim().toLowerCase();
      return rawParts.includes(cleanOpt);
    });

    // 2. Try substring or contains match against parts or full variant string
    if (!found) {
      found = f.options.find((opt) => {
        const cleanOpt = cleanOptionDisplayName(opt).trim().toLowerCase();
        if (!cleanOpt) return false;
        return (
          rawParts.some((p) => p === cleanOpt || p.includes(cleanOpt) || cleanOpt.includes(p)) ||
          cleanVarName.includes(cleanOpt)
        );
      });
    }

    if (found) {
      selections[f.id] = cleanOptionDisplayName(found).trim();
    }
  });

  return selections;
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
  categories,
}: ProductFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [quantityTiers, setQuantityTiers] = useState<QuantityTier[]>([
    { quantity: 25, price: 25.0 },
    { quantity: 50, percentIncrease: 40 },
    { quantity: 100, percentIncrease: 80 },
    { quantity: 250, percentIncrease: 150 },
    { quantity: 500, percentIncrease: 250 },
    { quantity: 1000, percentIncrease: 400 },
  ]);
  const [sameDayIncreasePercent, setSameDayIncreasePercent] = useState<string>('35.4');
  const [nextDayIncreasePercent, setNextDayIncreasePercent] = useState<string>('10');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0]?.name || '');
  const [isSameDayAvailable, setIsSameDayAvailable] = useState(true);
  const [maxSameDayQuantity, setMaxSameDayQuantity] = useState<string>('');
  const [maxNextDayQuantity, setMaxNextDayQuantity] = useState<string>('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [activeNewOptionText, setActiveNewOptionText] = useState<{ [fieldId: string]: string }>({});
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [draggedOption, setDraggedOption] = useState<{ fieldId: string; index: number } | null>(null);
  const [editingOption, setEditingOption] = useState<{
    fieldId: string;
    optionIndex: number;
    value: string;
  } | null>(null);

  // Approach B: Variant-Specific Quantity Tiers
  const [variantQuantityTiers, setVariantQuantityTiers] = useState<Record<string, QuantityTier[]>>({});
  const [activeVariantTab, setActiveVariantTab] = useState<string>('default');
  const [selectedVariantToAdd, setSelectedVariantToAdd] = useState<string>('');
  const [isVariantPickerOpen, setIsVariantPickerOpen] = useState(false);
  const [pickerSelections, setPickerSelections] = useState<Record<string, string>>({});
  const [copySourceTable, setCopySourceTable] = useState<string>('default');

  // Approach C & Universal Auto-Fill Tool
  const [route1Url, setRoute1Url] = useState<string>('');
  const [isImportingRoute1, setIsImportingRoute1] = useState<boolean>(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string>('');
  const [importMode, setImportMode] = useState<'matrix_only' | 'full'>('matrix_only');
  const [importTarget, setImportTarget] = useState<string>('default');
  const [variantImportUrl, setVariantImportUrl] = useState<string>('');
  const [isImportingVariant, setIsImportingVariant] = useState<boolean>(false);
  const [variantImportMsg, setVariantImportMsg] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleRequestClose = () => {
    setShowConfirmClose(true);
  };

  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    setSaveSuccessMsg('');
    setError('');
    onClose();
  };

  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  // Intercept Escape when confirmation dialog is active to dismiss popup rather than exiting
  useEffect(() => {
    if (!showConfirmClose) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setShowConfirmClose(false);
      }
    };
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [showConfirmClose]);

  // Intercept Escape when variant options picker is open to close picker without closing product modal
  useEffect(() => {
    if (!isVariantPickerOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        setIsVariantPickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape, { capture: true });
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [isVariantPickerOpen]);

  // Auto-hide success notification after 6 seconds
  useEffect(() => {
    if (!saveSuccessMsg) return;
    const timer = setTimeout(() => {
      setSaveSuccessMsg('');
    }, 6000);
    return () => clearTimeout(timer);
  }, [saveSuccessMsg]);

  // Keep target selector synced with active variant tab
  useEffect(() => {
    if (activeVariantTab) {
      setImportTarget(activeVariantTab);
    }
  }, [activeVariantTab]);

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title);
      setSlug(initialProduct.slug);
      setDescription(initialProduct.description);
      const prodImages =
        initialProduct.images && initialProduct.images.length > 0
          ? initialProduct.images
          : initialProduct.imageUrl
          ? [initialProduct.imageUrl]
          : [];
      setImages(prodImages);
      setImageUrl(prodImages[0] || initialProduct.imageUrl || '');
      setDiscountedPrice(
        initialProduct.discountedPrice ? initialProduct.discountedPrice.toString() : ''
      );
      setCategory(initialProduct.category || categories[0]?.name || '');
      setIsSameDayAvailable(initialProduct.isSameDayAvailable);
      setMaxSameDayQuantity(
        initialProduct.maxSameDayQuantity !== undefined && initialProduct.maxSameDayQuantity !== null
          ? initialProduct.maxSameDayQuantity.toString()
          : ''
      );
      setMaxNextDayQuantity(
        initialProduct.maxNextDayQuantity !== undefined && initialProduct.maxNextDayQuantity !== null
          ? initialProduct.maxNextDayQuantity.toString()
          : ''
      );
      setSameDayIncreasePercent(
        initialProduct.sameDayIncreasePercent !== undefined && initialProduct.sameDayIncreasePercent !== null
          ? initialProduct.sameDayIncreasePercent.toString()
          : '35.4'
      );
      setNextDayIncreasePercent(
        initialProduct.nextDayIncreasePercent !== undefined && initialProduct.nextDayIncreasePercent !== null
          ? initialProduct.nextDayIncreasePercent.toString()
          : '10'
      );
      if (initialProduct.quantityTiers && initialProduct.quantityTiers.length > 0) {
        setQuantityTiers(initialProduct.quantityTiers);
      } else {
        const firstQty = initialProduct.minQuantity || 25;
        const firstPrice = initialProduct.price || 14.69;
        setQuantityTiers([
          { quantity: firstQty, price: firstPrice },
          { quantity: Math.max(firstQty * 2, 50), percentIncrease: 40 },
          { quantity: Math.max(firstQty * 4, 100), percentIncrease: 80 },
          { quantity: Math.max(firstQty * 10, 250), percentIncrease: 150 },
          { quantity: Math.max(firstQty * 20, 500), percentIncrease: 250 },
          { quantity: Math.max(firstQty * 40, 1000), percentIncrease: 400 },
        ]);
      }
      setVariantQuantityTiers(initialProduct.variantQuantityTiers || {});
      setActiveVariantTab('default');
      setSelectedVariantToAdd('');
      setFeatures(initialProduct.features || []);
      setCustomFields(initialProduct.customFields || []);
    } else {
      // Default reset
      setTitle('');
      setSlug('');
      setDescription('');
      setImages([]);
      setImageUrl('');
      setDiscountedPrice('');
      setCategory(categories[0]?.name || '');
      setIsSameDayAvailable(true);
      setMaxSameDayQuantity('');
      setMaxNextDayQuantity('');
      setSameDayIncreasePercent('35.4');
      setNextDayIncreasePercent('10');
      setQuantityTiers([
        { quantity: 25, price: 25.0 },
        { quantity: 50, percentIncrease: 40 },
        { quantity: 100, percentIncrease: 80 },
        { quantity: 250, percentIncrease: 150 },
        { quantity: 500, percentIncrease: 250 },
        { quantity: 1000, percentIncrease: 400 },
      ]);
      setVariantQuantityTiers({});
      setActiveVariantTab('default');
      setSelectedVariantToAdd('');
      setFeatures([
        'Premium High Definition Print Quality',
        'Same-day London Dispatch Available',
      ]);
      setCustomFields([]);
    }
    setActiveNewOptionText({});
    setRoute1Url('');
    setImportSuccessMsg('');
    setVariantImportUrl('');
    setVariantImportMsg('');
    setImportMode(initialProduct ? 'matrix_only' : 'full');
    setImportTarget('default');
    setError('');
  }, [initialProduct, isOpen, categories]);

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    if (newImages.length > 0) {
      setImageUrl(newImages[0]);
    } else {
      setImageUrl('');
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialProduct) {
      setSlug(slugify(val));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Custom Fields Handler
  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `fld-${Date.now()}`,
      name: '',
      options: [],
      required: true,
    };
    setCustomFields([newField, ...customFields]);
  };

  const handleUpdateFieldName = (fieldId: string, name: string) => {
    setCustomFields(
      customFields.map((f) => (f.id === fieldId ? { ...f, name } : f))
    );
  };

  const handleAddOptionToField = (fieldId: string) => {
    const text = (activeNewOptionText[fieldId] || '').trim();
    if (!text) return;
    setCustomFields(
      customFields.map((f) => {
        if (f.id === fieldId) {
          if (f.options.includes(text)) return f;
          return { ...f, options: [...f.options, text] };
        }
        return f;
      })
    );
    setActiveNewOptionText({ ...activeNewOptionText, [fieldId]: '' });
  };

  const handleRemoveOptionFromField = (fieldId: string, optIndex: number) => {
    setCustomFields(
      customFields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, options: f.options.filter((_, i) => i !== optIndex) };
        }
        return f;
      })
    );
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter((f) => f.id !== fieldId));
  };

  const handleMoveField = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= customFields.length || toIdx >= customFields.length) return;
    const updated = [...customFields];
    const [removed] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, removed);
    setCustomFields(updated);
  };

  const handleMoveOption = (fieldId: string, fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setCustomFields(
      customFields.map((f) => {
        if (f.id === fieldId) {
          const updatedOptions = [...f.options];
          const [removed] = updatedOptions.splice(fromIdx, 1);
          updatedOptions.splice(toIdx, 0, removed);
          return { ...f, options: updatedOptions };
        }
        return f;
      })
    );
  };

  const handleSaveOptionEdit = () => {
    if (!editingOption) return;
    const trimmed = editingOption.value.trim();
    if (trimmed) {
      setCustomFields(
        customFields.map((f) => {
          if (f.id === editingOption.fieldId) {
            const updatedOptions = [...f.options];
            updatedOptions[editingOption.optionIndex] = trimmed;
            return { ...f, options: updatedOptions };
          }
          return f;
        })
      );
    }
    setEditingOption(null);
  };

  const handleAddPreset = (
    type: 'size' | 'flyerSize' | 'sides' | 'finish' | 'apparelSize' | 'paperWeight' | 'sets'
  ) => {
    let newField: CustomField;
    const uniqueId = `fld-${Date.now()}`;
    if (type === 'flyerSize') {
      newField = {
        id: uniqueId,
        name: 'Finished Size',
        options: [
          'A5 (148 × 210 mm)',
          'A6 (105 × 148 mm) -20%',
          'DL (99 × 210 mm) -10%',
          'A4 (210 × 297 mm) +35%',
          'A3 (297 × 420 mm) +80%',
        ],
        required: true,
      };
    } else if (type === 'sides') {
      newField = {
        id: uniqueId,
        name: 'Printed Sides',
        options: ['Single Sided', 'Double Sided (+10%)'],
        required: true,
      };
    } else if (type === 'size') {
      newField = {
        id: uniqueId,
        name: 'Card Size',
        options: ['85x55mm (Standard UK)', '66x55mm (Mini)', '55x55mm (Square)'],
        required: true,
      };
    } else if (type === 'finish') {
      newField = {
        id: uniqueId,
        name: 'Lamination Finish',
        options: ['No Lamination', 'Matt Lamination +15%', 'High Gloss Lamination +15%', 'Velvet Soft-Touch +25%'],
        required: true,
      };
    } else if (type === 'apparelSize') {
      newField = {
        id: uniqueId,
        name: 'Select Size',
        options: ['Small (S)', 'Medium (M)', 'Large (L)', 'XL', '2XL', '3XL'],
        required: true,
      };
    } else if (type === 'sets') {
      newField = {
        id: uniqueId,
        name: 'Number of Sets',
        options: ['1 Set', '2 Sets', '3 Sets', '4 Sets', '5 Sets', '10 Sets'],
        required: true,
      };
    } else {
      newField = {
        id: uniqueId,
        name: 'Paper Weight / Stock',
        options: [
          '130gsm Gloss (Economy)',
          '170gsm Silk (Standard) +10%',
          '250gsm Silk (Premium) +20%',
          '350gsm Silk (Card Stock) +35%',
          '400gsm Matt (Luxury) +50%',
        ],
        required: true,
      };
    }
    setCustomFields([newField, ...customFields]);
  };

  // Active tiers getter and updater (Approach B)
  const currentTiers: QuantityTier[] =
    activeVariantTab === 'default'
      ? quantityTiers
      : variantQuantityTiers[activeVariantTab] || [];

  const updateCurrentTiers = (
    updater: QuantityTier[] | ((prev: QuantityTier[]) => QuantityTier[])
  ) => {
    if (activeVariantTab === 'default') {
      setQuantityTiers(updater);
    } else {
      setVariantQuantityTiers((prev) => {
        const current = prev[activeVariantTab] || [];
        const next = typeof updater === 'function' ? updater(current) : updater;
        return { ...prev, [activeVariantTab]: next };
      });
    }
  };

  const handleApplyTierPreset = (presetKey: keyof typeof TIER_PRESETS) => {
    const preset = TIER_PRESETS[presetKey];
    const currentBasePrice = currentTiers[0]?.price || preset[0].price;
    const newTiers: QuantityTier[] = preset.map((t, idx) => {
      if (idx === 0) {
        return { quantity: t.quantity, price: currentBasePrice };
      }
      return { quantity: t.quantity, percentIncrease: t.percentIncrease };
    });
    updateCurrentTiers(newTiers);
  };

  const handleAddTier = () => {
    const lastTier = currentTiers[currentTiers.length - 1];
    const nextQty = lastTier ? Math.round(lastTier.quantity * 2) : 25;
    const nextPct =
      lastTier && lastTier.percentIncrease !== undefined
        ? Math.round(lastTier.percentIncrease * 1.5 + 20)
        : 40;
    updateCurrentTiers((prev) => [
      ...prev,
      { quantity: nextQty, percentIncrease: nextPct },
    ]);
  };

  const handleUpdateTier = (
    index: number,
    field: 'quantity' | 'price' | 'percentIncrease',
    val: string
  ) => {
    const num = val === '' ? undefined : parseFloat(val);
    updateCurrentTiers((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        if (field === 'quantity') {
          return { ...t, quantity: num !== undefined ? Math.max(1, Math.round(num)) : 1 };
        }
        if (field === 'price') {
          return { ...t, price: num };
        }
        if (field === 'percentIncrease') {
          return { ...t, percentIncrease: num };
        }
        return t;
      })
    );
  };

  const handleRemoveTier = (index: number) => {
    if (currentTiers.length <= 1) return;
    updateCurrentTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const baseTierPrice = currentTiers[0]?.price || 0;
  const computedStandardPrice = (tier: QuantityTier, index: number): number => {
    if (index === 0) return tier.price || 0;
    const pct = tier.percentIncrease || 0;
    return baseTierPrice * (1 + pct / 100);
  };

  const computedUnitPrice = (tier: QuantityTier, index: number): number => {
    const total = computedStandardPrice(tier, index);
    return tier.quantity > 0 ? total / tier.quantity : 0;
  };

  const availableVariantOptions = customFields
    .flatMap((f) => f.options.map((o) => cleanOptionDisplayName(o)))
    .filter((o) => o && o.trim().length > 0 && !variantQuantityTiers[o]);

  // Dynamic composed variant key from steady picker selections
  const composedVariantKey = customFields
    .map((f) => pickerSelections[f.id])
    .filter(Boolean)
    .join(' - ');

  // Open Steady Variant Options Picker
  const handleOpenVariantPicker = (baseKey?: string, sourceTable?: string) => {
    const source = sourceTable || (activeVariantTab !== 'default' ? activeVariantTab : 'default');
    setCopySourceTable(source);

    const keyToParse =
      baseKey ||
      selectedVariantToAdd.trim() ||
      (activeVariantTab !== 'default' ? activeVariantTab : '');

    const initialSelections = parseVariantToFieldSelections(keyToParse, customFields);
    setPickerSelections(initialSelections);
    setIsVariantPickerOpen(true);
  };

  // Start Copying an Existing Table for a new variant
  const handleStartCopyVariant = (sourceKey: string) => {
    setCopySourceTable(sourceKey);
    const initialSelections = parseVariantToFieldSelections(
      sourceKey !== 'default' ? sourceKey : '',
      customFields
    );
    setPickerSelections(initialSelections);
    if (sourceKey !== 'default') {
      setSelectedVariantToAdd(sourceKey);
    }
    setIsVariantPickerOpen(true);
  };

  // Toggle or Exchange an Option for a specific Dropdown Field in the Steady Picker
  const handleTogglePickerOption = (fieldId: string, optionValue: string) => {
    const cleanVal = cleanOptionDisplayName(optionValue).trim();
    setPickerSelections((prev) => {
      if (prev[fieldId] === cleanVal) {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      }
      return {
        ...prev,
        [fieldId]: cleanVal,
      };
    });
  };

  // Apply Selections into Input and Close Picker
  const handlePickerDone = () => {
    if (composedVariantKey) {
      setSelectedVariantToAdd(composedVariantKey);
    }
    setIsVariantPickerOpen(false);
  };

  // Create Variant Table with cloned pricing tiers
  const handleCreateVariantTable = (targetName?: string) => {
    const name = (targetName || selectedVariantToAdd).trim();
    if (!name) return;

    if (variantQuantityTiers[name]) {
      setActiveVariantTab(name);
      setSelectedVariantToAdd('');
      setIsVariantPickerOpen(false);
      return;
    }

    // Determine source pricing tiers to clone from
    let sourceTiers: QuantityTier[] = quantityTiers;
    if (copySourceTable && copySourceTable !== 'default' && variantQuantityTiers[copySourceTable]) {
      sourceTiers = variantQuantityTiers[copySourceTable];
    } else if (activeVariantTab !== 'default' && variantQuantityTiers[activeVariantTab]) {
      sourceTiers = variantQuantityTiers[activeVariantTab];
    }

    setVariantQuantityTiers((prev) => ({
      ...prev,
      [name]: JSON.parse(JSON.stringify(sourceTiers)),
    }));
    setActiveVariantTab(name);
    setSelectedVariantToAdd('');
    setIsVariantPickerOpen(false);
  };

  // One-click Done & Create Table directly from steady picker
  const handlePickerDoneAndCreate = () => {
    if (composedVariantKey) {
      handleCreateVariantTable(composedVariantKey);
    } else {
      setIsVariantPickerOpen(false);
    }
  };

  // Calculate Cartesian Product of all Custom Dropdown Options
  const allCombinations = useMemo(() => {
    const valid = customFields
      .map((f) => ({
        id: f.id,
        name: f.name,
        options: f.options
          .map((o) => cleanOptionDisplayName(o).trim())
          .filter((o) => o.length > 0),
      }))
      .filter((f) => f.options.length > 0);

    if (valid.length === 0) return [];

    let combos: string[][] = [[]];
    for (const field of valid) {
      const nextCombos: string[][] = [];
      for (const existing of combos) {
        for (const opt of field.options) {
          nextCombos.push([...existing, opt]);
        }
      }
      combos = nextCombos;
    }

    return combos.map((c) => c.join(' - '));
  }, [customFields]);

  // First value combination representing the default
  const defaultCombinationName = allCombinations[0] || '';

  // One-click generate all combination tables
  const handleGenerateAllCombinationTables = () => {
    if (allCombinations.length === 0) {
      alert(
        'Please add your dropdown options (e.g. Size, Paper Stock, Printed Sides) under "Custom Dropdown Fields" below before generating combination tables.'
      );
      return;
    }

    if (allCombinations.length > 100) {
      if (
        !window.confirm(
          `Your dropdown options produce ${allCombinations.length} total combination tables. Do you want to generate all ${allCombinations.length} tables now?`
        )
      ) {
        return;
      }
    }

    let createdCount = 0;
    const updated = { ...variantQuantityTiers };

    for (const combo of allCombinations) {
      if (!updated[combo]) {
        updated[combo] = JSON.parse(JSON.stringify(quantityTiers));
        createdCount++;
      }
    }

    setVariantQuantityTiers(updated);
    if (createdCount > 0) {
      setImportSuccessMsg(
        `⚡ Generated ${createdCount} combination tables! (${allCombinations.length} total combination tables ready). Select any table above or below to paste its link and update price.`
      );
    } else {
      setImportSuccessMsg(
        `All ${allCombinations.length} combination tables are already present and ready.`
      );
    }
    setIsVariantPickerOpen(false);
  };

  // Clear all variant tables back to default base table
  const handleClearAllVariantTables = () => {
    if (
      window.confirm(
        'Delete all variant combination tables? Only the Default Base Tiers table will be kept.'
      )
    ) {
      setVariantQuantityTiers({});
      setActiveVariantTab('default');
      setImportTarget('default');
      setImportSuccessMsg('All variant combination tables cleared.');
    }
  };

  // Approach C & Universal One-Click Auto-Fill Handler
  const handleImportRoute1 = async (targetOverride?: string) => {
    const urlToFetch = route1Url.trim();
    if (!urlToFetch) {
      setError('Please enter a product URL (Route1 or Solopress) to import.');
      return;
    }
    setIsImportingRoute1(true);
    setError('');
    setImportSuccessMsg('');

    try {
      const res = await fetch('/api/admin/scrape-route1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to import product data');
      }

      const d = result.data;
      const target = targetOverride || importTarget;

      // Case A: Import into a specific Variant Table (Approach B)
      if (target !== 'default') {
        if (d.quantityTiers && d.quantityTiers.length > 0) {
          setVariantQuantityTiers((prev) => ({
            ...prev,
            [target]: d.quantityTiers,
          }));
          setActiveVariantTab(target);
          const baseFormatted = d.price ? ` (Base: £${Number(d.price).toFixed(2)})` : '';
          setImportSuccessMsg(
            `⚡ Successfully imported ${d.quantityTiers.length} price tiers${baseFormatted} for "${d.matchedVariantName || target}" directly into variant table "${target}"!`
          );
        } else {
          throw new Error('No quantity tiers found in the provided URL.');
        }
        return;
      }

      // Case B: Import into Default / Base Matrix
      if (d.quantityTiers && d.quantityTiers.length > 0) {
        setQuantityTiers(d.quantityTiers);
      }
      if (d.sameDayIncreasePercent !== undefined) {
        setSameDayIncreasePercent(String(d.sameDayIncreasePercent));
      }
      if (d.nextDayIncreasePercent !== undefined) {
        setNextDayIncreasePercent(String(d.nextDayIncreasePercent));
      }
      if (d.maxSameDayQuantity !== undefined) {
        setMaxSameDayQuantity(String(d.maxSameDayQuantity));
      }
      if (d.maxNextDayQuantity !== undefined) {
        setMaxNextDayQuantity(String(d.maxNextDayQuantity));
      }

      // If Full Mode (New Product Mode)
      if (importMode === 'full') {
        if (d.title) {
          setTitle(d.title);
          setSlug(slugify(d.title));
        }
        if (d.category) setCategory(d.category);
        if (d.description) setDescription(d.description);
        if (d.images && d.images.length > 0) {
          setImages(d.images);
          setImageUrl(d.images[0]);
        }
        if (d.customFields && d.customFields.length > 0) {
          setCustomFields(d.customFields);
        }
        setImportSuccessMsg(
          `⚡ Full Product Cloned: "${d.title}" with ${d.quantityTiers?.length || 0} tiers, ${d.customFields?.length || 0} dropdown fields, images, and turnaround rules!`
        );
      } else {
        // Price Matrix Only Mode (Existing Product Mode)
        setImportSuccessMsg(
          `⚡ Price Matrix Updated! Kept your Title, Description, Images, and Custom Options safe, and synced ${d.quantityTiers?.length || 0} price tiers and turnaround rates.`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error importing product data.');
    } finally {
      setIsImportingRoute1(false);
    }
  };

  // Approach B: Direct Variant Matrix Importer
  const handleImportForVariant = async (variantName: string) => {
    const urlToFetch = variantImportUrl.trim();
    if (!urlToFetch) {
      setError(`Please enter a URL to import prices for variant "${variantName}".`);
      return;
    }
    setIsImportingVariant(true);
    setError('');
    setVariantImportMsg('');

    try {
      const res = await fetch('/api/admin/scrape-route1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || `Failed to import prices for variant "${variantName}"`);
      }

      const d = result.data;
      if (d.quantityTiers && d.quantityTiers.length > 0) {
        setVariantQuantityTiers((prev) => ({
          ...prev,
          [variantName]: d.quantityTiers,
        }));
        const baseFormatted = d.price ? ` (Base: £${Number(d.price).toFixed(2)})` : '';
        setVariantImportMsg(
          `⚡ Imported ${d.quantityTiers.length} price tiers${baseFormatted} for "${d.matchedVariantName || variantName}" directly into variant table "${variantName}"!`
        );
      } else {
        throw new Error('No quantity tiers found in the provided URL.');
      }
    } catch (err: any) {
      setError(err.message || `Error importing prices for "${variantName}".`);
    } finally {
      setIsImportingVariant(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quantityTiers || quantityTiers.length === 0) {
      setError('Please configure at least one quantity tier.');
      return;
    }

    const firstTier = quantityTiers[0];
    if (!firstTier.quantity || firstTier.quantity <= 0) {
      setError('Base quantity (Tier 1) must be greater than 0.');
      return;
    }
    if (typeof firstTier.price !== 'number' || isNaN(firstTier.price) || firstTier.price <= 0) {
      setError('Please provide a valid Base Price (£) greater than 0 for Tier 1.');
      return;
    }

    const finalImages = images.length > 0 ? images : imageUrl.trim() ? [imageUrl.trim()] : [];
    if (finalImages.length === 0) {
      setError('Please upload at least one product picture.');
      return;
    }

    // Filter valid custom fields (must have a name and at least one option)
    const validCustomFields = customFields
      .filter((f) => f.name.trim().length > 0 && f.options.length > 0)
      .map((f) => ({
        ...f,
        name: f.name.trim(),
      }));

    // Sort tiers by quantity ascending to prevent order issues
    const sortedTiers = [...quantityTiers].sort((a, b) => a.quantity - b.quantity);
    const derivedBasePrice = sortedTiers[0].price || 14.69;
    const derivedMinQty = sortedTiers[0].quantity;
    const derivedMaxQty = sortedTiers[sortedTiers.length - 1].quantity;

    const parsedSameDayPct = parseFloat(sameDayIncreasePercent);
    const parsedNextDayPct = parseFloat(nextDayIncreasePercent);

    setIsSubmitting(true);
    try {
      const payload: ProductInput = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim(),
        imageUrl: finalImages[0],
        images: finalImages,
        price: Number(derivedBasePrice.toFixed(2)),
        category: category || categories[0]?.name || 'General',
        isSameDayAvailable,
        minQuantity: derivedMinQty,
        maxQuantity: derivedMaxQty,
        maxSameDayQuantity: maxSameDayQuantity.trim() !== '' ? parseInt(maxSameDayQuantity, 10) : undefined,
        maxNextDayQuantity: maxNextDayQuantity.trim() !== '' ? parseInt(maxNextDayQuantity, 10) : undefined,
        sameDayIncreasePercent: !isNaN(parsedSameDayPct) ? parsedSameDayPct : 35.4,
        nextDayIncreasePercent: !isNaN(parsedNextDayPct) ? parsedNextDayPct : 10,
        quantityTiers: sortedTiers,
        variantQuantityTiers:
          variantQuantityTiers && Object.keys(variantQuantityTiers).length > 0
            ? variantQuantityTiers
            : undefined,
        features: features.length > 0 ? features : [],
        customFields: validCustomFields.length > 0 ? validCustomFields : [],
      };

      if (discountedPrice.trim() !== '') {
        const parsedDiscount = parseFloat(discountedPrice);
        if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
          setError('Discounted price must be greater than 0.');
          setIsSubmitting(false);
          return;
        }
        payload.discountedPrice = parsedDiscount;
      } else {
        // Explicitly clear promotional strike-through price if empty
        payload.discountedPrice = null as any;
      }

      await onSubmit(payload, initialProduct?.id);
      setError('');
      setSaveSuccessMsg(
        initialProduct
          ? `Product "${payload.title}" updated successfully! You can continue making changes or close when finished.`
          : `Product "${payload.title}" created successfully! You can continue making changes or close when finished.`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
      setSaveSuccessMsg('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleRequestClose}
        title={initialProduct ? 'Edit Product' : 'Add New Product'}
        description="Update product information, custom dropdown fields, pricing, and category filters."
        maxWidth="7xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
          {saveSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessMsg('')}
                className="text-emerald-700 hover:text-emerald-950 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer shrink-0"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold">
              {error}
            </div>
          )}

        {/* Universal One-Click Auto-Fill Tool */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200/80 shadow-2xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#012169] text-white shadow-xs">
                <Lightning weight="fill" className="h-4 w-4 text-amber-300" />
              </span>
              <div>
                <span className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5 flex-wrap">
                  <span>Universal One-Click Auto-Fill (Route1 / Solopress)</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-[#012169] uppercase">
                    Universal Importer
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Paste any product URL from Route1Print or Solopress to instantly sync prices & details
                </p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-slate-200 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setImportMode('matrix_only')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  importMode === 'matrix_only'
                    ? 'bg-[#012169] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Only updates pricing tiers and turnaround surcharges. Keeps your existing Title, Images, Description, and Dropdowns safe!"
              >
                📊 Price Matrix Only (Existing Product)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('full')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  importMode === 'full'
                    ? 'bg-[#012169] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Overwrites Title, Description, Images, Dropdown Fields, and Pricing Matrix (Great for new products)"
              >
                📦 Full Product Clone
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            {/* Target Matrix Selector (if variant tables exist) */}
            {Object.keys(variantQuantityTiers).length > 0 && (
              <div
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-colors ${
                  importTarget !== 'default'
                    ? 'bg-blue-50 border-blue-200 text-blue-900 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">Target Table:</span>
                <select
                  value={importTarget}
                  onChange={(e) => {
                    setImportTarget(e.target.value);
                    setActiveVariantTab(e.target.value);
                  }}
                  className="h-7 text-xs font-bold text-[#012169] bg-transparent focus:outline-hidden cursor-pointer max-w-[280px]"
                >
                  <option value="default">
                    ★ Default Base Matrix {defaultCombinationName ? `(1st Options: ${defaultCombinationName})` : ''}
                  </option>
                  {Object.keys(variantQuantityTiers).map((k) => (
                    <option key={k} value={k}>
                      Variant: {k}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Globe className="h-4 w-4" />
              </span>
              <input
                type="url"
                value={route1Url}
                onChange={(e) => setRoute1Url(e.target.value)}
                placeholder="Paste URL (e.g. https://www.route1print.co.uk/... or https://www.solopress.com/...)"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-1 focus:ring-[#012169]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleImportRoute1()}
              disabled={isImportingRoute1}
              className="px-4 h-9 rounded-xl bg-[#012169] hover:bg-[#00174c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isImportingRoute1 ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Fetching Data...</span>
                </>
              ) : (
                <>
                  <Sparkle weight="bold" className="h-3.5 w-3.5 text-amber-300" />
                  <span>
                    {importTarget !== 'default'
                      ? `Import to "${importTarget}"`
                      : importMode === 'matrix_only'
                      ? 'Update Price Matrix'
                      : 'Fetch & Auto-Fill'}
                  </span>
                </>
              )}
            </button>
          </div>

          {importSuccessMsg && (
            <div className="mt-1 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Check weight="bold" className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ================= LEFT COLUMN: General Info, Pricing Rules, Description ================= */}
          <div className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Luxury Business Cards"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. luxury-business-cards"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Turnaround Speeds & Surcharge Rules */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Turnaround Speeds & Cutoff Rules
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Percentage surcharges over standard delivery
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Same-Day +%
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={sameDayIncreasePercent}
                      onChange={(e) => setSameDayIncreasePercent(e.target.value)}
                      placeholder="35.4"
                      className="w-full h-9 pl-2.5 pr-6 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                    />
                    <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">e.g. 35.4% or 40%</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1-Day +%
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={nextDayIncreasePercent}
                      onChange={(e) => setNextDayIncreasePercent(e.target.value)}
                      placeholder="10"
                      className="w-full h-9 pl-2.5 pr-6 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                    />
                    <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">e.g. 10% or 15%</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Same-Day Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxSameDayQuantity}
                    onChange={(e) => setMaxSameDayQuantity(e.target.value)}
                    placeholder="0 or 1000"
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">0 = disabled</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1-Day Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxNextDayQuantity}
                    onChange={(e) => setMaxNextDayQuantity(e.target.value)}
                    placeholder="0 or 5000"
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">0 = disabled</p>
                </div>
              </div>

              {/* Optional Discounted Reference Price */}
              <div className="pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Promotional Strike-Through Price (£) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    placeholder="e.g. 19.99"
                    className="w-36 h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Quantity Tiers & Base Price Engine Matrix */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Quantity Tiers & Pricing Engine</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#012169] text-[10px] font-bold">
                      {quantityTiers.length} Steps
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tier 1 sets the initial Base Price (£). Tier 2+ set the % increase over base price.
                  </p>
                </div>

                {/* Presets Button Bar */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-0.5">Preset:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('flyers')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Flyers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('businessCards')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('banners')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Banners
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('booklets')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Booklets
                  </button>
                </div>
              </div>

              {/* Variant-Specific Tier Matrix Switcher */}
              <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <SlidersHorizontal weight="bold" className="h-3.5 w-3.5 text-[#012169]" />
                    <span>Dedicated Pricing Tables per Variant</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeVariantTab === 'default'
                      ? 'Editing Default Base Table'
                      : `Editing Custom Table for: ${activeVariantTab}`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVariantTab('default');
                      setImportTarget('default');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeVariantTab === 'default'
                        ? 'bg-[#012169] text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ★ Default / Base Tiers {defaultCombinationName ? `(1st Options: ${defaultCombinationName})` : ''}
                  </button>

                  {Object.keys(variantQuantityTiers).map((vKey) => (
                    <div key={vKey} className="inline-flex items-center shadow-2xs rounded-lg overflow-hidden border border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVariantTab(vKey);
                          setImportTarget(vKey);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                          activeVariantTab === vKey
                            ? 'bg-[#012169] text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {vKey}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartCopyVariant(vKey)}
                        className={`px-1.5 py-1 text-xs transition-colors cursor-pointer border-l ${
                          activeVariantTab === vKey
                            ? 'bg-[#012169] text-amber-300 hover:text-white border-white/20'
                            : 'bg-white text-slate-400 hover:text-indigo-600 border-slate-200'
                        }`}
                        title={`Copy "${vKey}" table to create a new variant with exchanged values`}
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...variantQuantityTiers };
                          delete updated[vKey];
                          setVariantQuantityTiers(updated);
                          if (activeVariantTab === vKey) {
                            setActiveVariantTab('default');
                            setImportTarget('default');
                          }
                        }}
                        className={`px-1.5 py-1 rounded-r-lg text-xs transition-colors cursor-pointer border-l ${
                          activeVariantTab === vKey
                            ? 'bg-[#012169] text-white/80 hover:text-rose-200 border-white/20'
                            : 'bg-white text-slate-400 hover:text-rose-600 border-slate-200'
                        }`}
                        title="Delete variant table"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add / Create Variant Table Bar with Steady Options Picker */}
                  <div className="flex flex-wrap items-center gap-1.5 w-full pt-1.5">
                    <div className="relative flex-1 min-w-[220px]">
                      <input
                        type="text"
                        value={selectedVariantToAdd}
                        onChange={(e) => setSelectedVariantToAdd(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (selectedVariantToAdd.trim()) {
                              handleCreateVariantTable(selectedVariantToAdd.trim());
                            }
                          }
                        }}
                        placeholder="Type variant name, or click 'Pick' to choose options..."
                        className="w-full h-8.5 pl-3 pr-20 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:ring-1 focus:ring-[#012169]"
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenVariantPicker()}
                        className="absolute right-1 top-1 bottom-1 px-2.5 rounded-md bg-blue-50 hover:bg-[#012169] hover:text-white text-[#012169] text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-blue-200 shadow-2xs"
                        title="Open steady options picker to select and exchange values"
                      >
                        <SlidersHorizontal weight="bold" className="h-3 w-3" />
                        <span>Pick</span>
                      </button>
                    </div>

                    {/* Steady Multi-Option Picker Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenVariantPicker()}
                      className="h-8.5 px-3 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-[#012169] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                      title="Open steady list where you select each value and click Done"
                    >
                      <Sparkle weight="fill" className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Select Options...</span>
                    </button>

                    {/* Duplicate Active Table Shortcut Button */}
                    {activeVariantTab !== 'default' && (
                      <button
                        type="button"
                        onClick={() => handleStartCopyVariant(activeVariantTab)}
                        className="h-8.5 px-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                        title={`Duplicate current table "${activeVariantTab}" and exchange values`}
                      >
                        <Copy className="h-3.5 w-3.5 text-amber-700" />
                        <span>Copy Table</span>
                      </button>
                    )}

                    {/* Create Table Button */}
                    <button
                      type="button"
                      disabled={!selectedVariantToAdd.trim()}
                      onClick={() => handleCreateVariantTable()}
                      className="h-8.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Table</span>
                    </button>

                    {/* 1-Click Generate All Combination Tables Button */}
                    {allCombinations.length > 0 && (
                      <button
                        type="button"
                        onClick={handleGenerateAllCombinationTables}
                        className="h-8.5 px-3.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                        title={`Generate a dedicated pricing table for every dropdown combination (${allCombinations.length} tables) in 1 click`}
                      >
                        <Lightning weight="fill" className="h-3.5 w-3.5 text-purple-600" />
                        <span>Generate All Tables ({allCombinations.length})</span>
                      </button>
                    )}

                    {/* Clear All Variant Tables (if any exist) */}
                    {Object.keys(variantQuantityTiers).length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllVariantTables}
                        className="h-8.5 px-2.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-2xs"
                        title="Delete all variant tables and keep only the Default table"
                      >
                        <Trash className="h-3.5 w-3.5 text-rose-600" />
                        <span>Clear Tables</span>
                      </button>
                    )}
                  </div>
                </div>

                {activeVariantTab !== 'default' && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                      <span className="text-blue-700 font-bold flex items-center gap-1.5">
                        <Lightning weight="fill" className="h-3.5 w-3.5 text-amber-500" />
                        <span>Dedicated Pricing Matrix for: <strong>{activeVariantTab}</strong></span>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartCopyVariant(activeVariantTab)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                          title="Duplicate this table with all its prices and exchange options for a new variant"
                        >
                          <Copy className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Duplicate Table for New Variant</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVariantQuantityTiers((prev) => ({
                              ...prev,
                              [activeVariantTab]: JSON.parse(JSON.stringify(quantityTiers)),
                            }));
                          }}
                          className="text-xs text-slate-500 hover:text-[#012169] hover:underline font-bold cursor-pointer"
                        >
                          📋 Reset from Default Tiers
                        </button>
                      </div>
                    </div>

                    {/* Instant Variant Link Importer */}
                    <div className="p-2.5 rounded-xl bg-white border border-blue-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xs">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2 text-slate-400">
                          <Globe className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="url"
                          value={variantImportUrl}
                          onChange={(e) => setVariantImportUrl(e.target.value)}
                          placeholder={`Paste Route1 / Solopress link for ${activeVariantTab}...`}
                          className="w-full h-8 pl-8 pr-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#012169]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImportForVariant(activeVariantTab)}
                        disabled={isImportingVariant}
                        className="px-3 h-8 rounded-lg bg-[#012169] hover:bg-[#00174c] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60"
                      >
                        {isImportingVariant ? (
                          <>
                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Fetching...</span>
                          </>
                        ) : (
                          <>
                            <Sparkle weight="bold" className="h-3 w-3 text-amber-300" />
                            <span>Import to this Variant Table</span>
                          </>
                        )}
                      </button>
                    </div>

                    {variantImportMsg && (
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                        <Check weight="bold" className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{variantImportMsg}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity Tiers Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3 w-14">Tier</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Quantity</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Base £ / % Increase</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Calculated Price</th>
                        <th className="py-2.5 px-3 min-w-[90px]">Unit Price</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {currentTiers.map((tier, idx) => {
                        const isBaseTier = idx === 0;
                        const standardTotal = computedStandardPrice(tier, idx);
                        const unitPrice = computedUnitPrice(tier, idx);

                        return (
                          <tr key={idx} className={isBaseTier ? 'bg-blue-50/25' : 'hover:bg-slate-50/50'}>
                            {/* Step # */}
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isBaseTier
                                    ? 'bg-[#012169] text-white font-black'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isBaseTier ? 'Base' : `#${idx + 1}`}
                              </span>
                            </td>

                            {/* Quantity Input */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={tier.quantity}
                                onChange={(e) => handleUpdateTier(idx, 'quantity', e.target.value)}
                                placeholder={isBaseTier ? '25' : '50'}
                                className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#012169]"
                              />
                            </td>

                            {/* Price (Tier 1) or % Increase (Tier 2+) */}
                            <td className="py-2 px-3">
                              {isBaseTier ? (
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400 pointer-events-none">
                                    £
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={tier.price ?? ''}
                                    onChange={(e) => handleUpdateTier(idx, 'price', e.target.value)}
                                    placeholder="25.00"
                                    className="w-full h-8 pl-6 pr-2 rounded-lg border border-blue-300 text-xs font-bold text-[#012169] bg-white focus:outline-hidden focus:border-[#012169] focus:ring-1 focus:ring-[#012169]"
                                  />
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={tier.percentIncrease ?? ''}
                                    onChange={(e) => handleUpdateTier(idx, 'percentIncrease', e.target.value)}
                                    placeholder="40"
                                    className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#012169]"
                                  />
                                  <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400 pointer-events-none">
                                    %
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Computed Standard Total (£) */}
                            <td className="py-2 px-3 font-bold text-xs text-slate-900">
                              <span>£{standardTotal.toFixed(2)}</span>
                              {isBaseTier ? (
                                <span className="block text-[9px] text-slate-400 font-normal">
                                  Starting base
                                </span>
                              ) : tier.percentIncrease !== undefined ? (
                                <span className="block text-[9px] text-emerald-600 font-semibold">
                                  +{tier.percentIncrease}% over base
                                </span>
                              ) : null}
                            </td>

                            {/* Computed Unit Price (£/ea) */}
                            <td className="py-2 px-3 font-semibold text-xs text-slate-600">
                              <span>£{unitPrice.toFixed(3)}</span>
                              <span className="text-[10px] text-slate-400 font-normal"> / ea</span>
                            </td>

                            {/* Delete button */}
                            <td className="py-2 px-2 text-center">
                              {!isBaseTier && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTier(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Remove this tier"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Step Button Bar */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#012169] text-white text-xs font-bold rounded-lg hover:bg-[#0A358C] transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus weight="bold" className="h-3.5 w-3.5" />
                    <span>Add Quantity Step</span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Standard 3-5 days delivery base price
                  </span>
                </div>
              </div>
            </div>

            {/* Same Day Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightning weight="fill" className="h-4 w-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Same-Day London Dispatch</div>
                  <div className="text-[10px] text-slate-500">
                    Enable express same-day rush turnaround option
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isSameDayAvailable}
                onChange={(e) => setIsSameDayAvailable(e.target.checked)}
                className="h-5 w-5 rounded-md text-[#012169] focus:ring-[#012169] cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the product material, finish, dimensions, and turnaround..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169] resize-none"
              />
            </div>

            {/* Features Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Specifications & Features
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="e.g. 450gsm Matt Laminated Silk Board"
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {features.length > 0 && (
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span className="truncate">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Media & Custom Dropdowns ================= */}
          <div className="space-y-4">
            {/* Multi-Image S3 Uploader */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Product Gallery & Images <span className="text-rose-500">*</span>
              </label>
              <MultiImageUploader images={images} onImagesChange={handleImagesChange} />
            </div>

            {/* Custom Fields & Dropdown Options Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal weight="bold" className="h-4 w-4 text-[#012169]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Custom Dropdowns & Options
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Dynamic dropdown options for size, finish, paper, apparel, etc.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#012169] text-white text-xs font-bold hover:bg-[#0A358C] shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Dropdown</span>
                </button>
              </div>

              {/* Quick 1-Click Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Solopress Presets:
                </span>
                <button
                  type="button"
                  onClick={() => handleAddPreset('flyerSize')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Flyer Sizes (A5/A6/DL/A4/A3)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('sides')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Printed Sides (Single/Double)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('paperWeight')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Paper Stock (130-400gsm)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('finish')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Lamination (Matt/Gloss/Velvet)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('sets')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Number of Sets
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('size')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Card Sizes
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('apparelSize')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Apparel
                </button>
              </div>

              {/* Render Active Custom Fields */}
              {customFields.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No custom dropdowns yet. Click &ldquo;Add Dropdown&rdquo; or pick a Preset above.
                </div>
              ) : (
                <div className="space-y-3 pt-1 max-h-[520px] overflow-y-auto pr-1">
                  {customFields.map((field, fieldIdx) => (
                    <div
                      key={field.id}
                      draggable={editingOption === null}
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.closest('.no-field-drag')) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedFieldIndex(fieldIdx);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedFieldIndex !== null) {
                          handleMoveField(draggedFieldIndex, fieldIdx);
                          setDraggedFieldIndex(null);
                        }
                      }}
                      className={`p-3 rounded-xl bg-white border shadow-2xs space-y-2.5 transition-all ${
                        draggedFieldIndex === fieldIdx
                          ? 'border-[#012169] ring-2 ring-[#012169]/20 opacity-70'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Field Header with Drag Grip, Up/Down, Title Input, and Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1">
                          <div
                            className="p-1 text-slate-400 hover:text-[#012169] cursor-grab active:cursor-grabbing shrink-0"
                            title="Drag card to reorder dropdown"
                          >
                            <DotsSixVertical weight="bold" className="h-4 w-4" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">
                                Dropdown #{fieldIdx + 1} Title
                              </label>
                              <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">
                                Drag grip or use arrows to sort
                              </span>
                            </div>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => handleUpdateFieldName(field.id, e.target.value)}
                              placeholder="e.g. Finished Size, Printed Sides, Paper Stock..."
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                            />
                          </div>
                        </div>

                        {/* Controls: Up, Down, Delete */}
                        <div className="flex items-center gap-0.5 self-end mb-0.5 no-field-drag">
                          <button
                            type="button"
                            disabled={fieldIdx === 0}
                            onClick={() => handleMoveField(fieldIdx, fieldIdx - 1)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Move up"
                          >
                            <CaretUp weight="bold" className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={fieldIdx === customFields.length - 1}
                            onClick={() => handleMoveField(fieldIdx, fieldIdx + 1)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Move down"
                          >
                            <CaretDown weight="bold" className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomField(field.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer ml-1"
                            title="Delete this dropdown"
                          >
                            <Trash weight="bold" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Options (Values) list */}
                      <div className="no-field-drag">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-slate-600">
                            Selectable Dropdown Options (Values)
                          </label>
                          <span className="text-[9px] text-slate-400 font-medium">
                            💡 Double-click any value to edit · Drag to reorder
                          </span>
                        </div>

                        {/* Add option input */}
                        <div className="flex gap-1.5 mb-1.5">
                          <input
                            type="text"
                            value={activeNewOptionText[field.id] || ''}
                            onChange={(e) =>
                              setActiveNewOptionText({
                                ...activeNewOptionText,
                                [field.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOptionToField(field.id);
                              }
                            }}
                            placeholder="Add option name (e.g. A4, Matt Lamination, 170gsm Silk)..."
                            className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddOptionToField(field.id)}
                            className="px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        </div>

                        {/* Options list chips */}
                        {field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {field.options.map((opt, optIdx) => {
                              const isEditingThisOption =
                                editingOption?.fieldId === field.id &&
                                editingOption?.optionIndex === optIdx;

                              if (isEditingThisOption) {
                                return (
                                  <div
                                    key={`edit-${optIdx}`}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white border border-[#012169] ring-2 ring-[#012169]/20 shadow-xs"
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingOption.value}
                                      onChange={(e) =>
                                        setEditingOption({
                                          ...editingOption,
                                          value: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveOptionEdit();
                                        } else if (e.key === 'Escape') {
                                          setEditingOption(null);
                                        }
                                      }}
                                      onBlur={handleSaveOptionEdit}
                                      className="h-6 px-1 text-xs font-semibold text-slate-900 focus:outline-hidden min-w-[130px] max-w-[240px]"
                                    />
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSaveOptionEdit();
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                      title="Save (Enter)"
                                    >
                                      <Check weight="bold" className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setEditingOption(null);
                                      }}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                      title="Cancel (Esc)"
                                    >
                                      <X weight="bold" className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              }

                              const isBeingDragged =
                                draggedOption?.fieldId === field.id &&
                                draggedOption?.index === optIdx;

                              return (
                                <span
                                  key={optIdx}
                                  draggable={editingOption === null}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    setDraggedOption({ fieldId: field.id, index: optIdx });
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggedOption && draggedOption.fieldId === field.id) {
                                      handleMoveOption(field.id, draggedOption.index, optIdx);
                                      setDraggedOption(null);
                                    }
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingOption({
                                      fieldId: field.id,
                                      optionIndex: optIdx,
                                      value: opt,
                                    });
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all group select-none cursor-grab active:cursor-grabbing ${
                                    isBeingDragged
                                      ? 'bg-[#012169]/20 border-[#012169] opacity-60'
                                      : 'bg-[#012169]/10 hover:bg-[#012169]/15 border-[#012169]/20 text-[#012169]'
                                  }`}
                                  title="Double-click to edit · Drag to reorder"
                                >
                                  <DotsSixVertical
                                    weight="bold"
                                    className="h-2.5 w-2.5 text-[#012169]/40 group-hover:text-[#012169] shrink-0"
                                  />
                                  <span>{opt}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingOption({
                                        fieldId: field.id,
                                        optionIndex: optIdx,
                                        value: opt,
                                      });
                                    }}
                                    className="text-[#012169]/40 hover:text-[#012169] p-0.5 rounded cursor-pointer"
                                    title="Edit value"
                                  >
                                    <PencilSimple weight="bold" className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveOptionFromField(field.id, optIdx);
                                    }}
                                    className="text-[#012169]/60 hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                                    title="Remove option"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            ⚠️ Add at least one option value for this dropdown.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#012169] hover:bg-white text-xs font-bold text-slate-600 hover:text-[#012169] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Another Dropdown</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Form Actions Bar */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-2 z-20">
          <div className="flex items-center gap-2 min-w-0">
            {saveSuccessMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs truncate">
                <CheckCircle weight="bold" className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="truncate">Saved successfully — modal stays open for instant re-editing</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleRequestClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="uk-blue" size="md" isLoading={isSubmitting}>
              <FloppyDisk weight="bold" className="h-4 w-4 mr-1.5" />
              <span>{initialProduct ? 'Update Product' : 'Create Product'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>

    {/* Steady Variant Option Picker Modal */}
    <AnimatePresence>
      {isVariantPickerOpen && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsVariantPickerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className="relative w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 z-10 max-h-[88vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs">
                  <SlidersHorizontal weight="bold" className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight">
                    Variant Option Picker
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Select values from each dropdown below, exchange options easily, and click Done.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVariantPickerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Source Table Badge */}
            {copySourceTable && (
              <div className="mt-3 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Copy className="h-3.5 w-3.5 text-amber-700" />
                  <span>
                    Copying prices from:{' '}
                    <strong>{copySourceTable === 'default' ? 'Default Base Table' : copySourceTable}</strong>
                  </span>
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                  All price tiers cloned
                </span>
              </div>
            )}

            {/* Modal Scrollable Body: Custom Fields List */}
            <div className="py-3 space-y-3.5 overflow-y-auto flex-1 pr-1 mt-1">
              {customFields.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⚠️ No custom dropdown fields found</span>
                  </div>
                  <p className="text-amber-700 leading-relaxed">
                    Add dropdown fields (such as Size, Paper Stock, Printed Sides) in the &quot;Custom Dropdown Fields&quot; section below, or you can type your variant name directly into the text box.
                  </p>
                </div>
              ) : (
                customFields.map((field) => {
                  const selectedVal = pickerSelections[field.id];
                  return (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 transition-colors hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#012169]" />
                          <span>{field.name}</span>
                        </span>
                        {selectedVal ? (
                          <span className="text-[11px] font-bold text-[#012169] bg-blue-100/90 px-2 py-0.5 rounded-md border border-blue-200">
                            Selected: {selectedVal}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No option selected</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {field.options.map((opt) => {
                          const cleanOpt = cleanOptionDisplayName(opt).trim();
                          const isSelected = selectedVal === cleanOpt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleTogglePickerOption(field.id, cleanOpt)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                                isSelected
                                  ? 'bg-[#012169] text-white ring-2 ring-blue-500/30'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {isSelected && <Check weight="bold" className="h-3 w-3 text-emerald-400" />}
                              <span>{cleanOpt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Live Composed Variant Preview Card */}
            <div className="pt-2 shrink-0">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-[#012169] uppercase tracking-wider block">
                    Composed Variant Key
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono tracking-tight">
                    {composedVariantKey || (
                      <span className="text-slate-400 italic text-xs font-normal">
                        Select options above to preview...
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {Object.keys(pickerSelections).length} of {customFields.length} field{customFields.length === 1 ? '' : 's'} selected
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setPickerSelections({})}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-1 py-1 cursor-pointer transition-colors"
              >
                Clear Selections
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVariantPickerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="uk-blue"
                  size="sm"
                  disabled={!composedVariantKey}
                  onClick={handlePickerDone}
                >
                  <Check weight="bold" className="h-4 w-4 mr-1" />
                  <span>Done</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={!composedVariantKey}
                  onClick={handlePickerDoneAndCreate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span>Done &amp; Create Table</span>
                </Button>

                {allCombinations.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateAllCombinationTables}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer"
                    title={`Generate tables for all ${allCombinations.length} combinations in 1 click`}
                  >
                    <Lightning weight="fill" className="h-4 w-4 mr-1 text-amber-300" />
                    <span>Generate All ({allCombinations.length} Tables)</span>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* "Are you sure you want to close?" Confirmation Dialog */}
    <AnimatePresence>
      {showConfirmClose && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleCancelClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Confirmation Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 z-10 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3.5 border border-amber-200 shadow-2xs">
              <WarningCircle weight="fill" className="h-6 w-6 text-amber-600" />
            </div>

            <h4 className="text-base font-bold text-slate-900 mb-1.5">
              Are you sure you want to close?
            </h4>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Any unsaved changes or edits will be discarded. Do you want to continue editing or close the editor?
            </p>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancelClose}
                className="flex-1 font-semibold"
              >
                Keep Editing
              </Button>
              <Button
                type="button"
                size="md"
                onClick={handleConfirmClose}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold border-transparent shadow-2xs"
              >
                Yes, Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
  );
}

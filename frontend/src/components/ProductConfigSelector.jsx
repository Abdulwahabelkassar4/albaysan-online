import { useMemo, useCallback } from "react";

/**
 * Customer-facing product configuration selector.
 * Shows pieces, options, and values. Handles:
 * - Dynamic price calculation
 * - Description override resolution
 * - Required/optional validation
 * - Conditional (dependent) option visibility
 * - Default value pre-selection
 */

const ProductConfigSelector = ({
  product,
  selections,
  onSelectionsChange,
  onImageChange,
  priceSuffix = "د.أ",
}) => {
  if (!product?.configurable || !product?.pieces?.length) return null;

  // Flatten all options for dependency checking
  const allOptions = useMemo(
    () => (product.pieces || []).flatMap((p) => p.options || []),
    [product.pieces]
  );

  // Check if an option should be visible based on its dependency
  const isOptionVisible = useCallback(
    (option) => {
      if (!option.dependsOnOptionId || !option.dependsOnValueId) return true;
      const parentValue = selections[option.dependsOnOptionId];
      return parentValue === option.dependsOnValueId;
    },
    [selections]
  );

  // Calculate total price adjustment
  const totalAdjustment = useMemo(() => {
    let adj = 0;
    for (const piece of product.pieces) {
      for (const option of piece.options) {
        if (!isOptionVisible(option)) continue;
        const selectedValueId = selections[option._id];
        if (!selectedValueId) continue;
        const value = option.values?.find((v) => v._id === selectedValueId && v.active !== false);
        if (value) adj += Number(value.priceAdjustment) || 0;
      }
    }
    return adj;
  }, [product.pieces, selections, isOptionVisible]);

  // Determine the active description override
  const activeDescription = useMemo(() => {
    let desc = null;
    for (const piece of product.pieces) {
      for (const option of piece.options) {
        const selectedValueId = selections[option._id];
        if (!selectedValueId) continue;
        const value = option.values?.find((v) => v._id === selectedValueId);
        if (value?.descriptionOverride) desc = value.descriptionOverride;
      }
    }
    return desc;
  }, [product.pieces, selections]);

  // Get validation errors
  const validationErrors = useMemo(() => {
    const errors = [];
    for (const piece of product.pieces) {
      for (const option of piece.options) {
        if (!isOptionVisible(option)) continue;
        if (option.required && !selections[option._id]) {
          errors.push(`يرجى اختيار ${option.name}`);
        }
      }
    }
    return errors;
  }, [product.pieces, selections, isOptionVisible]);

  const handleSelect = (optionId, val) => {
    const newSelections = { ...selections, [optionId]: val._id };

    // Clear dependent options when parent changes
    for (const opt of allOptions) {
      if (opt.dependsOnOptionId === optionId) {
        delete newSelections[opt._id];
      }
    }

    onSelectionsChange(newSelections);

    // Dynamic image swap if option value has an image
    if (val.image && onImageChange) {
      onImageChange(val.image);
    }
  };

  const configuredPrice = (product.price || 0) + totalAdjustment;

  return (
    <div className="space-y-5">
      {/* Pieces and their options */}
      {product.pieces
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((piece) => {
          const visibleOptions = (piece.options || [])
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .filter(isOptionVisible);

          if (visibleOptions.length === 0) return null;

          return (
            <div key={piece._id} className="space-y-3">
              <h3 className="text-xs font-bold text-secondary-300 flex items-center gap-1.5">
                🧩 {piece.name}
              </h3>

              {visibleOptions.map((option) => {
                const activeValues = (option.values || [])
                  .filter((v) => v.active !== false)
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

                if (activeValues.length === 0) return null;

                const selectedValueId = selections[option._id];
                const isRequired = option.required;
                const hasError = isRequired && !selectedValueId;

                return (
                  <div key={option._id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-white/80">
                        {option.name}
                      </label>
                      {isRequired && (
                        <span className="text-[10px] text-rose-400 font-bold">مطلوب *</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {activeValues.map((val) => {
                        const isSelected = selectedValueId === val._id;
                        const adjustment = Number(val.priceAdjustment) || 0;

                        return (
                          <button
                            key={val._id}
                            type="button"
                            onClick={() => handleSelect(option._id, val)}
                            className={`group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                              isSelected
                                ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-900/30 scale-[1.02] ring-2 ring-primary-400/50"
                                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/10 hover:border-white/25"
                            }`}
                          >
                            {val.image && (
                              <img
                                src={val.image}
                                alt={val.label}
                                className="h-5 w-5 rounded-md object-cover border border-white/30 shrink-0"
                              />
                            )}
                            <span>{val.label}</span>
                            {adjustment > 0 && (
                              <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-primary-300"}`}>
                                +{adjustment} {priceSuffix}
                              </span>
                            )}
                            {val.isDefault && !selectedValueId && (
                              <span className="absolute -top-1 -left-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow-sm">
                                افتراضي
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {hasError && (
                      <p className="text-[10px] text-rose-400 font-semibold animate-pulse">
                        ⚠ يرجى اختيار {option.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

      {/* Price summary when adjustments exist */}
      {totalAdjustment > 0 && (
        <div className="rounded-xl border border-primary-400/20 bg-primary-950/30 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-white/60">السعر بعد التهيئة</span>
          <span className="text-sm font-black text-primary-400">
            {configuredPrice} {priceSuffix}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Helper: compute initial default selections from product config
 */
export const getDefaultSelections = (product) => {
  const selections = {};
  if (!product?.configurable || !product?.pieces?.length) return selections;

  for (const piece of product.pieces) {
    for (const option of piece.options || []) {
      const defaultValue = (option.values || []).find((v) => v.isDefault && v.active !== false);
      if (defaultValue) {
        selections[option._id] = defaultValue._id;
      }
    }
  }
  return selections;
};

/**
 * Helper: get the description to display based on current selections
 */
export const getActiveDescription = (product, selections) => {
  if (!product?.configurable || !product?.pieces?.length) return product?.description || "";

  let desc = product.description || "";
  for (const piece of product.pieces) {
    for (const option of piece.options || []) {
      const selectedValueId = selections[option._id];
      if (!selectedValueId) continue;
      const value = (option.values || []).find((v) => v._id === selectedValueId);
      if (value?.descriptionOverride) desc = value.descriptionOverride;
    }
  }
  return desc;
};

/**
 * Helper: calculate configured price
 */
export const getConfiguredPrice = (product, selections) => {
  if (!product?.configurable || !product?.pieces?.length) return product?.price || 0;

  let adjustment = 0;
  for (const piece of product.pieces) {
    for (const option of piece.options || []) {
      // Check conditional dependency
      if (option.dependsOnOptionId && option.dependsOnValueId) {
        const parentValue = selections[option.dependsOnOptionId];
        if (parentValue !== option.dependsOnValueId) continue;
      }

      const selectedValueId = selections[option._id];
      if (!selectedValueId) continue;
      const value = (option.values || []).find((v) => v._id === selectedValueId && v.active !== false);
      if (value) adjustment += Number(value.priceAdjustment) || 0;
    }
  }
  return (product.price || 0) + adjustment;
};

/**
 * Helper: validate that all required options are selected
 */
export const validateSelections = (product, selections) => {
  const errors = [];
  if (!product?.configurable || !product?.pieces?.length) return errors;

  for (const piece of product.pieces) {
    for (const option of piece.options || []) {
      // Check conditional dependency
      if (option.dependsOnOptionId && option.dependsOnValueId) {
        const parentValue = selections[option.dependsOnOptionId];
        if (parentValue !== option.dependsOnValueId) continue;
      }

      if (option.required && !selections[option._id]) {
        errors.push(`يرجى اختيار ${option.name}`);
      }
    }
  }
  return errors;
};

/**
 * Helper: build config snapshot for cart item
 */
export const buildConfigSnapshot = (product, selections) => {
  const snapshot = [];
  if (!product?.configurable || !product?.pieces?.length) return snapshot;

  for (const piece of product.pieces) {
    for (const option of piece.options || []) {
      if (option.dependsOnOptionId && option.dependsOnValueId) {
        const parentValue = selections[option.dependsOnOptionId];
        if (parentValue !== option.dependsOnValueId) continue;
      }

      const selectedValueId = selections[option._id];
      if (!selectedValueId) continue;
      const value = (option.values || []).find((v) => v._id === selectedValueId);
      if (value) {
        snapshot.push({
          pieceName: piece.name,
          optionName: option.name,
          selectedValue: value.label,
          priceAdjustment: Number(value.priceAdjustment) || 0,
        });
      }
    }
  }
  return snapshot;
};

export default ProductConfigSelector;

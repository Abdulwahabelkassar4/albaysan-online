import { useState, useCallback } from "react";

// ─── Utility: generate a temporary client-side ID for new items ───
let _tempIdCounter = 0;
const tempId = () => `_new_${Date.now()}_${++_tempIdCounter}`;

// ─── Small icon components ───
const ChevronDown = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronUp = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const PlusIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const TrashIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── Description Override Editor ───
const DescriptionOverrideEditor = ({ value, baseDescription, onChange }) => {
  const [isEditing, setIsEditing] = useState(!!value);
  const hasOverride = value !== null && value !== undefined && value !== "";

  const handleEnable = () => {
    setIsEditing(true);
    if (!hasOverride) {
      onChange(baseDescription || "");
    }
  };

  const handleReset = () => {
    setIsEditing(false);
    onChange(null);
  };

  if (!isEditing && !hasOverride) {
    return (
      <button
        type="button"
        onClick={handleEnable}
        className="text-xs text-secondary-300 hover:text-secondary-200 transition flex items-center gap-1"
      >
        ✏️ تخصيص الوصف لهذا الخيار
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-amber-200">وصف مخصص لهذا الخيار</label>
        <button
          type="button"
          onClick={handleReset}
          className="text-[10px] text-rose-300 hover:text-rose-200 transition"
        >
          ↩ استخدام الوصف الأساسي
        </button>
      </div>
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="اكتب الوصف المخصص لهذا الخيار..."
        className="w-full rounded-xl border border-amber-400/30 bg-neutral-800/80 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
      />
    </div>
  );
};

// ─── Option Value Row ───
const OptionValueRow = ({ val, index, onUpdate, onRemove, baseDescription }) => (
  <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 font-mono w-5 text-center">{index + 1}</span>
      <input
        type="text"
        value={val.label || ""}
        onChange={(e) => onUpdate({ ...val, label: e.target.value })}
        placeholder="اسم القيمة (مثال: كلوش)"
        className="flex-1 rounded-lg border border-white/20 bg-neutral-800 px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-white/50">+</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={val.priceAdjustment ?? 0}
          onChange={(e) => onUpdate({ ...val, priceAdjustment: Number(e.target.value) || 0 })}
          className="w-20 rounded-lg border border-white/20 bg-neutral-800 px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-primary-400"
        />
        <span className="text-[10px] text-white/50">د.أ</span>
      </div>
      <button
        type="button"
        onClick={() => onUpdate({ ...val, isDefault: !val.isDefault })}
        title={val.isDefault ? "إلغاء الافتراضي" : "تعيين كافتراضي"}
        className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
          val.isDefault
            ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
            : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
        }`}
      >
        {val.isDefault ? "✓ افتراضي" : "افتراضي"}
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/20 transition"
        title="حذف القيمة"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </div>
    <DescriptionOverrideEditor
      value={val.descriptionOverride}
      baseDescription={baseDescription}
      onChange={(desc) => onUpdate({ ...val, descriptionOverride: desc })}
    />
  </div>
);

// ─── Option Card ───
const OptionCard = ({ option, optionIndex, onUpdate, onRemove, baseDescription, allOptions }) => {
  const [collapsed, setCollapsed] = useState(false);

  const updateValue = (valIndex, updatedVal) => {
    const newValues = [...option.values];
    if (updatedVal.isDefault && !option.values[valIndex].isDefault) {
      newValues.forEach((v, i) => { if (i !== valIndex) newValues[i] = { ...v, isDefault: false }; });
    }
    newValues[valIndex] = updatedVal;
    onUpdate({ ...option, values: newValues });
  };

  const removeValue = (valIndex) => {
    onUpdate({ ...option, values: option.values.filter((_, i) => i !== valIndex) });
  };

  const addValue = () => {
    onUpdate({
      ...option,
      values: [
        ...option.values,
        { _id: tempId(), label: "", priceAdjustment: 0, descriptionOverride: null, isDefault: false, sortOrder: option.values.length, active: true },
      ],
    });
  };

  const dependencyOptions = allOptions.filter(
    (opt) => (opt._id || opt.id) !== (option._id || option.id)
  );

  return (
    <div className="rounded-2xl border border-purple-400/20 bg-purple-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setCollapsed(!collapsed)} className="text-white/60 hover:text-white transition">
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>
        <input
          type="text"
          value={option.name || ""}
          onChange={(e) => onUpdate({ ...option, name: e.target.value })}
          placeholder={`اسم الخيار ${optionIndex + 1} (مثال: نمط التنورة)`}
          className="flex-1 rounded-xl border border-white/20 bg-neutral-800 px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
        />
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={option.required || false}
            onChange={(e) => onUpdate({ ...option, required: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-white/20 bg-neutral-800 text-purple-500"
          />
          <span className="text-[10px] font-semibold text-white/70">مطلوب</span>
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl p-1.5 text-rose-400 hover:bg-rose-500/20 transition"
          title="حذف الخيار"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {dependencyOptions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/50">
          <span>يظهر فقط عند:</span>
          <select
            value={option.dependsOnOptionId || ""}
            onChange={(e) => {
              const depOptId = e.target.value || null;
              onUpdate({ ...option, dependsOnOptionId: depOptId, dependsOnValueId: null });
            }}
            className="rounded-lg border border-white/15 bg-neutral-800 px-2 py-1 text-[10px] text-white focus:outline-none"
          >
            <option value="">— بدون شرط (يظهر دائماً) —</option>
            {dependencyOptions.map((depOpt) => (
              <option key={depOpt._id || depOpt.id} value={depOpt._id || depOpt.id}>
                {depOpt.name || "خيار بدون اسم"}
              </option>
            ))}
          </select>
          {option.dependsOnOptionId && (() => {
            const parentOption = dependencyOptions.find(
              (o) => (o._id || o.id) === option.dependsOnOptionId
            );
            return parentOption?.values?.length > 0 ? (
              <>
                <span>=</span>
                <select
                  value={option.dependsOnValueId || ""}
                  onChange={(e) => onUpdate({ ...option, dependsOnValueId: e.target.value || null })}
                  className="rounded-lg border border-white/15 bg-neutral-800 px-2 py-1 text-[10px] text-white focus:outline-none"
                >
                  <option value="">— اختر القيمة —</option>
                  {parentOption.values.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.label || "قيمة بدون اسم"}
                    </option>
                  ))}
                </select>
              </>
            ) : null;
          })()}
        </div>
      )}

      {!collapsed && (
        <>
          <div className="space-y-2">
            {option.values.map((val, valIndex) => (
              <OptionValueRow
                key={val._id || val.id || valIndex}
                val={val}
                index={valIndex}
                onUpdate={(updated) => updateValue(valIndex, updated)}
                onRemove={() => removeValue(valIndex)}
                baseDescription={baseDescription}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addValue}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/20 px-3 py-1.5 text-xs text-white/60 hover:border-white/40 hover:text-white transition"
          >
            <PlusIcon className="h-3 w-3" />
            إضافة قيمة
          </button>
        </>
      )}
    </div>
  );
};

// ─── Piece Card ───
const PieceCard = ({ piece, pieceIndex, onUpdate, onRemove, onMoveUp, onMoveDown, canMoveUp, canMoveDown, baseDescription, allOptions }) => {
  const [collapsed, setCollapsed] = useState(false);

  const updateOption = (optIndex, updatedOpt) => {
    const newOptions = [...piece.options];
    newOptions[optIndex] = updatedOpt;
    onUpdate({ ...piece, options: newOptions });
  };

  const removeOption = (optIndex) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الخيار؟")) return;
    onUpdate({ ...piece, options: piece.options.filter((_, i) => i !== optIndex) });
  };

  const addOption = () => {
    onUpdate({
      ...piece,
      options: [
        ...piece.options,
        {
          _id: tempId(),
          name: "",
          required: false,
          sortOrder: piece.options.length,
          dependsOnOptionId: null,
          dependsOnValueId: null,
          values: [],
        },
      ],
    });
  };

  return (
    <div className="rounded-2xl border border-secondary-400/30 bg-secondary-950/20 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="text-white/40 hover:text-white disabled:opacity-20 transition"
            title="تحريك للأعلى"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="text-white/40 hover:text-white disabled:opacity-20 transition"
            title="تحريك للأسفل"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <button type="button" onClick={() => setCollapsed(!collapsed)} className="text-white/60 hover:text-white transition">
          {collapsed ? <ChevronDown /> : <ChevronUp />}
        </button>

        <span className="text-xs font-bold text-secondary-300">قطعة {pieceIndex + 1}</span>
        <input
          type="text"
          value={piece.name || ""}
          onChange={(e) => onUpdate({ ...piece, name: e.target.value })}
          placeholder="اسم القطعة (مثال: تنورة، بلوزة)"
          className="flex-1 rounded-xl border border-white/20 bg-neutral-800 px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:ring-1 focus:ring-secondary-400"
        />
        <button
          type="button"
          onClick={onRemove}
          className="rounded-xl p-1.5 text-rose-400 hover:bg-rose-500/20 transition"
          title="حذف القطعة"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="space-y-3 mr-6">
            {piece.options.map((option, optIndex) => (
              <OptionCard
                key={option._id || option.id || optIndex}
                option={option}
                optionIndex={optIndex}
                onUpdate={(updated) => updateOption(optIndex, updated)}
                onRemove={() => removeOption(optIndex)}
                baseDescription={baseDescription}
                allOptions={allOptions}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 mr-6 rounded-xl border border-dashed border-purple-400/30 bg-purple-950/20 px-3 py-2 text-xs text-purple-300 hover:bg-purple-950/40 hover:text-purple-200 transition"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            إضافة خيار لهذه القطعة
          </button>
        </>
      )}
    </div>
  );
};

// ─── Main Configuration Builder ───
const ProductConfigBuilder = ({ pieces, onChange, baseDescription }) => {
  const allOptions = (pieces || []).flatMap((p) => p.options || []);

  const updatePiece = useCallback(
    (pieceIndex, updatedPiece) => {
      const newPieces = [...pieces];
      newPieces[pieceIndex] = updatedPiece;
      onChange(newPieces);
    },
    [pieces, onChange]
  );

  const removePiece = useCallback(
    (pieceIndex) => {
      if (!window.confirm("هل أنت متأكد من حذف هذه القطعة وجميع خياراتها؟")) return;
      onChange(pieces.filter((_, i) => i !== pieceIndex));
    },
    [pieces, onChange]
  );

  const addPiece = useCallback(() => {
    onChange([
      ...pieces,
      {
        _id: tempId(),
        name: "",
        sortOrder: pieces.length,
        options: [],
      },
    ]);
  }, [pieces, onChange]);

  const movePiece = useCallback(
    (from, to) => {
      if (to < 0 || to >= pieces.length) return;
      const newPieces = [...pieces];
      const [moved] = newPieces.splice(from, 1);
      newPieces.splice(to, 0, moved);
      newPieces.forEach((p, i) => { p.sortOrder = i; });
      onChange(newPieces);
    },
    [pieces, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          🧩 قطع المنتج والخيارات
        </h3>
        <span className="text-[10px] text-white/40">{pieces.length} قطعة</span>
      </div>

      <div className="space-y-4">
        {pieces.map((piece, pieceIndex) => (
          <PieceCard
            key={piece._id || piece.id || pieceIndex}
            piece={piece}
            pieceIndex={pieceIndex}
            onUpdate={(updated) => updatePiece(pieceIndex, updated)}
            onRemove={() => removePiece(pieceIndex)}
            onMoveUp={() => movePiece(pieceIndex, pieceIndex - 1)}
            onMoveDown={() => movePiece(pieceIndex, pieceIndex + 1)}
            canMoveUp={pieceIndex > 0}
            canMoveDown={pieceIndex < pieces.length - 1}
            baseDescription={baseDescription}
            allOptions={allOptions}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addPiece}
        className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-secondary-400/40 bg-secondary-950/30 px-4 py-2.5 text-sm font-semibold text-secondary-300 hover:bg-secondary-950/50 hover:text-secondary-200 transition w-full justify-center"
      >
        <PlusIcon className="h-4 w-4" />
        إضافة قطعة جديدة
      </button>
    </div>
  );
};

export default ProductConfigBuilder;

import { useState } from "react";
import { PaletteIcon, SparkleIcon } from "./icons.jsx";

const ColorGuideModal = ({ isOpen, onClose, colorGuides = [], selectedColor, onSelectColor }) => {
  const [activeTab, setActiveTab] = useState("all");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-neutral-900/95 p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-right" dir="rtl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-secondary-500/20 p-2.5 text-secondary-300 border border-secondary-400/30">
              <PaletteIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🎨 دليل عينات صور الألوان الحقيقية
              </h2>
              <p className="text-xs text-white/70">
                عينات أقمشة حقيقية مصورة تحت إضاءة الكاميرا لمطابقة درجة اللون بدقة عالية.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Info Banner */}
        <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2">
          <SparkleIcon className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <p>
            قد تختلف درجات الألوان بسيطة بحسب شاشة جهازك، ولكن تم التقاط هذه العينات لتقريب الدرجة الحقيقية للقماش.
          </p>
        </div>

        {/* Color Reference Grid */}
        <div className="mt-6 overflow-y-auto space-y-4 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {colorGuides.map((guide) => {
              const isSelected = selectedColor === guide.name;
              return (
                <div
                  key={guide._id || guide.name}
                  onClick={() => {
                    onSelectColor?.(guide.name);
                    onClose();
                  }}
                  className={`group cursor-pointer rounded-2xl border p-3 transition-all duration-300 hover:scale-[1.02] ${
                    isSelected
                      ? "border-secondary-400 bg-secondary-950/40 ring-2 ring-secondary-400/50 shadow-lg"
                      : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  }`}
                >
                  {/* Photo Sample Frame */}
                  <div className="relative h-44 w-full overflow-hidden rounded-xl bg-neutral-800 border border-white/10">
                    {guide.imageUrl ? (
                      <img
                        src={guide.imageUrl}
                        alt={guide.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center text-xs font-bold text-white/50"
                        style={{ backgroundColor: guide.hexCode || "#121212" }}
                      >
                        عينة لون {guide.name}
                      </div>
                    )}
                    
                    {/* Hex Badge */}
                    <div
                      className="absolute bottom-2 right-2 h-7 w-7 rounded-full border border-white/40 shadow-lg"
                      style={{ backgroundColor: guide.hexCode || "#121212" }}
                      title={guide.hexCode}
                    />

                    {isSelected && (
                      <div className="absolute top-2 left-2 rounded-full bg-secondary-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                        المحدد حالياً ✓
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-secondary-300 transition">
                        {guide.name}
                      </h4>
                      {guide.description && (
                        <p className="text-[11px] text-white/60 truncate max-w-[170px]">
                          {guide.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-secondary-500 text-white"
                          : "bg-white/10 text-white/80 group-hover:bg-secondary-500/80 group-hover:text-white"
                      }`}
                    >
                      {isSelected ? "محدد" : "اختيار"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {colorGuides.length === 0 && (
            <div className="p-12 text-center text-sm text-white/50">
              جاري تحميل دليل عينات الألوان...
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-white/50">انقري على عينة اللون لاختياره مباشرة</p>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            إغلاق المرجعية
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorGuideModal;

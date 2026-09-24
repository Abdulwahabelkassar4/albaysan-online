import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import axiosClient from "../api/axiosClient.js";
import {
  CloseIcon,
  CartIcon,
  PaletteIcon,
  SparkleIcon,
  PlusIcon,
  MinusIcon,
} from "./icons.jsx";
import ColorGuideModal from "./ColorGuideModal.jsx";
import ProductConfigSelector, {
  getDefaultSelections,
  getActiveDescription,
  getConfiguredPrice,
  validateSelections,
  buildConfigSnapshot,
} from "./ProductConfigSelector.jsx";

const normalizeImages = (images, fallbackImage) => {
  const normalized = Array.isArray(images)
    ? images.map((image) => (typeof image === "string" ? image : image?.url)).filter(Boolean)
    : [];

  if (!normalized.length && fallbackImage) {
    normalized.push(fallbackImage);
  }

  return normalized;
};

const QuickAddModal = ({ product, isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { addItem, openCart } = useCart();
  const { showToast } = useToast();
  const isRTL = i18n.language === "ar";

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [configSelections, setConfigSelections] = useState({});
  const [configErrors, setConfigErrors] = useState([]);
  const [colorGuides, setColorGuides] = useState([]);
  const [isColorGuideOpen, setIsColorGuideOpen] = useState(false);

  const productId = product?._id || product?.id;

  // Initialize or reset selections when product changes or modal opens
  useEffect(() => {
    if (!product || !isOpen) return;

    const galleryImages = normalizeImages(product.images, product.image);
    setSelectedImage(galleryImages[0] || product.image || "");
    setSelectedSize(product.sizes?.[0] || t("product.defaultSize") || "Free size");
    setSelectedColor(product.colors?.[0] || t("product.defaultColor") || "افتراضي");
    setSelectedQty(1);
    setConfigErrors([]);

    if (product.configurable && product.pieces?.length) {
      setConfigSelections(getDefaultSelections(product));
    } else {
      setConfigSelections({});
    }
  }, [product, isOpen, t]);

  // Fetch color guides once
  useEffect(() => {
    if (!isOpen) return;
    const fetchColors = async () => {
      try {
        const { data } = await axiosClient.get("/api/colors");
        if (Array.isArray(data)) setColorGuides(data);
      } catch (err) {
        console.error("Failed to fetch color guides", err);
      }
    };
    fetchColors();
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const galleryImages = normalizeImages(product.images, product.image);
  const primaryImage = selectedImage || galleryImages[0] || product.image || "";

  const isConfigurable = Boolean(product.configurable && product.pieces?.length > 0);
  const configuredPrice = isConfigurable
    ? getConfiguredPrice(product, configSelections)
    : product.price || 0;
  const activeDescription = isConfigurable
    ? getActiveDescription(product, configSelections)
    : product.description || "";

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (!product) return;

    // Validate required configuration options
    if (isConfigurable) {
      const errors = validateSelections(product, configSelections);
      setConfigErrors(errors);
      if (errors.length > 0) return;
    }

    const cartItem = {
      id: productId,
      productId: productId,
      name: product.name,
      description: activeDescription || product.description || "",
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      image: primaryImage,
      qty: selectedQty,
    };

    if (isConfigurable) {
      cartItem.configuredPrice = configuredPrice;
      cartItem.configSnapshot = buildConfigSnapshot(product, configSelections);
      cartItem.configuration = {
        productId: productId,
        selections: { ...configSelections },
      };
    }

    addItem(cartItem);
    showToast(t("productCard.quickAddSuccess") || "تمت إضافة المنتج إلى السلة بنجاح 🛍️", "success");
    onClose();
    openCart();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Dialog */}
        <div
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-neutral-900/95 p-5 sm:p-6 text-white shadow-2xl backdrop-blur-xl max-h-[92vh] flex flex-col"
          dir={isRTL ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-500/20 text-primary-400">
                <CartIcon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">
                  إضافة سريعة وتحديد الخيارات
                </h3>
                <p className="text-[11px] text-white/60">
                  اختاري المقاس، اللون، والتفاصيل المطلوبة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
              title="إغلاق"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Body content */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
            {/* Product Header Card */}
            <div className="flex gap-3.5 rounded-2xl bg-white/5 p-3 border border-white/10">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-800 border border-white/10">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-white/40">
                    {product.name?.slice(0, 2)}
                  </div>
                )}
                {discountPercentage && (
                  <span className="absolute top-1 right-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-medium text-primary-300">
                      {product.category || "متجر البيلسان"}
                    </span>
                    <Link
                      to={`/product/${productId}`}
                      onClick={onClose}
                      className="text-[11px] font-semibold text-white/60 hover:text-primary-300 underline transition"
                    >
                      صفحة المنتج ↗
                    </Link>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{product.name}</h4>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-base font-black text-primary-400">
                    {configuredPrice} {t("product.priceSuffix")}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-white/40 line-through font-medium">
                      {product.originalPrice} {t("product.priceSuffix")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Description Banner (Fabric & Specifications) */}
            {activeDescription && (
              <div className="rounded-2xl border border-secondary-500/20 bg-secondary-950/30 p-3 text-xs leading-relaxed text-secondary-100">
                <span className="block font-bold text-secondary-300 mb-1 text-[11px]">
                  📝 تفاصيل ووصف المنتج:
                </span>
                <p className="whitespace-pre-line text-white/90">{activeDescription}</p>
              </div>
            )}

            {/* Sizes Selection */}
            {product.sizes?.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80">
                  {t("product.selectSize") || "اختاري المقاس"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                        selectedSize === size
                          ? "bg-primary-600 text-white shadow-md shadow-primary-600/40 ring-2 ring-primary-400"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Selection with Color Reference Button */}
            {product.colors?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/80">
                    {t("product.selectColor") || "اختاري اللون"}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsColorGuideOpen(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-secondary-400/40 bg-secondary-500/20 px-2.5 py-0.5 text-[11px] font-bold text-secondary-200 hover:bg-secondary-500/30 transition shadow-xs"
                  >
                    <PaletteIcon className="h-3.5 w-3.5" />
                    <span>🎨 عينات الألوان</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorName) => {
                    const match = colorGuides.find((g) => g.name === colorName);
                    const isSelected = selectedColor === colorName;

                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setSelectedColor(colorName)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                          isSelected
                            ? "bg-secondary-600 text-white ring-2 ring-secondary-400 shadow-md scale-105"
                            : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                        }`}
                      >
                        {match?.hexCode && (
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/40 shadow-xs shrink-0"
                            style={{ backgroundColor: match.hexCode }}
                          />
                        )}
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Product Configuration Selector (Custom piece options like skirt type, sleeve, etc.) */}
            {isConfigurable && (
              <div className="space-y-3 border-t border-white/10 pt-3">
                <ProductConfigSelector
                  product={product}
                  selections={configSelections}
                  onSelectionsChange={(newSelections) => {
                    setConfigSelections(newSelections);
                    setConfigErrors([]);
                  }}
                  onImageChange={setSelectedImage}
                  priceSuffix={t("product.priceSuffix")}
                />
                {configErrors.length > 0 && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-2 space-y-1">
                    {configErrors.map((err, i) => (
                      <p key={i} className="text-xs text-rose-300 font-semibold">
                        ⚠ {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity Counter */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs font-bold text-white/80">الكمية المطلوبة:</span>
              <div className="flex items-center gap-2 rounded-xl bg-white/10 p-1 border border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white transition"
                  title="إنقاص الكمية"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold text-sm text-white">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty((q) => q + 1)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/15 hover:text-white transition"
                  title="زيادة الكمية"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Action Button */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <button
              onClick={handleAddToCart}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-500 py-3 text-sm font-bold text-white shadow-xl shadow-primary-950/50 transition-all hover:scale-[1.02] active:scale-95"
            >
              <CartIcon className="h-4 w-4" />
              <span>
                إضافة إلى السلة ({(configuredPrice * selectedQty).toFixed(2)}{" "}
                {t("product.priceSuffix")})
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Color Reference Guide Modal */}
      <ColorGuideModal
        isOpen={isColorGuideOpen}
        onClose={() => setIsColorGuideOpen(false)}
        colorGuides={colorGuides}
        selectedColor={selectedColor}
        onSelectColor={(colorName) => setSelectedColor(colorName)}
      />
    </>
  );
};

export default QuickAddModal;

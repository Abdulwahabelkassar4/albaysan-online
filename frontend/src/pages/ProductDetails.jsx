import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useCart } from "../context/CartContext.jsx";
import { buildWhatsAppLink } from "../config/contact.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductSkeleton } from "../components/SkeletonLoader.jsx";
import { CloseIcon, ArrowForwardIcon, SparkleIcon, WhatsAppIcon, PaletteIcon } from "../components/icons.jsx";
import ColorGuideModal from "../components/ColorGuideModal.jsx";
import ProductConfigSelector, {
  getDefaultSelections,
  getActiveDescription,
  getConfiguredPrice,
  validateSelections,
  buildConfigSnapshot,
} from "../components/ProductConfigSelector.jsx";

const normalizeImages = (images, fallbackImage) => {
  const normalized = Array.isArray(images)
    ? images.map((image) => (typeof image === "string" ? image : image?.url)).filter(Boolean)
    : [];

  if (!normalized.length && fallbackImage) {
    normalized.push(fallbackImage);
  }

  return normalized;
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [colorGuides, setColorGuides] = useState([]);
  const [isColorGuideOpen, setIsColorGuideOpen] = useState(false);
  const [configSelections, setConfigSelections] = useState({});
  const [configErrors, setConfigErrors] = useState([]);

  const { addItem, openCart } = useCart();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const defaultSize = t("product.defaultSize");
  const defaultColor = t("product.defaultColor");

  const galleryImages = normalizeImages(product?.images, product?.image);
  const primaryImage = selectedImage || product?.images?.[0] || galleryImages[0] || product?.image || "";

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const { data } = await axiosClient.get("/api/colors");
        if (Array.isArray(data)) setColorGuides(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchColors();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await requestWithRetry(
          () => axiosClient.get(`/api/products/${id}`, { timeout: 12000 }),
          { timeoutMs: 65000 }
        );
        const normalizedImages = normalizeImages(data.images, data.image);
        setProduct({ ...data, images: normalizedImages });
        setSelectedSize(data.sizes?.[0] || defaultSize);
        setSelectedColor(data.colors?.[0] || defaultColor);
        setSelectedImage(normalizedImages[0] || data.image || "");

        // Initialize default config selections
        if (data.configurable && data.pieces?.length) {
          setConfigSelections(getDefaultSelections(data));
        } else {
          setConfigSelections({});
        }
        setConfigErrors([]);

        // Fetch related products in same category
        if (data.category) {
          setLoadingRelated(true);
          try {
            const res = await axiosClient.get(`/api/products?category=${encodeURIComponent(data.category)}&limit=4`);
            const relData = res.data?.data || [];
            setRelatedProducts(relData.filter((p) => (p.id || p._id) !== (data.id || data._id)));
          } catch (e) {
            console.error("Failed to load related products", e);
          } finally {
            setLoadingRelated(false);
          }
        }
      } catch (error) {
        console.error("Product not found", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, defaultSize, defaultColor]);

  // Dynamic price and description based on config selections
  const isConfigurable = product?.configurable && product?.pieces?.length > 0;
  const configuredPrice = isConfigurable
    ? getConfiguredPrice(product, configSelections)
    : product?.price || 0;
  const activeDescription = isConfigurable
    ? getActiveDescription(product, configSelections)
    : product?.description || "";

  const handleAddToCart = () => {
    if (!product) return;

    // Validate required config options
    if (isConfigurable) {
      const errors = validateSelections(product, configSelections);
      setConfigErrors(errors);
      if (errors.length > 0) return;
    }

    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      image: primaryImage,
      qty: 1,
    };

    // Add configuration data for configured products
    if (isConfigurable) {
      cartItem.configuredPrice = configuredPrice;
      cartItem.configSnapshot = buildConfigSnapshot(product, configSelections);
      cartItem.configuration = {
        productId: product._id || product.id,
        selections: { ...configSelections },
      };
    }

    addItem(cartItem);
    openCart();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductSkeleton />
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-3/4 bg-neutral-800 rounded-lg" />
            <div className="h-6 w-1/3 bg-neutral-800 rounded-lg" />
            <div className="h-24 w-full bg-neutral-800 rounded-lg" />
            <div className="h-12 w-full bg-neutral-800 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center text-white/70">
        <h2 className="text-2xl font-bold mb-4">{t("product.notFound")}</h2>
        <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
          العودة للمتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* Dynamic Breadcrumb Navigation */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-white/60">
        <Link to="/" className="hover:text-white transition">الرئيسية</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-white transition">المتجر</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-white transition">
              {product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-white font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid gap-10 lg:grid-cols-2 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl cursor-zoom-in"
          >
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-[450px] object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-[450px] items-center justify-center bg-neutral-800 text-white/40">
                {t("product.noImage")}
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold rounded-3xl">
              انقر للتكبير 🔍
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryImages.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  onClick={() => setSelectedImage(imageUrl)}
                  className={`relative overflow-hidden rounded-2xl border-2 transition ${
                    selectedImage === imageUrl ? "border-primary-500 scale-95 ring-2 ring-primary-500/50" : "border-white/10 hover:border-white/40"
                  }`}
                >
                  <img src={imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info */}
        <div className={`glass-card space-y-6 p-8 rounded-3xl border border-white/10 shadow-2xl bg-neutral-900/80 backdrop-blur-xl ${isRTL ? "text-right" : "text-left"}`}>
          <div className="space-y-3 border-b border-white/10 pb-6">
            <h1 className="text-3xl font-bold text-white leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-primary-400">
                {isConfigurable ? configuredPrice : product.price} {t("product.priceSuffix")}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-white/40 line-through">
                  {product.originalPrice} {t("product.priceSuffix")}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {isConfigurable ? activeDescription : (product.description || t("product.descriptionFallback"))}
            </p>
          </div>

          {/* Size Picker */}
          {product.sizes?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80">{t("product.selectSize")}</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedSize === size
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Picker with Color Reference Guide Button */}
          {product.colors?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/80">{t("product.selectColor")}</label>
                <button
                  type="button"
                  onClick={() => setIsColorGuideOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-secondary-400/40 bg-secondary-500/20 px-3 py-1 text-xs font-bold text-secondary-200 hover:bg-secondary-500/30 transition shadow-sm"
                >
                  <PaletteIcon className="h-4 w-4" />
                  🎨 مرجعية الألوان (عينات الصور)
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((colorName) => {
                  const match = colorGuides.find((g) => g.name === colorName);
                  const isSelected = selectedColor === colorName;

                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                        isSelected
                          ? "bg-secondary-600 text-white ring-2 ring-secondary-400 shadow-lg scale-105"
                          : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {match?.hexCode && (
                        <span
                          className="h-4 w-4 rounded-full border border-white/40 shadow-sm shrink-0"
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

          {/* ──── Product Configuration Selector ──── */}
          {isConfigurable && (
            <div className="space-y-2 border-t border-white/10 pt-4">
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
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 space-y-1">
                  {configErrors.map((err, i) => (
                    <p key={i} className="text-xs text-rose-300 font-semibold">⚠ {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add to Cart & WhatsApp */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <button
              onClick={handleAddToCart}
              className="w-full rounded-full bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-500 py-3.5 text-base font-bold text-white shadow-xl shadow-primary-900/40 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("product.addToCart")} 🛍️
            </button>
            
            <a
              href={buildWhatsAppLink({
                message: `مرحباً، أود الاستفسار عن منتج: ${product.name}`,
              })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-950/40 py-3 text-sm font-semibold text-emerald-400 hover:bg-emerald-900/50 transition"
              target="_blank"
              rel="noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5 fill-current" />
              {t("product.contactWhatsapp")}
            </a>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-white/10 pt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white mb-8">
            <SparkleIcon className="h-6 w-6 text-primary-400" />
            منتجات قد تعجبك
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct._id || relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Image Zoom Lightbox Modal */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 end-6 text-white hover:text-primary-400 p-2 rounded-full bg-neutral-800"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
          <img
            src={primaryImage}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* Color Reference Guide Modal */}
      <ColorGuideModal
        isOpen={isColorGuideOpen}
        onClose={() => setIsColorGuideOpen(false)}
        colorGuides={colorGuides}
        selectedColor={selectedColor}
        onSelectColor={(colorName) => setSelectedColor(colorName)}
      />
    </div>
  );
};

export default ProductDetails;

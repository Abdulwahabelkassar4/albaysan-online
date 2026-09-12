import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useCart } from "../context/CartContext.jsx";
import { buildWhatsAppLink } from "../config/contact.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";
import ProductCard from "../components/ProductCard.jsx";
import { ProductSkeleton } from "../components/SkeletonLoader.jsx";
import { CloseIcon, ArrowForwardIcon, SparkleIcon, WhatsAppIcon } from "../components/icons.jsx";

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

  const { addItem, openCart } = useCart();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const defaultSize = t("product.defaultSize");
  const defaultColor = t("product.defaultColor");

  const galleryImages = normalizeImages(product?.images, product?.image);
  const primaryImage = selectedImage || product?.images?.[0] || galleryImages[0] || product?.image || "";

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

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: selectedColor,
      image: primaryImage,
      qty: 1,
    });
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
                {product.price} {t("product.priceSuffix")}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-white/40 line-through">
                  {product.originalPrice} {t("product.priceSuffix")}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {product.description || t("product.descriptionFallback")}
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

          {/* Color Picker */}
          {product.colors?.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/80">{t("product.selectColor")}</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                      selectedColor === color
                        ? "bg-secondary-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
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
    </div>
  );
};

export default ProductDetails;

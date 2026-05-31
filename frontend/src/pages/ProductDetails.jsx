import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useCart } from "../context/CartContext.jsx";
import { buildWhatsAppLink } from "../config/contact.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";

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
  const { addItem, openCart } = useCart();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const defaultSize = t("product.defaultSize");
  const defaultColor = t("product.defaultColor");
  const galleryImages = normalizeImages(product?.images, product?.image);
  const primaryImage = selectedImage || product?.images?.[0] || galleryImages[0] || product?.image || "";

  useEffect(() => {
    const fetchProduct = async () => {
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
      } catch (error) {
        console.error("Product not found", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, defaultSize, defaultColor]);

  useEffect(() => {
    if (!product) return;
    if (!product.sizes?.length) {
      setSelectedSize(defaultSize);
    }
    if (!product.colors?.length) {
      setSelectedColor(defaultColor);
    }
  }, [product, defaultSize, defaultColor]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product._id,
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
    return <div className="mx-auto max-w-6xl px-6 py-16">{t("product.loading")}</div>;
  }

  if (!product) {
    return <div className="mx-auto max-w-6xl px-6 py-16">{t("product.notFound")}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="glass-card overflow-hidden rounded-xl">
            {primaryImage ? (
              <img src={primaryImage} alt={product.name} className="w-full h-96 object-cover rounded-xl" />
            ) : (
              <div className="flex h-96 items-center justify-center bg-white/5 text-white/40">
                {t("product.noImage")}
              </div>
            )}
          </div>
          {galleryImages.length > 0 && (
            <div className="flex space-x-3 mt-4">
              {galleryImages.map((imageUrl, index) => (
                <img
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  onClick={() => setSelectedImage(imageUrl)}
                  alt={product.name}
                  className={`w-20 h-20 object-cover rounded-md border hover:border-black cursor-pointer ${
                    selectedImage === imageUrl ? "border-white" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        <div
          className={`glass-card space-y-6 p-8 ${isRTL ? "text-right" : "text-left"}`}
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{product.name}</h1>
            <p className="text-2xl font-black text-secondary-200">
              {product.price} {t("product.priceSuffix")}
            </p>
            <p className="text-sm text-white/70">
              {product.description || t("product.descriptionFallback")}
            </p>
          </div>

          {product.sizes?.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-white/70">{t("product.selectSize")}</label>
              <select
                value={selectedSize}
                onChange={(event) => setSelectedSize(event.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {product.sizes.map((size) => (
                  <option key={size} value={size} className="text-neutral-900">
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-white/70">{t("product.selectColor")}</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition hover:scale-105 ${
                      selectedColor === color
                        ? "bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 text-white"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm text-white/70">
            {product.category && (
              <p>
                {t("product.categoryLabel")}: <span className="text-white">{product.category}</span>
              </p>
            )}
            {product.productCollection && (
              <p>
                {t("product.collectionLabel")}:{" "}
                <span className="text-white">{product.productCollection}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-900/30 transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-secondary-200"
          >
            {t("product.addToCart")}
          </button>
          <a
            href={buildWhatsAppLink({
              message: t("whatsapp.prefill", {
                defaultValue: "Hello, I would like to shop from Albaysan Online",
              }),
            })}
            className="btn-primary w-full"
            target="_blank"
            rel="noreferrer"
          >
            {t("product.contactWhatsapp")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;


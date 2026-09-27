import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CartIcon, SparkleIcon } from "./icons.jsx";
import QuickAddModal from "./QuickAddModal.jsx";
import { bounceFlower } from "../utils/animeEffects.js";

const getCoverImage = (product) => {
  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    return typeof firstImage === "string" ? firstImage : firstImage?.url;
  }
  return product?.image || "";
};

const ProductCard = ({ product }) => {
  const cover = getCoverImage(product);
  const { t, i18n } = useTranslation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const isRTL = i18n.language === "ar";
  const productId = product._id || product.id;

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  // 3D subtle tilt effect for a high-end luxury feel
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  const handleQuickAddClick = (e) => {
    e.preventDefault();
    if (buttonRef.current) {
      bounceFlower(buttonRef.current);
    }
    setIsQuickAddOpen(true);
  };

  return (
    <>
      <article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-rose-300/20 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-rose-500/[0.05] backdrop-blur-xl shadow-lg shadow-neutral-950/40 transition-[box-shadow,border-color] duration-300 hover:border-rose-400/50 hover:shadow-2xl hover:shadow-rose-950/50 will-change-transform"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.2s ease-out, border-color 0.3s, box-shadow 0.3s" }}
      >
        {/* Subtle Specular Sheen on Hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-rose-500/0 via-rose-300/0 to-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
          {cover ? (
            <img
              src={cover}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-rose-500/10 text-rose-200/50 font-bold">
              {product.name?.slice(0, 2)}
            </div>
          )}

          {/* Featured / Floral Sparkle Badge */}
          <div className="absolute top-3.5 left-3.5 rounded-full bg-neutral-950/60 backdrop-blur-md px-3 py-1 text-[11px] text-rose-100 font-medium border border-rose-300/20 shadow-md">
            <span className="inline-flex items-center gap-1.5">
              <SparkleIcon className="h-3 w-3 text-pink-300 animate-pulse" />
              {t("productCard.featured")}
            </span>
          </div>

          {/* Discount & Special Tags */}
          {(discountPercentage || product.discountTag) && (
            <div className="absolute top-3.5 right-3.5 flex flex-col gap-1.5 items-end">
              {discountPercentage && (
                <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-0.5 text-[11px] font-black text-white shadow-lg shadow-rose-900/60 animate-pulse-petal">
                  خصم {discountPercentage}%
                </span>
              )}
              {product.discountTag && (
                <span className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-2.5 py-0.5 text-[11px] font-bold text-neutral-950 shadow-md">
                  ✨ {product.discountTag}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className={`flex flex-1 flex-col justify-between space-y-3 p-5 text-white ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          <div>
            <span className="text-[11px] font-semibold text-rose-300/80 tracking-wide uppercase">
              {product.category}
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-rose-200 transition-colors line-clamp-1 mt-0.5">
              {product.name}
            </h3>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-rose-300">
                  {product.price} {t("product.priceSuffix")}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-white/40 line-through font-medium">
                    {product.originalPrice} {t("product.priceSuffix")}
                  </span>
                )}
              </div>

              <Link
                to={`/product/${productId}`}
                className="rounded-full border border-rose-300/30 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 hover:border-rose-300/60 active:scale-95"
              >
                {t("productCard.details")}
              </Link>
            </div>

            <button
              ref={buttonRef}
              onClick={handleQuickAddClick}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary-500 via-rose-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-950/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-rose-500/30 active:scale-95"
            >
              <CartIcon className="h-4 w-4" />
              <span>{t("productCard.quickAdd")}</span>
            </button>
          </div>
        </div>
      </article>

      {/* Interactive Options Modal */}
      <QuickAddModal
        product={product}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </>
  );
};

export default ProductCard;

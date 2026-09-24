import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CartIcon, SparkleIcon } from "./icons.jsx";
import QuickAddModal from "./QuickAddModal.jsx";

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
  const isRTL = i18n.language === "ar";
  const productId = product._id || product.id;

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <>
      <article className="group glass-card relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-950/60 hover:border-primary-500/40 animate-fade-in-up">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
          {cover ? (
            <img
              src={cover}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary-500/10 text-white/50 font-bold">
              {product.name?.slice(0, 2)}
            </div>
          )}

          {/* Featured Badge */}
          <div className="absolute top-3 left-3 rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] text-white font-medium border border-white/10 shadow-lg">
            <span className="inline-flex items-center gap-1">
              <SparkleIcon className="h-3.5 w-3.5 text-primary-400 animate-pulse" />
              {t("productCard.featured")}
            </span>
          </div>

          {/* Discount Tag */}
          {(discountPercentage || product.discountTag) && (
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
              {discountPercentage && (
                <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-lg animate-pulse-glow">
                  خصم {discountPercentage}%
                </span>
              )}
              {product.discountTag && (
                <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-neutral-950 shadow-md">
                  {product.discountTag}
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
            <h3 className="text-base font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-white/60 mt-0.5">{product.category}</p>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-primary-400">
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
                className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-white/90 transition hover:bg-white/20 hover:border-white/40"
              >
                {t("productCard.details")}
              </Link>
            </div>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-secondary-500 to-pink-500 py-2.5 text-xs font-bold text-white shadow-md shadow-primary-950/40 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <CartIcon className="h-4 w-4" />
              {t("productCard.quickAdd")}
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

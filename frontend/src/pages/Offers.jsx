import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { FireIcon, ShoppingBagIcon, SparkleIcon } from "../components/icons.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";
import QuickAddModal from "../components/QuickAddModal.jsx";
import FloralCanvas3D from "../components/FloralCanvas3D.jsx";
import { bloomStagger, bounceFlower } from "../utils/animeEffects.js";

const Offers = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const isRTL = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerSetting, setOfferSetting] = useState(null);
  const [selectedProductForQuickAdd, setSelectedProductForQuickAdd] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: productsRes }, { data: settingsRes }] = await Promise.all([
          axiosClient.get("/api/products", { params: { offersOnly: true, limit: 50 } }),
          axiosClient.get("/api/offer-settings").catch(() => ({ data: null })),
        ]);

        const items = (productsRes.data || []).filter(
          (p) => p.isInActiveOffer || (p.originalPrice && p.originalPrice > p.price) || p.discountTag
        );
        setProducts(items);
        if (settingsRes) {
          setOfferSetting(settingsRes);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && gridRef.current) {
      const cards = gridRef.current.querySelectorAll(".offer-card-item");
      bloomStagger(cards, { delay: 80 });
    }
  }, [loading, products]);

  const handleQuickAdd = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProductForQuickAdd(product);
  };

  return (
    <section className="relative min-h-screen py-12 md:py-16 overflow-hidden">
      {/* 3D WebGL Petals Canvas */}
      <FloralCanvas3D density={35} className="opacity-75" />

      {/* Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-pink-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-20 right-10 -z-10 h-72 w-72 rounded-full bg-rose-400/10 blur-[80px]" />

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        {/* Dynamic Countdown Banner */}
        {offerSetting && offerSetting.isEnabled && (
          <OfferCountdown
            targetDate={offerSetting.endDate}
            title={offerSetting.title || t("offersPage.title")}
            subtitle={offerSetting.subtitle || t("offersPage.subtitle")}
            badgeText={offerSetting.badgeText}
            promoCode={offerSetting.promoCode}
            isEnabled={offerSetting.isEnabled}
          />
        )}

        {/* Offers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-80 animate-pulse bg-white/5 rounded-3xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-rose-300/20">
            <span className="text-4xl">🌸</span>
            <p className="mt-3 text-lg font-medium text-white/80">{t("offersPage.empty")}</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-secondary-500 via-rose-500 to-primary-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/50 transition hover:scale-105"
            >
              استكشفي جميع المنتجات 🛍️
            </Link>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const coverImage = product.images?.[0] || "/assets/placeholder.png";
              const discountPercentage = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="offer-card-item group relative flex flex-col overflow-hidden rounded-3xl border border-rose-300/20 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-rose-500/[0.06] backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-rose-400/50 hover:shadow-2xl hover:shadow-rose-950/50"
                >
                  {/* Image Container */}
                  <div className="relative h-72 w-full overflow-hidden bg-neutral-950">
                    <img
                      src={coverImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-75" />

                    {/* Discount & Special Badges */}
                    <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} flex flex-col gap-1.5`}>
                      {discountPercentage && (
                        <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-black text-white shadow-lg shadow-rose-950/50 animate-pulse-petal">
                          خصم {discountPercentage}%
                        </span>
                      )}
                      {product.discountTag && (
                        <span className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-3 py-1 text-xs font-bold text-neutral-950 shadow-md">
                          ✨ {product.discountTag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className={`flex flex-1 flex-col justify-between p-5 ${isRTL ? "text-right" : "text-left"}`}>
                    <div>
                      <span className="text-xs font-semibold text-rose-300/80 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="mt-1 text-lg font-bold text-white transition-colors group-hover:text-rose-200">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/60 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Quick Add Button */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-rose-300">
                            {product.price} {t("product.priceSuffix")}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs font-medium text-white/40 line-through">
                              {product.originalPrice} {t("product.priceSuffix")}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="rounded-full border border-rose-300/30 bg-rose-500/10 p-2.5 text-rose-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-rose-500 hover:to-pink-500 hover:text-white hover:scale-105 active:scale-95 shadow-md"
                        title={t("cart.addToCart")}
                      >
                        <ShoppingBagIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add Modal for Offers */}
      <QuickAddModal
        product={selectedProductForQuickAdd}
        isOpen={Boolean(selectedProductForQuickAdd)}
        onClose={() => setSelectedProductForQuickAdd(null)}
      />
    </section>
  );
};

export default Offers;

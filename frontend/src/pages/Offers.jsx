import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { FireIcon, ShoppingBagIcon } from "../components/icons.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";

const Offers = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const isRTL = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerSetting, setOfferSetting] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: productsRes }, { data: settingsRes }] = await Promise.all([
          axiosClient.get("/api/products", { params: { limit: 50 } }),
          axiosClient.get("/api/offer-settings").catch(() => ({ data: null })),
        ]);

        const items = (productsRes.data || []).filter(
          (p) => (p.originalPrice && p.originalPrice > p.price) || p.discountTag
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

  const handleQuickAdd = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, { qty: 1 });
    showToast(t("productCard.quickAddSuccess") || "تمت إضافة المنتج إلى السلة 🛍️", "success");
  };

  return (
    <section className="relative min-h-screen py-12">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-pink-600/30 to-purple-600/30 blur-3xl" />

      <div className="mx-auto max-w-6xl px-6">
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
              <div key={i} className="glass-card h-80 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-lg text-white/70">{t("offersPage.empty")}</p>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
            >
              استكشفي جميع المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const coverImage = product.images?.[0] || "/assets/placeholder.png";
              const discountPercentage = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="glass-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/20"
                >
                  {/* Image Container */}
                  <div className="relative h-72 w-full overflow-hidden bg-purple-950/40">
                    <img
                      src={coverImage}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent opacity-80" />

                    {/* Discount Badge */}
                    <div className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} flex flex-col gap-1.5`}>
                      {discountPercentage && (
                        <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-xs font-black text-white shadow-lg shadow-rose-900/50">
                          خصم {discountPercentage}%
                        </span>
                      )}
                      {product.discountTag && (
                        <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-black text-purple-950 shadow-lg">
                          {product.discountTag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className={`flex flex-1 flex-col justify-between p-5 ${isRTL ? "text-right" : "text-left"}`}>
                    <div>
                      <span className="text-xs font-medium text-pink-300">{product.category}</span>
                      <h3 className="mt-1 text-lg font-bold text-white transition-colors group-hover:text-pink-300">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-white/60">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Cart Button */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">
                            {product.price} {t("product.priceSuffix")}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm font-medium text-white/40 line-through">
                              {product.originalPrice} {t("product.priceSuffix")}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        className="rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-pink-500 hover:text-white"
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
    </section>
  );
};

export default Offers;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TestimonialsSection from "../components/TestimonialsSection.jsx";
import { CalendarIcon, ShieldIcon, TruckIcon, WhatsAppIcon, FireIcon } from "../components/icons.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";

const Home = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [latestProducts, setLatestProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const featureCards = t("home.features", { returnObjects: true });
  const milestones = t("home.milestones", { returnObjects: true });
  const trustItems = [
    { key: "delivery", icon: TruckIcon },
    { key: "womenOnly", icon: ShieldIcon },
    { key: "reservation", icon: CalendarIcon },
    { key: "support", icon: WhatsAppIcon },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [{ data: latestRes }, { data: offersRes }] = await Promise.all([
          requestWithRetry(
            () => axiosClient.get("/api/products?limit=4", { timeout: 12000 }),
            { timeoutMs: 65000 }
          ),
          requestWithRetry(
            () => axiosClient.get("/api/products?offersOnly=true&limit=4", { timeout: 12000 }),
            { timeoutMs: 65000 }
          ).catch(() => ({ data: { data: [] } })),
        ]);

        const allItems = latestRes?.data || [];
        setLatestProducts(allItems);

        const offerItems = offersRes?.data || [];
        setOfferProducts(offerItems);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div className="grid gap-3 md:grid-cols-4">
          {trustItems.map(({ key, icon: Icon }, index) => (
            <div
              key={key}
              className="animate-reveal rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-300/40 hover:bg-white/[0.08]"
              style={{ animationDelay: `${0.05 + index * 0.08}s` }}
            >
              <div className={`flex items-center gap-3 ${isRTL ? "text-right" : "text-left"}`}>
                <span className="rounded-full bg-secondary-500/20 p-2 text-secondary-200">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-semibold text-white/90">{t(`home.trust.${key}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Offers Showcase Section */}
      {offerProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-pink-950/80 p-8 backdrop-blur-md">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300 border border-pink-500/30">
                  <FireIcon className="h-4 w-4 text-amber-400 animate-bounce" />
                  <span>عروض لفترة محدودة</span>
                </div>
                <h2 className="mt-2 text-3xl font-extrabold text-white">
                  {t("home.offersSectionTitle")}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  {t("home.offersSubtitle")}
                </p>
              </div>
              <Link
                to="/offers"
                className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-900/40 transition hover:scale-105"
              >
                {t("home.viewAllOffers")} 🔥
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {offerProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card animate-reveal grid gap-8 p-10 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-reveal rounded-3xl border border-white/5 bg-white/5 p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
              style={{ animationDelay: `${0.12 + index * 0.1}s` }}
            >
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-900/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div
            className={`flex flex-col items-center justify-between gap-4 text-center md:flex-row ${
              isRTL ? "md:text-right" : "md:text-left"
            }`}
          >
            <h2 className="text-3xl font-bold text-white">{t("home.latestTitle")}</h2>
            <p className="text-sm text-white/70">{t("deliveryNote")}</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="glass-card h-80 animate-pulse bg-white/5" />
                ))
              : latestProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            {!loading && latestProducts.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white/60">
                <p>{t("home.latestEmpty")}</p>
                <Link to="/shop" className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
                  {t("shop.title")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Verified Testimonials Showcase */}
      <TestimonialsSection />

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card animate-reveal grid gap-8 p-10 md:grid-cols-3">
          {milestones.map((milestone, index) => {
            const accentClass =
              index === 0 ? "text-primary-200" : index === 1 ? "text-secondary-200" : "text-white";
            return (
              <div key={milestone.value} className="animate-reveal text-center" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                <p className={`text-4xl font-black ${accentClass}`}>{milestone.value}</p>
                <p className="mt-2 text-sm text-white/70">{milestone.label}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Home;

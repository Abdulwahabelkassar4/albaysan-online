import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TestimonialsSection from "../components/TestimonialsSection.jsx";
import { CalendarIcon, ShieldIcon, TruckIcon, WhatsAppIcon, FireIcon, SparkleIcon } from "../components/icons.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";
import { bloomStagger } from "../utils/animeEffects.js";

const Home = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [latestProducts, setLatestProducts] = useState([]);
  const [offerProducts, setOfferProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const trustGridRef = useRef(null);
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

  useEffect(() => {
    if (trustGridRef.current) {
      const items = trustGridRef.current.querySelectorAll(".trust-item");
      bloomStagger(items, { delay: 60 });
    }
  }, []);

  return (
    <>
      <Hero />

      {/* Trust Badges */}
      <section className="mx-auto max-w-6xl px-6 pt-10">
        <div ref={trustGridRef} className="grid gap-4 md:grid-cols-4">
          {trustItems.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="trust-item rounded-2xl border border-rose-300/20 bg-gradient-to-br from-white/[0.06] to-rose-500/[0.04] p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-rose-300/40 hover:bg-rose-500/10 hover:shadow-lg hover:shadow-rose-950/30"
            >
              <div className={`flex items-center gap-3.5 ${isRTL ? "text-right" : "text-left"}`}>
                <span className="rounded-full bg-rose-500/20 p-2.5 text-rose-300 border border-rose-300/20">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-semibold text-rose-100/90">{t(`home.trust.${key}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Offers Showcase Section */}
      {offerProducts.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-16">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-rose-300/30 bg-gradient-to-r from-purple-950/80 via-neutral-900/90 to-rose-950/80 p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-rose-950/30">
            {/* Background Ambient Blossom */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />

            <div className="flex flex-col items-center justify-between gap-6 md:flex-row relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-3.5 py-1 text-xs font-bold text-rose-200 shadow-inner">
                  <FireIcon className="h-4 w-4 text-amber-300 animate-bounce" />
                  <span>عروض لفترة محدودة 🌸</span>
                </div>
                <h2 className="mt-3 text-3xl md:text-4xl font-black text-white">
                  <span className="bg-gradient-to-r from-white via-rose-100 to-pink-300 bg-clip-text text-transparent">
                    {t("home.offersSectionTitle")}
                  </span>
                </h2>
                <p className="mt-1.5 text-sm text-rose-100/70">
                  {t("home.offersSubtitle")}
                </p>
              </div>
              <Link
                to="/offers"
                className="rounded-full bg-gradient-to-r from-secondary-500 via-rose-500 to-pink-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-950/50 transition-all duration-300 hover:scale-105 hover:shadow-rose-500/40 active:scale-95"
              >
                {t("home.viewAllOffers")} 🔥
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
              {offerProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Feature Highlights */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="glass-card group rounded-3xl border border-rose-300/20 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-rose-400/40 hover:shadow-xl hover:shadow-rose-950/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <h3 className="text-xl font-bold text-white group-hover:text-rose-200 transition-colors">
                  {feature.title}
                </h3>
              </div>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="bg-neutral-900/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div
            className={`flex flex-col items-center justify-between gap-4 text-center md:flex-row ${
              isRTL ? "md:text-right" : "md:text-left"
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300/90 mb-1">
                <SparkleIcon className="h-3.5 w-3.5 text-pink-300" />
                <span>تشكيلات جديدة ومميزة</span>
              </div>
              <h2 className="text-3xl font-black text-white">{t("home.latestTitle")}</h2>
            </div>
            <p className="text-sm text-rose-100/70">{t("deliveryNote")}</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="glass-card h-80 animate-pulse bg-white/5 rounded-3xl" />
                ))
              : latestProducts.map((product) => <ProductCard key={product._id} product={product} />)}
            {!loading && latestProducts.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed border-rose-300/20 bg-white/[0.03] p-10 text-center text-white/60">
                <p>{t("home.latestEmpty")}</p>
                <Link to="/shop" className="mt-4 inline-flex rounded-full bg-rose-500/20 border border-rose-300/30 px-5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/30">
                  {t("shop.title")} 🌸
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Verified Testimonials Showcase */}
      <TestimonialsSection />

      {/* Milestones */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card grid gap-8 p-10 md:grid-cols-3 rounded-3xl border border-rose-300/20">
          {milestones.map((milestone, index) => {
            const accentClass =
              index === 0 ? "text-rose-300" : index === 1 ? "text-pink-300" : "text-purple-300";
            return (
              <div key={milestone.value} className="text-center">
                <p className={`text-4xl font-black ${accentClass}`}>{milestone.value}</p>
                <p className="mt-2 text-sm text-white/75">{milestone.label}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Home;

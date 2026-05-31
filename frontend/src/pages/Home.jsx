import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { CalendarIcon, ShieldIcon, TruckIcon, WhatsAppIcon } from "../components/icons.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";

const Home = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [latestProducts, setLatestProducts] = useState([]);
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
        const { data } = await requestWithRetry(
          () => axiosClient.get("/api/products?limit=4", { timeout: 12000 }),
          { timeoutMs: 65000 }
        );
        setLatestProducts(data.data || []);
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
          {trustItems.map(({ key, icon: Icon }) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
                <span className="rounded-full bg-secondary-500/20 p-2 text-secondary-200">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-semibold text-white/90">{t(`home.trust.${key}`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card grid gap-8 p-10 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-white/5 bg-white/5 p-6">
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
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-card grid gap-8 p-10 md:grid-cols-3">
          {milestones.map((milestone, index) => {
            const accentClass =
              index === 0 ? "text-primary-200" : index === 1 ? "text-secondary-200" : "text-white";
            return (
              <div key={milestone.value} className="text-center">
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


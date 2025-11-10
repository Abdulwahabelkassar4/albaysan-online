import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import Hero from "../components/Hero.jsx";
import ProductCard from "../components/ProductCard.jsx";

const Home = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const featureCards = t("home.features", { returnObjects: true });
  const milestones = t("home.milestones", { returnObjects: true });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosClient.get("/api/products?limit=4");
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
              <div className="col-span-full text-center text-white/60">
                {t("home.latestEmpty")}
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


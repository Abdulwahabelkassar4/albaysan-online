import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";

const collectionOptions = [
  { value: "الكوليكشن الصيفي", key: "summer" },
  { value: "الكوليكشن الخريفي", key: "autumn" },
  { value: "الكوليكشن الشتوي", key: "winter" },
  { value: "الكوليكشن الربيعي", key: "spring" },
];

const Collections = () => {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          collectionOptions.map(async (collection) => {
            const { data } = await requestWithRetry(
              () =>
                axiosClient.get("/api/products", {
                  timeout: 12000,
                  params: { productCollection: collection.value, limit: 12 },
                }),
              { timeoutMs: 65000 }
            );
            return [collection.value, data.data || []];
          })
        );
        setCollections(Object.fromEntries(responses));
      } catch (error) {
        console.error("Unable to load collections", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="glass-card p-6">
        <h1 className="text-3xl font-bold text-white">{t("collectionsPage.title")}</h1>
        <p className="mt-2 text-sm text-white/70">{t("collectionsPage.intro")}</p>
      </section>

      {collectionOptions.map((collection) => {
        const items = collections[collection.value] || [];
        const isLoading = loading && !collections[collection.value];

        return (
          <section key={collection.value} className="mt-12">
            <div
              className={`flex items-center justify-between text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <h2 className="text-2xl font-semibold">{t(`shop.collections.${collection.key}`)}</h2>
            </div>

            {isLoading ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="glass-card h-80 animate-pulse bg-white/5" />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.length > 0 ? (
                  items.map((product) => <ProductCard key={product._id} product={product} />)
                ) : (
                  <div className="glass-card col-span-full p-10 text-center text-white/60">
                    {t("collectionsPage.empty")}
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default Collections;

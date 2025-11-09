import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";

const collectionsList = [
  "الكوليكشن الصيفي",
  "الكوليكشن الخريفي",
  "الكوليكشن الشتوي",
  "الكوليكشن الربيعي",
];

const Collections = () => {
  const [collections, setCollections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          collectionsList.map(async (collectionName) => {
            const { data } = await axiosClient.get("/api/products", {
              params: { collection: collectionName, limit: 12 },
            });
            return [collectionName, data.data || []];
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
        <h1 className="text-3xl font-bold text-white">المجموعات</h1>
        <p className="mt-2 text-sm text-white/70">
          تصفحي مجموعاتنا الموسمية لتجدي الإطلالة المناسبة لكل فصل.
        </p>
      </section>

      {collectionsList.map((collectionName) => {
        const items = collections[collectionName] || [];
        const isLoading = loading && !collections[collectionName];

        if (isLoading) {
          return (
            <section key={collectionName} className="mt-12">
              <div className="flex items-center justify-between text-white">
                <h2 className="text-2xl font-semibold">{collectionName}</h2>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="glass-card h-80 animate-pulse bg-white/5" />
                ))}
              </div>
            </section>
          );
        }

        if (!loading && items.length === 0) {
          return null;
        }

        return (
          <section key={collectionName} className="mt-12">
            <div className="flex items-center justify-between text-white">
              <h2 className="text-2xl font-semibold">{collectionName}</h2>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.length > 0 ? (
                items.map((product) => <ProductCard key={product._id} product={product} />)
              ) : (
                <div className="glass-card col-span-full p-10 text-center text-white/60">
                  لا توجد منتجات في هذه المجموعة حالياً.
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Collections;

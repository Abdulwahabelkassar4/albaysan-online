import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";

const categories = ["عباءات", "ادناءات", "سبورات شرعية", "نقابات", "حقائب"];
const collections = ["الكوليكشن الصيفي", "الكوليكشن الخريفي", "الكوليكشن الشتوي", "الكوليكشن الربيعي"];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const filters = useMemo(
    () => ({
      category: searchParams.get("category") || "",
      collection: searchParams.get("collection") || "",
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page") || 1),
    }),
    [searchParams]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get("/api/products", {
          params: {
            category: filters.category || undefined,
            collection: filters.collection || undefined,
            search: filters.search || undefined,
            page: filters.page,
            limit: 12,
          },
        });
        setProducts(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (error) {
        console.error("Unable to load products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.delete("page");
    setSearchParams(nextParams);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="glass-card p-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold text-white">المتجر</h1>
            <p className="mt-2 text-sm text-white/70">
              اختاري من تصاميم البيلسان المميزة، مع خيار الحجز والاستلام خلال يومين.
            </p>
          </div>
          <input
            type="search"
            placeholder="ابحثي عن تصميم..."
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300 md:w-72"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => updateFilter("category", "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filters.category ? "bg-white/10 text-white/70" : "bg-primary-500 text-white"
            }`}
          >
            جميع الفئات
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => updateFilter("category", category)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filters.category === category ? "bg-primary-500 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => updateFilter("collection", "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filters.collection ? "bg-white/10 text-white/70" : "bg-secondary-500 text-white"
            }`}
          >
            جميع المجموعات
          </button>
          {collections.map((collection) => (
            <button
              key={collection}
              onClick={() => updateFilter("collection", collection)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filters.collection === collection
                  ? "bg-secondary-500 text-white"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {collection}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="glass-card h-96 animate-pulse bg-white/5" />
            ))
          : products.map((product) => <ProductCard key={product._id} product={product} />)}
        {!loading && products.length === 0 && (
          <div className="col-span-full glass-card p-10 text-center text-white/60">
            لا توجد منتجات مطابقة للبحث حالياً.
          </div>
        )}
      </section>

      <div className="mt-10 flex justify-center gap-3">
        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNumber = index + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => updateFilter("page", String(pageNumber))}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                pageNumber === filters.page ? "bg-primary-500 text-white" : "bg-white/10 text-white/60"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;


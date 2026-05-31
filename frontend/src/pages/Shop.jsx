import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import { CloseIcon, SparkleIcon } from "../components/icons.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";

const categoryOptions = [
  { value: "عباءات", key: "abayas" },
  { value: "ادناءات", key: "idnaas" },
  { value: "سبورات شرعية", key: "sports" },
  { value: "نقابات", key: "niqabs" },
  { value: "حقائب", key: "bags" },
];

const collectionOptions = [
  { value: "الكوليكشن الصيفي", key: "summer" },
  { value: "الكوليكشن الخريفي", key: "autumn" },
  { value: "الكوليكشن الشتوي", key: "winter" },
  { value: "الكوليكشن الربيعي", key: "spring" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const filters = useMemo(
    () => ({
      category: searchParams.get("category") || "",
      productCollection: searchParams.get("productCollection") || "",
      search: searchParams.get("search") || "",
      page: Number(searchParams.get("page") || 1),
    }),
    [searchParams]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await requestWithRetry(
          () =>
            axiosClient.get("/api/products", {
              timeout: 12000,
              params: {
                category: filters.category || undefined,
                productCollection: filters.productCollection || undefined,
                search: filters.search || undefined,
                page: filters.page,
                limit: 12,
              },
            }),
          { timeoutMs: 65000 }
        );
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

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="glass-card p-6">
        <div
          className={`flex flex-col justify-between gap-6 md:flex-row md:items-end ${
            isRTL ? "md:text-right" : "md:text-left"
          }`}
        >
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              <SparkleIcon className="h-6 w-6 text-secondary-200" />
              {t("shop.title")}
            </h1>
            <p className="mt-2 text-sm text-white/70">{t("shop.intro")}</p>
          </div>
          <input
            type="search"
            placeholder={t("shop.searchPlaceholder")}
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            className={`w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-300 md:w-72 ${
              isRTL ? "text-right" : "text-left"
            }`}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => updateFilter("category", "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filters.category ? "bg-white/10 text-white/70" : "bg-primary-500 text-white"
            }`}
          >
            {t("shop.allCategories")}
          </button>
          {categoryOptions.map((category) => (
            <button
              key={category.value}
              onClick={() => updateFilter("category", category.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filters.category === category.value
                  ? "bg-primary-500 text-white"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {t(`shop.categories.${category.key}`)}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => updateFilter("productCollection", "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filters.productCollection ? "bg-white/10 text-white/70" : "bg-secondary-500 text-white"
            }`}
          >
            {t("shop.allCollections")}
          </button>
          {collectionOptions.map((collection) => (
            <button
              key={collection.value}
              onClick={() => updateFilter("productCollection", collection.value)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filters.productCollection === collection.value
                  ? "bg-secondary-500 text-white"
                  : "bg-white/10 text-white/70"
              }`}
            >
              {t(`shop.collections.${collection.key}`)}
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
            <p>{t("shop.empty")}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                <CloseIcon className="h-4 w-4" />
                {t("shop.resetFilters", { defaultValue: "Reset filters" })}
              </button>
              <Link
                to="/collections"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                {t("nav.collections")}
              </Link>
            </div>
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

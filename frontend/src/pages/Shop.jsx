import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import { CloseIcon, FilterIcon, SearchIcon, SparkleIcon } from "../components/icons.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";
import { ProductSkeleton } from "../components/SkeletonLoader.jsx";

const fallbackCategories = [
  "عباءات",
  "ادناءات",
  "سبورات شرعية",
  "نقابات",
  "حقائب",
];

const fallbackCollections = [
  "الكوليكشن الصيفي",
  "الكوليكشن الخريفي",
  "الكوليكشن الشتوي",
  "الكوليكشن الربيعي",
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [categories, setCategories] = useState(fallbackCategories);
  const [collections, setCollections] = useState(fallbackCollections);
  const [sortOption, setSortOption] = useState("newest"); // "newest", "price_asc", "price_desc"
  const [maxPriceFilter, setMaxPriceFilter] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axiosClient.get("/api/categories");
        if (Array.isArray(data) && data.length > 0) {
          const catNames = data.filter((c) => c.type === "category").map((c) => c.name);
          const colNames = data.filter((c) => c.type === "collection").map((c) => c.name);
          if (catNames.length) setCategories(catNames);
          if (colNames.length) setCollections(colNames);
        }
      } catch (error) {
        console.error("Unable to load dynamic categories", error);
      }
    };
    fetchCategories();
  }, []);

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
    setMaxPriceFilter("");
    setSortOption("newest");
  };

  // Client-side filtering & sorting over fetched dataset
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (maxPriceFilter) {
      const maxP = Number(maxPriceFilter);
      if (!isNaN(maxP) && maxP > 0) {
        result = result.filter((p) => p.price <= maxP);
      }
    }

    if (sortOption === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, maxPriceFilter, sortOption]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <section className="glass-card p-6 rounded-3xl border border-white/10 shadow-xl bg-neutral-900/80 backdrop-blur-xl">
        <div
          className={`flex flex-col justify-between gap-6 md:flex-row md:items-end ${
            isRTL ? "md:text-right" : "md:text-left"
          }`}
        >
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
              <SparkleIcon className="h-7 w-7 text-primary-400 animate-pulse" />
              {t("shop.title")}
            </h1>
            <p className="mt-2 text-sm text-white/70">{t("shop.intro")}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <SearchIcon className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/45 ${isRTL ? "right-4" : "left-4"}`} />
              <input
                type="search"
                placeholder={t("shop.searchPlaceholder")}
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                className={`w-full rounded-full border border-white/20 bg-neutral-800/80 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isRTL ? "pr-11 pl-5 text-right" : "pl-11 pr-5 text-left"
                }`}
              />
            </div>

            {/* Sort Selector */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-full border border-white/20 bg-neutral-800/80 px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="newest">الأحدث وصولاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* Categories filter */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80">
            <FilterIcon className="h-4 w-4 text-primary-400" />
            <span>{t("shop.categoryFilterLabel")}</span>
          </div>
          
          {/* Price Range Filter Input */}
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span>الحد الأقصى للسعر:</span>
            <input
              type="number"
              placeholder="مثال: 50"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
              className="w-24 rounded-full border border-white/15 bg-neutral-800 px-3 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <span>د.أ</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter("category", "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filters.category ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-primary-600 text-white shadow-md shadow-primary-600/30"
            }`}
          >
            {t("shop.allCategories")}
          </button>
          {categories.map((catName) => (
            <button
              key={catName}
              onClick={() => updateFilter("category", catName)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filters.category === catName
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {catName}
            </button>
          ))}
        </div>

        {/* Collections filter */}
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white/80">
          <FilterIcon className="h-4 w-4 text-secondary-400" />
          <span>{t("shop.collectionFilterLabel")}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter("productCollection", "")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              filters.productCollection ? "bg-white/10 text-white/70 hover:bg-white/20" : "bg-secondary-600 text-white shadow-md"
            }`}
          >
            {t("shop.allCollections")}
          </button>
          {collections.map((colName) => (
            <button
              key={colName}
              onClick={() => updateFilter("productCollection", colName)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filters.productCollection === colName
                  ? "bg-secondary-600 text-white shadow-md"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {colName}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => <ProductSkeleton key={idx} />)
          : filteredAndSortedProducts.map((product) => <ProductCard key={product._id || product.id} product={product} />)}
        
        {!loading && filteredAndSortedProducts.length === 0 && (
          <div className="col-span-full glass-card p-12 text-center text-white/70 rounded-3xl border border-white/10">
            <p className="text-base font-medium">{t("shop.empty")}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:bg-primary-500 transition"
              >
                <CloseIcon className="h-4 w-4" />
                {t("shop.resetFilters")}
              </button>
              <Link
                to="/collections"
                className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
              >
                {t("nav.collections")}
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => updateFilter("page", String(pageNumber))}
                className={`rounded-full h-9 w-9 text-xs font-bold transition flex items-center justify-center ${
                  pageNumber === filters.page
                    ? "bg-primary-600 text-white ring-2 ring-primary-400"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Shop;

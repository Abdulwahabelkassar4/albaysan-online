import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import {
  CloseIcon,
  FilterIcon,
  SearchIcon,
  SparkleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../components/icons.jsx";
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
  const [totalProducts, setTotalProducts] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
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
        setTotalProducts(data.pagination?.total || 0);
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
    if (key !== "page") {
      nextParams.delete("page");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setMaxPriceFilter("");
    setSortOption("newest");
  };

  const hasActiveFilters = Boolean(
    filters.category || filters.productCollection || filters.search || maxPriceFilter
  );

  // Dynamic header title & active label
  const activeTitle = useMemo(() => {
    if (filters.category) return `قسم ${filters.category}`;
    if (filters.productCollection) return filters.productCollection;
    if (filters.search) return `نتائج البحث: "${filters.search}"`;
    return t("shop.title");
  }, [filters, t]);

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

  // Reusable Filter Sidebar Content Component
  const FilterControls = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-white/80">البحث عن منتج</label>
        <div className="relative w-full">
          <SearchIcon
            className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-white/45 ${
              isRTL ? "right-3.5" : "left-3.5"
            }`}
          />
          <input
            type="search"
            placeholder={t("shop.searchPlaceholder")}
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            className={`w-full rounded-2xl border border-white/20 bg-neutral-800/90 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
            }`}
          />
        </div>
      </div>

      {/* Sort Selector */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-white/80">الترتيب حسب</label>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full cursor-pointer rounded-2xl border border-white/20 bg-neutral-800/90 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="newest">الأحدث وصولاً</option>
          <option value="price_asc">السعر: من الأقل للأعلى</option>
          <option value="price_desc">السعر: من الأعلى للأقل</option>
        </select>
      </div>

      {/* Categories filter */}
      <div className="border-t border-white/10 pt-5">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <FilterIcon className="h-4 w-4 text-primary-400" />
          <span>{t("shop.categoryFilterLabel")}</span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <button
            onClick={() => updateFilter("category", "")}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              !filters.category
                ? "bg-primary-600/90 text-white font-semibold shadow-md shadow-primary-600/30"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            <span>{t("shop.allCategories")}</span>
          </button>
          {categories.map((catName) => {
            const isActive = filters.category === catName;
            return (
              <button
                key={catName}
                onClick={() => updateFilter("category", catName)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-primary-600/90 text-white font-semibold shadow-md shadow-primary-600/30"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                <span>{catName}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collections filter */}
      <div className="border-t border-white/10 pt-5">
        <div className="flex items-center gap-2 text-xs font-bold text-white/90">
          <FilterIcon className="h-4 w-4 text-secondary-400" />
          <span>{t("shop.collectionFilterLabel")}</span>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <button
            onClick={() => updateFilter("productCollection", "")}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition ${
              !filters.productCollection
                ? "bg-secondary-600/90 text-white font-semibold shadow-md shadow-secondary-600/30"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            <span>{t("shop.allCollections")}</span>
          </button>
          {collections.map((colName) => {
            const isActive = filters.productCollection === colName;
            return (
              <button
                key={colName}
                onClick={() => updateFilter("productCollection", colName)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-secondary-600/90 text-white font-semibold shadow-md shadow-secondary-600/30"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                <span>{colName}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Filter Input */}
      <div className="border-t border-white/10 pt-5">
        <label className="mb-2 block text-xs font-semibold text-white/80">الحد الأقصى للسعر (د.أ)</label>
        <input
          type="number"
          placeholder="مثال: 50"
          value={maxPriceFilter}
          onChange={(e) => setMaxPriceFilter(e.target.value)}
          className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-3.5 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary-400"
        />
      </div>

      {/* Reset All Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
        >
          <CloseIcon className="h-4 w-4" />
          {t("shop.resetFilters")}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {/* Hero Banner with Dynamic Context & Breadcrumb */}
      <section className="glass-card relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            {/* Breadcrumb Navigation */}
            <nav className="mb-2 flex items-center gap-2 text-xs text-white/60">
              <Link to="/" className="hover:text-white transition">الرئيسية</Link>
              <span>/</span>
              <Link to="/shop" onClick={() => clearAllFilters()} className="hover:text-white transition">
                {t("shop.title")}
              </Link>
              {(filters.category || filters.productCollection || filters.search) && (
                <>
                  <span>/</span>
                  <span className="font-semibold text-primary-400">{activeTitle}</span>
                </>
              )}
            </nav>

            <h1 className="flex items-center gap-3 text-2xl font-black text-white md:text-3xl">
              <SparkleIcon className="h-7 w-7 text-primary-400 animate-pulse" />
              {activeTitle}
            </h1>
            <p className="mt-1 text-xs text-white/70 md:text-sm">{t("shop.intro")}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Results Count Badge */}
            <span className="inline-flex items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-xs font-semibold text-primary-300 shadow-inner">
              {totalProducts} منتج متوفر
            </span>

            {/* Mobile Filter Drawer Trigger Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-primary-500 transition lg:hidden"
            >
              <FilterIcon className="h-4 w-4" />
              تصفية الفلاتر
            </button>
          </div>
        </div>
      </section>

      {/* Active Filter Chips Pill Bar */}
      {hasActiveFilters && (
        <section className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md">
          <span className="text-xs font-semibold text-white/60 ml-2">الفلاتر النشطة:</span>

          {filters.category && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/40 bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-200">
              القسم: {filters.category}
              <button
                onClick={() => updateFilter("category", "")}
                className="hover:text-white transition"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {filters.productCollection && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-500/40 bg-secondary-500/20 px-3 py-1 text-xs font-medium text-secondary-200">
              الكوليكشن: {filters.productCollection}
              <button
                onClick={() => updateFilter("productCollection", "")}
                className="hover:text-white transition"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {filters.search && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200">
              البحث: "{filters.search}"
              <button
                onClick={() => updateFilter("search", "")}
                className="hover:text-white transition"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          {maxPriceFilter && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
              السعر حتى: {maxPriceFilter} د.أ
              <button
                onClick={() => setMaxPriceFilter("")}
                className="hover:text-white transition"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-400 underline hover:text-rose-300 transition mr-auto"
          >
            مسح الكل
          </button>
        </section>
      )}

      {/* Main 2-Column Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Sticky Sidebar */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="mb-4 text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FilterIcon className="h-4 w-4 text-primary-400" />
              فلاتر المتجر
            </h2>
            <FilterControls />
          </div>
        </aside>

        {/* Products Grid & Pagination */}
        <main className="lg:col-span-3">
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, idx) => <ProductSkeleton key={idx} />)
              : filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}

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
            <div className="mt-12 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2">
                {/* Previous Page Button */}
                <button
                  onClick={() => updateFilter("page", String(filters.page - 1))}
                  disabled={filters.page <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40"
                  title="الصفحة السابقة"
                >
                  {isRTL ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => updateFilter("page", String(pageNumber))}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                        pageNumber === filters.page
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-600/40 ring-2 ring-primary-400 scale-105"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                {/* Next Page Button */}
                <button
                  onClick={() => updateFilter("page", String(filters.page + 1))}
                  disabled={filters.page >= totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40"
                  title="الصفحة التالية"
                >
                  {isRTL ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                </button>
              </div>

              {totalProducts > 0 && (
                <p className="text-xs text-white/50">
                  {isRTL
                    ? `عرض الصفحة ${filters.page} من أصل ${totalPages} (${totalProducts} منتج إجمالي)`
                    : `Showing page ${filters.page} of ${totalPages} (${totalProducts} total products)`}
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className={`relative ml-auto flex h-full w-full max-w-xs flex-col bg-neutral-900 p-6 shadow-2xl transition-transform border-l border-white/10 overflow-y-auto ${
              isRTL ? "right-0" : "left-0"
            }`}
          >
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FilterIcon className="h-5 w-5 text-primary-400" />
                فلاتر وتصفية المتجر
              </h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="rounded-full bg-white/10 p-1 text-white/70 hover:bg-white/20 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <FilterControls />
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import ProductCard from "../components/ProductCard.jsx";
import {
  ArrowForwardIcon,
  BlossomIcon,
  LeafIcon,
  SnowIcon,
  SunIcon,
} from "../components/icons.jsx";
import { requestWithRetry } from "../utils/requestWithRetry.js";

const collectionOptions = [
  { value: "الكوليكشن الصيفي", key: "summer" },
  { value: "الكوليكشن الخريفي", key: "autumn" },
  { value: "الكوليكشن الشتوي", key: "winter" },
  { value: "الكوليكشن الربيعي", key: "spring" },
];

const collectionVisuals = {
  summer: {
    icon: SunIcon,
    accent: "text-amber-200",
    chip: "border-amber-300/40 text-amber-100 hover:bg-amber-300/10",
    panel: "border-amber-300/20",
  },
  autumn: {
    icon: LeafIcon,
    accent: "text-orange-200",
    chip: "border-orange-300/40 text-orange-100 hover:bg-orange-300/10",
    panel: "border-orange-300/20",
  },
  winter: {
    icon: SnowIcon,
    accent: "text-sky-200",
    chip: "border-sky-300/40 text-sky-100 hover:bg-sky-300/10",
    panel: "border-sky-300/20",
  },
  spring: {
    icon: BlossomIcon,
    accent: "text-pink-200",
    chip: "border-pink-300/40 text-pink-100 hover:bg-pink-300/10",
    panel: "border-pink-300/20",
  },
};

const createLoadingState = () =>
  Object.fromEntries(collectionOptions.map((collection) => [collection.value, true]));

const Collections = () => {
  const [collections, setCollections] = useState({});
  const [loadingByCollection, setLoadingByCollection] = useState(createLoadingState);
  const [activeCollectionKey, setActiveCollectionKey] = useState(collectionOptions[0].key);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const sectionRefs = useRef({});

  useEffect(() => {
    let isMounted = true;
    setLoadingByCollection(createLoadingState());

    collectionOptions.forEach((collection) => {
      requestWithRetry(
        () =>
          axiosClient.get("/api/products", {
            timeout: 12000,
            params: { productCollection: collection.value, limit: 12 },
          }),
        { timeoutMs: 65000 }
      )
        .then(({ data }) => {
          if (!isMounted) return;
          setCollections((prev) => ({ ...prev, [collection.value]: data.data || [] }));
        })
        .catch((error) => {
          console.error("Unable to load collection", collection.value, error);
          if (!isMounted) return;
          setCollections((prev) => ({ ...prev, [collection.value]: [] }));
        })
        .finally(() => {
          if (!isMounted) return;
          setLoadingByCollection((prev) => ({ ...prev, [collection.value]: false }));
        });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length) {
          const topKey = visibleEntries[0].target.getAttribute("data-collection-key");
          if (topKey) {
            setActiveCollectionKey(topKey);
          }
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-20% 0px -50% 0px",
      }
    );

    collectionOptions.forEach((collection) => {
      const element = sectionRefs.current[collection.key];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [collections, loadingByCollection]);

  const scrollToCollection = (key) => {
    const target = sectionRefs.current[key];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCollectionKey(key);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="glass-card animate-reveal p-6">
        <h1 className="text-3xl font-bold text-white">{t("collectionsPage.title")}</h1>
        <p className="mt-2 text-sm text-white/70">{t("collectionsPage.intro")}</p>
        <div className={`mt-5 flex flex-wrap gap-2 ${isRTL ? "justify-end" : "justify-start"}`}>
          {collectionOptions.map((collection, index) => {
            const visual = collectionVisuals[collection.key];
            const Icon = visual.icon;
            const isActive = activeCollectionKey === collection.key;
            return (
              <button
                key={collection.key}
                onClick={() => scrollToCollection(collection.key)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition duration-200 hover:-translate-y-0.5 ${visual.chip} ${
                  isActive ? "bg-white/15 ring-1 ring-white/30" : "bg-white/[0.04]"
                }`}
                style={{ animationDelay: `${0.06 + index * 0.06}s` }}
              >
                <Icon className={`h-4 w-4 ${visual.accent}`} />
                {t(`shop.collections.${collection.key}`)}
              </button>
            );
          })}
        </div>
      </section>

      {collectionOptions.map((collection, sectionIndex) => {
        const items = collections[collection.value] || [];
        const isLoading = loadingByCollection[collection.value];
        const collectionLabel = t(`shop.collections.${collection.key}`);
        const visual = collectionVisuals[collection.key];
        const Icon = visual.icon;

        return (
          <section
            key={collection.value}
            ref={(element) => {
              sectionRefs.current[collection.key] = element;
            }}
            data-collection-key={collection.key}
            className={`animate-reveal mt-12 rounded-3xl border bg-white/[0.03] p-6 backdrop-blur-sm ${visual.panel}`}
            style={{ animationDelay: `${0.08 + sectionIndex * 0.08}s` }}
          >
            <div className={`flex flex-wrap items-center justify-between gap-4 ${isRTL ? "text-right" : "text-left"}`}>
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
                  <Icon className={`h-5 w-5 ${visual.accent}`} />
                  {collectionLabel}
                </h2>
                <p className="text-xs text-white/60">
                  {isLoading ? "..." : `${items.length} ${t("stats.products")}`}
                </p>
              </div>

              <Link
                to={`/shop?productCollection=${encodeURIComponent(collection.value)}`}
                className="btn-ghost text-xs"
              >
                {isRTL ? <ArrowForwardIcon className="h-4 w-4 rotate-180" /> : <ArrowForwardIcon className="h-4 w-4" />}
                {t("shop.title")}
              </Link>
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
                  items.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-reveal transition duration-200 hover:-translate-y-1 hover:drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
                      style={{ animationDelay: `${0.05 + index * 0.06}s` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  <div className={`glass-card col-span-full p-10 ${isRTL ? "text-right" : "text-left"}`}>
                    <div className="mx-auto max-w-xl text-center text-white/70">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
                        <Icon className={`h-5 w-5 ${visual.accent}`} />
                      </div>
                      <p className="text-sm">{t("collectionsPage.empty")}</p>
                      <Link to="/shop" className="btn-ghost mt-4 text-xs">
                        {t("shop.title")}
                      </Link>
                    </div>
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

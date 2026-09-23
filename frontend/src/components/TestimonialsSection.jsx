import { useEffect, useState, useRef } from "react";
import axiosClient from "../api/axiosClient.js";
import { SparkleIcon } from "./icons.jsx";

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 5.0 });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosClient.get("/api/reviews/published?limit=12");
        setReviews(res.data?.data || []);
        if (res.data?.stats) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Responsive items per view
  // Mobile = 1, Tablet = 2, Desktop = 3
  const totalReviews = reviews.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  // Auto-play timer (rotates every 5 seconds, pauses on hover)
  useEffect(() => {
    if (totalReviews > 1 && !isPaused) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [totalReviews, isPaused, currentIndex]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-48 animate-pulse bg-white/5 rounded-3xl" />
          ))}
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Determine items to display in carousel based on offset
  const getVisibleReviews = () => {
    if (totalReviews <= 3) return reviews;
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(reviews[(currentIndex + i) % totalReviews]);
    }
    return items;
  };

  const visibleReviews = getVisibleReviews();

  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-500/10 px-4 py-1.5 text-xs font-bold text-secondary-300 shadow-sm animate-pulse">
            <SparkleIcon className="h-4 w-4" />
            <span>تجارب وآراء حقيقية من زبائننا</span>
          </div>

          <h2 className="mt-4 text-3xl md:text-4xl font-black text-white">
            ماذا يقول عملاؤنا عن <span className="bg-gradient-to-r from-primary-300 via-secondary-300 to-primary-200 bg-clip-text text-transparent">البيلسان</span>
          </h2>

          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1 text-amber-400 text-lg">
              {"★".repeat(5)}
            </div>
            <span className="text-sm font-bold text-white">
              {stats.avgRating.toFixed(1)} / 5.0
            </span>
            <span className="text-xs text-white/50">
              ({stats.totalReviews} {stats.totalReviews === 1 ? "تقييم موثق" : "تقييمات موثقة"})
            </span>
          </div>
        </div>

        {/* Carousel Controls (when > 3 reviews) */}
        {totalReviews > 3 && (
          <div className="mb-6 flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">
              عرض {currentIndex + 1} من {totalReviews}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                aria-label="Previous testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-neutral-900/80 text-white shadow-md transition hover:bg-white/20 hover:scale-110 active:scale-95"
              >
                →
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next testimonial"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-neutral-900/80 text-white shadow-md transition hover:bg-white/20 hover:scale-110 active:scale-95"
              >
                ←
              </button>
            </div>
          </div>
        )}

        {/* Testimonials Animated Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 justify-center transition-all duration-500 ease-out">
          {visibleReviews.map((rev, index) => (
            <div
              key={`${rev._id}-${index}`}
              className="glass-card animate-reveal flex flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/85 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-950/40 text-right w-full min-h-[230px]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-3">
                {/* Header with Avatar, Name, and Verified Badge */}
                <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 p-0.5 shadow-md">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                        {rev.publicDisplayName?.slice(0, 2) || "زبون"}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {rev.publicDisplayName}
                      </h3>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                        <span>✓</span>
                        <span>مشترٍ موثق</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex text-amber-400 text-sm dir-ltr">
                    {"★".repeat(rev.rating || 5)}
                  </div>
                </div>

                {/* Tagged Products (if any) */}
                {rev.taggedProducts && rev.taggedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rev.taggedProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/80"
                      >
                        🏷️ {p.productName}
                        {p.selectedPiecesSummary ? ` (${p.selectedPiecesSummary})` : ""}
                      </span>
                    ))}
                  </div>
                )}

                {/* Review Text */}
                <p className="text-xs md:text-sm text-white/80 leading-relaxed italic line-clamp-4">
                  "{rev.comment}"
                </p>
              </div>

              {/* Admin Reply Sub-card (if exists) */}
              {rev.adminReply && rev.adminReply.comment && (
                <div className="mt-4 rounded-2xl border border-primary-500/30 bg-primary-950/30 p-3 text-xs text-right">
                  <div className="flex items-center gap-1.5 text-primary-300 font-bold mb-1">
                    <span>🌸</span>
                    <span>رد متجر البيلسان:</span>
                  </div>
                  <p className="text-white/80 text-[11px] leading-relaxed">
                    {rev.adminReply.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dots Pagination Indicator (when > 3 reviews) */}
        {totalReviews > 3 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {reviews.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === dotIdx
                    ? "w-7 bg-gradient-to-r from-primary-400 to-secondary-400 shadow-sm"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;

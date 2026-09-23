import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.js";
import { SparkleIcon } from "./icons.jsx";

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 5.0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosClient.get("/api/reviews/published?limit=6");
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
    return null; // Gracefully hide when no reviews are approved yet
  }

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary-400/30 bg-secondary-500/10 px-4 py-1.5 text-xs font-bold text-secondary-300">
            <SparkleIcon className="h-4 w-4" />
            <span>تجارب وآراء حقيقية</span>
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

        {/* Testimonials Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="glass-card flex flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/80 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-950/30 text-right"
            >
              <div>
                {/* Header with Avatar, Name, and Verified Badge */}
                <div className="flex items-center justify-between gap-3 mb-4">
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

                  {/* Stars */}
                  <div className="flex text-amber-400 text-sm dir-ltr">
                    {"★".repeat(rev.rating || 5)}
                  </div>
                </div>

                {/* Tagged Products (if any) */}
                {rev.taggedProducts && rev.taggedProducts.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
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
                <p className="text-xs md:text-sm text-white/80 leading-relaxed italic">
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
      </div>
    </section>
  );
};

export default TestimonialsSection;

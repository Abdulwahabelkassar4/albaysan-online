import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { normalizeJordanPhoneForWhatsApp } from "../config/contact.js";
import { SparkleIcon, CloseIcon } from "../components/icons.jsx";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  // Admin Reply Modal State
  const [replyModalReview, setReplyModalReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);

  const { showToast } = useToast();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/reviews/admin", {
        params: {
          status: activeTab === "all" ? undefined : activeTab,
          search: search || undefined,
        },
      });

      setReviews(res.data?.data || []);
      if (res.data?.counts) {
        setCounts(res.data.counts);
      }
    } catch (err) {
      showToast("فشل تحميل التقييمات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [activeTab, search]);

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.put(`/api/reviews/admin/${id}/status`, { status });
      showToast(status === "approved" ? "تم قبول ونشر التقييم بنجاح" : "تم رفض التقييم", "success");
      loadReviews();
    } catch (err) {
      showToast("فشل تحديث حالة التقييم", "error");
    }
  };

  const togglePin = async (review) => {
    try {
      await axiosClient.put(`/api/reviews/admin/${review._id}/status`, {
        isPinned: !review.isPinned,
      });
      showToast(review.isPinned ? "تم إلغاء التثبيت" : "تم تثبيت التقييم في أعلى القائمة", "success");
      loadReviews();
    } catch (err) {
      showToast("فشل تحديث التثبيت", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم نهائياً؟")) return;
    try {
      await axiosClient.delete(`/api/reviews/admin/${id}`);
      showToast("تم حذف التقييم بنجاح", "success");
      loadReviews();
    } catch (err) {
      showToast("فشل حذف التقييم", "error");
    }
  };

  const openReplyModal = (review) => {
    setReplyModalReview(review);
    setReplyText(review.adminReply?.comment || "");
  };

  const saveReply = async () => {
    if (!replyModalReview) return;
    setSavingReply(true);
    try {
      await axiosClient.put(`/api/reviews/admin/${replyModalReview._id}/reply`, {
        comment: replyText,
      });
      showToast("تم حفظ رد المتجر بنجاح", "success");
      setReplyModalReview(null);
      loadReviews();
    } catch (err) {
      showToast("فشل حفظ رد المتجر", "error");
    } finally {
      setSavingReply(false);
    }
  };

  const getWhatsAppChatUrl = (phone, customerName) => {
    const base = normalizeJordanPhoneForWhatsApp(phone);
    const text = `مرحباً ${customerName} 🌸، نتواصل معكِ من متجر البيلسان بخصوص تقييمك ورأيك القيّم...`;
    return `https://wa.me/${base}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <SparkleIcon className="h-7 w-7 text-amber-400" />
            <span>إدارة آراء وتقييمات العملاء</span>
          </h1>
          <p className="mt-1 text-xs md:text-sm text-white/60">
            مراجعة التقييمات الواردة من الزبائن الموثقين، النشر، الردود، والتواصل المباشر (إجمالي: {counts.total})
          </p>
        </div>

        {/* Search Input */}
        <input
          type="search"
          placeholder="بحث بالاسم أو الهاتف أو النص..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full border border-white/20 bg-neutral-800 px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full md:w-64"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`relative rounded-full px-5 py-2 text-xs font-bold transition ${
            activeTab === "pending"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-neutral-800/80 text-white/70 hover:bg-neutral-700"
          }`}
        >
          ⏳ قيد المراجعة ({counts.pending})
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition ${
            activeTab === "approved"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
              : "bg-neutral-800/80 text-white/70 hover:bg-neutral-700"
          }`}
        >
          ✅ المقبولة والمنشورة ({counts.approved})
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition ${
            activeTab === "rejected"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
              : "bg-neutral-800/80 text-white/70 hover:bg-neutral-700"
          }`}
        >
          🚫 المرفوضة ({counts.rejected})
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-full px-5 py-2 text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-white text-black shadow-lg"
              : "bg-neutral-800/80 text-white/70 hover:bg-neutral-700"
          }`}
        >
          📋 جميع التقييمات ({counts.total})
        </button>
      </div>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="glass-card h-40 animate-pulse bg-white/5 rounded-3xl" />
        ) : reviews.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-neutral-900/50 p-12 text-center text-white/60">
            لا توجد تقييمات في هذا القسم حالياً.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className={`rounded-3xl border p-6 backdrop-blur-xl transition ${
                rev.status === "approved"
                  ? "border-emerald-500/30 bg-neutral-900/90"
                  : rev.status === "rejected"
                  ? "border-rose-500/30 bg-neutral-900/60"
                  : "border-amber-500/40 bg-neutral-900/90 shadow-lg shadow-amber-950/20"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Review Body */}
                <div className="flex-1 space-y-3">
                  {/* Status & Privacy Info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-3 py-0.5 font-bold ${
                        rev.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : rev.status === "rejected"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                      }`}
                    >
                      {rev.status === "approved" ? "منشور بالمتجر" : rev.status === "rejected" ? "مرفوض" : "بانتظار الموافقة"}
                    </span>

                    {rev.isPinned && (
                      <span className="rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 font-bold">
                        📌 مثبت بالواجهة
                      </span>
                    )}

                    <span className="text-white/50">
                      {new Date(rev.createdAt).toLocaleDateString("ar-JO")}
                    </span>
                  </div>

                  {/* Customer Identity */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-extrabold text-white">{rev.customerName}</h3>
                    <span className="rounded-lg bg-neutral-800 px-2 py-0.5 text-xs text-secondary-300 font-mono">
                      الاسم المعروض للعامة: {rev.publicDisplayName} ({rev.displayOption === "initials" ? "أحرف أولى" : "اسم كامل"})
                    </span>
                    <span className="text-xs text-white/70 font-mono">📱 {rev.phone}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400 text-lg dir-ltr">
                      {"★".repeat(rev.rating || 5)}
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      ({rev.rating} من 5)
                    </span>
                  </div>

                  {/* Tagged Products */}
                  {rev.taggedProducts && rev.taggedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rev.taggedProducts.map((p, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.05] px-2.5 py-1 text-xs text-white/90"
                        >
                          🏷️ {p.productName}
                          {p.selectedPiecesSummary ? ` (${p.selectedPiecesSummary})` : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Review Text */}
                  <div className="rounded-2xl border border-white/5 bg-black/40 p-4 text-sm text-white/90 leading-relaxed">
                    "{rev.comment}"
                  </div>

                  {/* Admin Reply (if exists) */}
                  {rev.adminReply && rev.adminReply.comment && (
                    <div className="rounded-2xl border border-primary-500/30 bg-primary-950/30 p-3 text-xs">
                      <p className="font-bold text-primary-300 mb-1">🌸 رد المتجر المنشور:</p>
                      <p className="text-white/80">{rev.adminReply.comment}</p>
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-col gap-2 shrink-0 md:w-48">
                  {rev.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(rev._id, "approved")}
                      className="w-full rounded-full bg-emerald-500 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition"
                    >
                      ✓ قبول ونشر
                    </button>
                  )}

                  {rev.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(rev._id, "rejected")}
                      className="w-full rounded-full border border-rose-500/40 bg-rose-950/30 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition"
                    >
                      ✕ رفض / إخفاء
                    </button>
                  )}

                  <button
                    onClick={() => openReplyModal(rev)}
                    className="w-full rounded-full border border-primary-500/40 bg-primary-950/30 py-2 text-xs font-bold text-primary-300 hover:bg-primary-900/50 transition"
                  >
                    💬 {rev.adminReply?.comment ? "تعديل رد المتجر" : "إضافة رد المتجر"}
                  </button>

                  <button
                    onClick={() => togglePin(rev)}
                    className="w-full rounded-full border border-purple-500/40 bg-purple-950/30 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900/50 transition"
                  >
                    📌 {rev.isPinned ? "إلغاء التثبيت" : "تثبيت في الواجهة"}
                  </button>

                  <a
                    href={getWhatsAppChatUrl(rev.phone, rev.customerName)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-full border border-emerald-500/40 bg-emerald-950/30 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition text-center"
                  >
                    📲 تواصل عبر واتساب
                  </a>

                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="w-full rounded-full border border-white/10 bg-white/5 py-1.5 text-[11px] text-white/50 hover:bg-rose-950/50 hover:text-rose-400 transition"
                  >
                    🗑️ حذف نهائي
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Reply Modal */}
      {replyModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-neutral-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white">
                إضافة رد رسمي من متجر البيلسان
              </h3>
              <button
                onClick={() => setReplyModalReview(null)}
                className="rounded-full bg-neutral-800 p-1.5 text-white/70 hover:bg-neutral-700"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.04] p-3 text-xs text-white/70 mb-4">
              <strong>تقييم {replyModalReview.customerName}:</strong>
              <p className="mt-1 italic">"{replyModalReview.comment}"</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-white">
                اكتب رد المتجر (سيظهر أسفل التقييم بالواجهة):
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="مثال: يسعدنا دائماً خدمتكِ وشهادتكِ وسام فخر لنا! 🌸"
                className="w-full rounded-2xl border border-white/20 bg-neutral-800 p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setReplyModalReview(null)}
                className="rounded-full border border-white/20 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-700"
              >
                إلغاء
              </button>
              <button
                onClick={saveReply}
                disabled={savingReply}
                className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {savingReply ? "جاري الحفظ..." : "حفظ الرد ونشره"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;

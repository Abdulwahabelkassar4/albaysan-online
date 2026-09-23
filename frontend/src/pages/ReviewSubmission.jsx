import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import { SparkleIcon } from "../components/icons.jsx";

const ratingLabels = {
  1: "سيء جداً 😞",
  2: "مقبول 😐",
  3: "جيد 👍",
  4: "جيد جداً ✨",
  5: "ممتاز ورائع جداً! 🌟",
};

const ReviewSubmission = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [displayOption, setDisplayOption] = useState("initials");
  const [isGeneralReview, setIsGeneralReview] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("رابط التقييم غير مكتمل أو مفقود. يرجى استخدام الرابط المرسل عبر الواتساب.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axiosClient.get(`/api/reviews/verify-token/${token}`);
        if (res.data?.valid) {
          setOrderData(res.data);
          // By default, select all purchased products for tagging
          if (res.data.items && res.data.items.length > 0) {
            setSelectedProductIds(res.data.items.map((_, idx) => idx));
          }
        }
      } catch (err) {
        if (err.response?.data?.alreadyReviewed) {
          setAlreadyReviewed(true);
        } else {
          setError(err.response?.data?.message || "رابط التقييم غير صالح أو منتهي الصلاحية.");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const toggleProductSelection = (idx) => {
    setSelectedProductIds((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const getInitialsPreview = (name) => {
    if (!name) return "ع. م.";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return `${parts[0].charAt(0)}.`;
    return `${parts[0].charAt(0)}. ${parts[parts.length - 1].charAt(0)}.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("يرجى كتابة رأيك وتجربتك مع المتجر");
      return;
    }

    setSubmitting(true);
    try {
      const taggedProducts = (orderData?.items || [])
        .filter((_, idx) => selectedProductIds.includes(idx))
        .map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          selectedPiecesSummary: item.selectedPiecesSummary,
        }));

      await axiosClient.post("/api/reviews/submit", {
        token,
        rating,
        comment: comment.trim(),
        displayOption,
        isGeneralReview,
        taggedProducts,
      });

      setSubmittedSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "حدث خطأ أثناء إرسال التقييم، يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-white/80">جاري التحقق من رابط التقييم الخاص بك...</p>
        </div>
      </div>
    );
  }

  // Already Reviewed Screen
  if (alreadyReviewed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <span className="inline-block text-5xl mb-4">🌸</span>
          <h2 className="text-2xl font-bold text-white">تم استلام تقييمك مسبقاً!</h2>
          <p className="mt-3 text-sm text-white/70">
            لقد قمت بإرسال تقييمك لهذا الطلب بالفعل. نقدر وقتك ورأيك القيّم الذي يساعدنا دائماً على تقديم الأفضل!
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
          >
            تصفح أحدث الموديلات ✨
          </Link>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !orderData) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <span className="inline-block text-5xl mb-4">⚠️</span>
          <h2 className="text-2xl font-bold text-white">الرابط غير متاح</h2>
          <p className="mt-3 text-sm text-white/70">{error}</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // Success Screen
  if (submittedSuccess) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center animate-reveal">
        <div className="rounded-3xl border border-emerald-500/40 bg-neutral-900/95 p-10 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-3xl">
            ✓
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-white">شكراً جزيلاً لكِ {orderData.customerName}! 🌸</h2>
          <p className="mt-3 text-sm text-white/80 leading-relaxed">
            تم إرسال تقييمك بنجاح. تسعدنا جداً مشاركتك لتجربتك معنا، وسنعمل دائماً لنكون عند حسن ظنك في متجر البيلسان أونلاين.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
            >
              متابعة التسوق 🛍️
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main Review Form
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-right">
      <div className="rounded-3xl border border-white/10 bg-neutral-900/90 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="border-b border-white/10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-bold text-primary-300">
            <SparkleIcon className="h-4 w-4" />
            <span>رأي الزبون الموثق</span>
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-white">
            مرحباً {orderData.customerName} 🌸
          </h1>
          <p className="mt-2 text-sm text-white/70">
            يسعدنا سماع رأيك وتجربتك مع طلبك من متجر البيلسان لتطوير خدماتنا باستمرار
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Star Rating Selector */}
          <div className="text-center">
            <label className="block text-sm font-bold text-white/90 mb-3">
              ما هو تقييمك العام لتجربتك معنا؟
            </label>
            <div className="flex items-center justify-center gap-2 dir-ltr">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-3xl md:text-4xl transition-transform duration-150 hover:scale-125 focus:outline-none"
                  >
                    <span className={active ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-neutral-600"}>
                      ★
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs font-semibold text-amber-300">
              {ratingLabels[hoverRating || rating]}
            </p>
          </div>

          {/* Tag Purchased Products */}
          {orderData.items && orderData.items.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-white/90">
                القطع والمنتجات التي ترغب بذكرها في التقييم:
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 cursor-pointer hover:bg-white/[0.08] transition">
                  <input
                    type="checkbox"
                    checked={isGeneralReview}
                    onChange={(e) => setIsGeneralReview(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-white">✨ تقييم عام للمتجر وخدمة التوصيل</span>
                </label>

                {orderData.items.map((item, idx) => {
                  const isChecked = selectedProductIds.includes(idx);
                  return (
                    <label
                      key={idx}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer transition ${
                        isChecked
                          ? "border-primary-500/50 bg-primary-950/20"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProductSelection(idx)}
                          className="h-4 w-4 rounded accent-primary-500 cursor-pointer shrink-0"
                        />
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-11 w-11 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-neutral-800 flex items-center justify-center text-[9px] text-white/40 shrink-0">
                            بدون صورة
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.productName}</p>
                          {(item.size || item.color || item.selectedPiecesSummary) && (
                            <p className="text-[11px] text-white/60 truncate">
                              {[item.size, item.color, item.selectedPiecesSummary].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comment Text Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-white/90">
                اكتبي رأيك وتجربتك بكل صراحة:
              </label>
              <span className={`text-[11px] font-mono ${comment.length >= 950 ? "text-rose-400 font-bold" : "text-white/50"}`}>
                {comment.length} / 1000 حرف
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="مثال: القماش جداً راقي والمقاس مضبوط تماماً، والتوصيل كان سريع وتعاملهم راقي..."
              className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 p-4 text-xs text-white placeholder-white/30 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 leading-relaxed"
            />
          </div>

          {/* Privacy & Name Options */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-white mb-2">كيف ترغبين أن يظهر اسمك على التقييم في المتجر؟</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDisplayOption("initials")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-right text-xs transition ${
                    displayOption === "initials"
                      ? "border-secondary-400 bg-secondary-950/30 text-white font-bold"
                      : "border-white/10 bg-neutral-800/50 text-white/70 hover:bg-neutral-800"
                  }`}
                >
                  <span>الحروف الأولى فقط (خصوصية أعلى)</span>
                  <span className="font-mono text-secondary-300 bg-white/10 px-2 py-0.5 rounded">
                    {getInitialsPreview(orderData.customerName)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDisplayOption("full_name")}
                  className={`flex items-center justify-between rounded-xl border p-3 text-right text-xs transition ${
                    displayOption === "full_name"
                      ? "border-secondary-400 bg-secondary-950/30 text-white font-bold"
                      : "border-white/10 bg-neutral-800/50 text-white/70 hover:bg-neutral-800"
                  }`}
                >
                  <span>الاسم الكامل</span>
                  <span className="text-secondary-300 font-medium truncate max-w-[100px]">
                    {orderData.customerName}
                  </span>
                </button>
              </div>
            </div>

            {/* Explicit Phone Guarantee Badge */}
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-300">
              <span className="text-base">🔒</span>
              <span>
                <strong>ضمان الخصوصية:</strong> رقم هاتفك لن يظهر للعامة أبداً، وهو مخصص للتواصل الداخلي وخدمة العملاء فقط.
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary-950/50 transition duration-200 hover:scale-[1.02] disabled:opacity-50"
          >
            {submitting ? "جاري الإرسال..." : "إرسال التقييم الآن ✨"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewSubmission;

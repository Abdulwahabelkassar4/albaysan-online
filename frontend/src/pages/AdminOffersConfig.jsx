import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";
import { ArrowForwardIcon, ClockIcon, SparkleIcon } from "../components/icons.jsx";

// Helper to format ISO Date string into HTML <input type="datetime-local"> format YYYY-MM-DDTHH:mm
const toDatetimeLocal = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const AdminOffersConfig = () => {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "تخفيضات البيلسان الحصرية",
    subtitle: "خصومات مميزة على أرقى تشكيلات العباءات والسبورات الشرعية لفترة محدودة",
    badgeText: "عرض لفترة محدودة 🔥",
    promoCode: "BAYSAN20",
    endDate: "",
    isEnabled: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await axiosClient.get("/api/offer-settings");
        setFormData({
          title: data.title || "",
          subtitle: data.subtitle || "",
          badgeText: data.badgeText || "",
          promoCode: data.promoCode || "",
          endDate: toDatetimeLocal(data.endDate),
          isEnabled: typeof data.isEnabled === "boolean" ? data.isEnabled : true,
        });
      } catch (error) {
        console.error("Unable to load offer settings", error);
        showToast("تعذر تحميل إعدادات التخفيضات", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [showToast]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.endDate) {
      showToast("يرجى تحديد تاريخ ووقت انتهاء العرض", "error");
      return;
    }

    setSaving(true);
    try {
      await axiosClient.put("/api/offer-settings", {
        ...formData,
        endDate: new Date(formData.endDate).toISOString(),
      });
      showToast("تم حفظ إعدادات العداد التنازلي للتخفيضات بنجاح 🎯", "success");
    } catch (error) {
      console.error("Unable to save offer settings", error);
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <nav className="mb-2 flex items-center gap-2 text-xs text-white/60">
            <Link to="/admin" className="hover:text-white transition">لوحة التحكم</Link>
            <span>/</span>
            <span className="text-primary-400 font-semibold">إعدادات عداد العروض</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-primary-400" />
            إدارة العداد التنازلي للتخفيضات
          </h1>
        </div>

        <Link
          to="/admin"
          className="btn-ghost self-start sm:self-auto text-xs"
        >
          {isRTL ? <ArrowForwardIcon className="h-4 w-4 rotate-180" /> : <ArrowForwardIcon className="h-4 w-4" />}
          العودة للوحة التحكم
        </Link>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-white/70 animate-pulse">
          جاري تحميل الإعدادات...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white">تفعيل العداد التنازلي</h2>
                <p className="text-xs text-white/60">إظهار أو إخفاء عداد التخفيضات للزوار</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={handleChange("isEnabled")}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-primary-600 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* Campaign Title */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/80">عنوان الحملة / العرض</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleChange("title")}
                placeholder="مثال: تخفيضات البيلسان الحصرية"
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/80">وصف العرض المختصر</label>
              <textarea
                rows={3}
                value={formData.subtitle}
                onChange={handleChange("subtitle")}
                placeholder="مثال: خصومات مميزة تصل حتى 50% لفترة محدودة"
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* End Date Picker */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-white/80">تاريخ ووقت انتهاء العرض</label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={handleChange("endDate")}
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Badge Text & Promo Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/80">نص الشارة الأعلى</label>
                <input
                  type="text"
                  value={formData.badgeText}
                  onChange={handleChange("badgeText")}
                  placeholder="مثال: عرض لفترة محدودة 🔥"
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-white/80">كود الخصم (اختياري)</label>
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={handleChange("promoCode")}
                  placeholder="مثال: BAYSAN20"
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-xl hover:opacity-95 transition disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ التغييرات ونشر العداد 🚀"}
            </button>
          </form>

          {/* Live Preview Box */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-white/80 flex items-center gap-2">
              <SparkleIcon className="h-4 w-4 text-amber-400" />
              معاينة حية للمستخدمين (Live Customer Preview)
            </h2>

            <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
              <OfferCountdown
                targetDate={formData.endDate}
                title={formData.title}
                subtitle={formData.subtitle}
                badgeText={formData.badgeText}
                promoCode={formData.promoCode}
                isEnabled={formData.isEnabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersConfig;

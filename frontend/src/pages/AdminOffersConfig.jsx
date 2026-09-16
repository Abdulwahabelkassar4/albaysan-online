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
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "تخفيضات البيلسان الحصرية",
    subtitle: "خصومات مميزة على أرقى تشكيلات العباءات والسبورات الشرعية لفترة محدودة",
    badgeText: "عرض لفترة محدودة 🔥",
    promoCode: "BAYSAN20",
    endDate: "",
    isEnabled: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: settingsData }, { data: productsData }] = await Promise.all([
          axiosClient.get("/api/offer-settings"),
          axiosClient.get("/api/products", { params: { limit: 200, raw: true } }),
        ]);

        setFormData({
          title: settingsData.title || "",
          subtitle: settingsData.subtitle || "",
          badgeText: settingsData.badgeText || "",
          promoCode: settingsData.promoCode || "",
          endDate: toDatetimeLocal(settingsData.endDate),
          isEnabled: typeof settingsData.isEnabled === "boolean" ? settingsData.isEnabled : true,
        });

        const initialProducts = Array.isArray(settingsData.products)
          ? settingsData.products.map((p) => (typeof p === "string" ? p : p._id || p.id))
          : [];
        setSelectedProductIds(initialProducts);

        if (productsData && Array.isArray(productsData.data)) {
          setAllProducts(productsData.data);
        }
      } catch (error) {
        console.error("Unable to load offer settings", error);
        showToast("تعذر تحميل إعدادات التخفيضات والمنتجات", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleProductSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedProductIds(allProducts.map((p) => p.id || p._id));
  };

  const handleDeselectAll = () => {
    setSelectedProductIds([]);
  };

  const handleSelectDiscountedOnly = () => {
    const discountedIds = allProducts
      .filter((p) => (p.originalPrice && p.originalPrice > p.price) || p.discountTag)
      .map((p) => p.id || p._id);
    setSelectedProductIds(discountedIds);
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
        products: selectedProductIds,
      });
      showToast("تم حفظ إعدادات العروض والتخفيضات بنجاح 🎯", "success");
    } catch (error) {
      console.error("Unable to save offer settings", error);
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = allProducts.filter((product) => {
    if (!productSearch.trim()) return true;
    const term = productSearch.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(term)) ||
      (product.category && product.category.toLowerCase().includes(term))
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
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
            إدارة العداد والمنتجات المشمولة بالعرض
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
          جاري تحميل الإعدادات والمنتجات...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Settings Form */}
            <div className="lg:col-span-6 glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
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
            </div>

            {/* Live Preview & Overview */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white/80 flex items-center gap-2 mb-3">
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

              <div className="glass-card p-6 rounded-3xl border border-white/10">
                <h3 className="text-sm font-bold text-white mb-2">ملخص العرض النشط</h3>
                <p className="text-xs text-white/70">
                  عدد المنتجات المحددة حالياً لتكون ضمن هذا العرض:{" "}
                  <span className="font-extrabold text-primary-400 text-sm px-2 py-0.5 rounded-lg bg-primary-500/20 border border-primary-500/30">
                    {selectedProductIds.length} منتج
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Selective Product Picker Section */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <span>🎯</span> اختيار المنتجات المشمولة بالعرض
                </h2>
                <p className="text-xs text-white/60">
                  حدد المنتجات التي تريد إظهار تخفيضها وتضمينها في العرض التنازلي. يمكنك التعديل في أي وقت.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectDiscountedOnly}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition"
                >
                  تحديد المنتجات التي لها تخفيض 🏷️
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                >
                  تحديد الكل ({allProducts.length})
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition"
                >
                  إلغاء تحديد الكل
                </button>
              </div>
            </div>

            {/* Filter Search */}
            <div className="flex items-center justify-between gap-4">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="ابحث عن منتج بالاسم أو القسم..."
                className="w-full md:w-80 rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-white/50 whitespace-nowrap">
                تم تحديد {selectedProductIds.length} من {allProducts.length}
              </span>
            </div>

            {/* Products List Grid */}
            <div className="max-h-96 overflow-y-auto pr-1 space-y-2 border border-white/10 rounded-2xl p-3 bg-black/20">
              {filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/50">
                  لا توجد منتجات مطابقة لـ "{productSearch}"
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const pId = product.id || product._id;
                  const isSelected = selectedProductIds.includes(pId);
                  const image =
                    Array.isArray(product.images) && product.images.length > 0
                      ? product.images[0]
                      : "/placeholder.png";

                  return (
                    <div
                      key={pId}
                      onClick={() => toggleProductSelect(pId)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition select-none ${
                        isSelected
                          ? "bg-primary-950/40 border-primary-500/50"
                          : "bg-neutral-900/60 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelect(pId)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-white/30 bg-neutral-800 text-primary-600 focus:ring-primary-500"
                        />
                        <img
                          src={image}
                          alt={product.name}
                          className="h-10 w-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{product.name}</p>
                          <p className="text-[10px] text-white/50">{product.category}</p>
                        </div>
                      </div>

                      <div className="text-left flex items-center gap-4">
                        <div>
                          <p className="text-xs font-semibold text-primary-400">
                            {product.price} ر.س
                          </p>
                          {product.originalPrice && (
                            <p className="text-[10px] text-white/40 line-through">
                              {product.originalPrice} ر.س
                            </p>
                          )}
                        </div>

                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                            مشمول بالعرض ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/5 text-white/40">
                            غير مشمول
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-primary-600 via-pink-600 to-amber-500 py-4 text-base font-extrabold text-white shadow-2xl hover:opacity-95 transition disabled:opacity-50"
          >
            {saving ? "جاري الحفظ والتطبيق..." : `حفظ التغييرات ونشر العرض (${selectedProductIds.length} منتج مشمول) 🚀`}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminOffersConfig;

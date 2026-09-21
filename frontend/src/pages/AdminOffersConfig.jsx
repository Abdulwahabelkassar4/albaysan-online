import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import OfferCountdown from "../components/OfferCountdown.jsx";
import { ArrowForwardIcon, ClockIcon, SparkleIcon, CloseIcon } from "../components/icons.jsx";

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

const defaultPromoState = {
  _id: null,
  code: "",
  discountType: "percentage",
  discountValue: 10,
  startDate: toDatetimeLocal(new Date().toISOString()),
  endDate: toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
  isEnabled: true,
  scope: "global",
  applicableCategories: [],
  applicableProducts: [],
  usageLimit: "",
};

const AdminOffersConfig = () => {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [activeTab, setActiveTab] = useState("campaign"); // 'campaign' | 'promoCodes'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);

  // Campaign Form State
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [productSearch, setProductSearch] = useState("");

  const [formData, setFormData] = useState({
    title: "تخفيضات البيلسان الحصرية",
    subtitle: "خصومات مميزة على أرقى تشكيلات العباءات والسبورات الشرعية لفترة محدودة",
    badgeText: "عرض لفترة محدودة 🔥",
    promoCode: "BAYSAN20",
    discountPercentage: 20,
    endDate: "",
    isEnabled: true,
    scope: "selective", // 'selective' | 'global' | 'categories'
  });

  // Promo Code Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoFormData, setPromoFormData] = useState({ ...defaultPromoState });
  const [savingPromo, setSavingPromo] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        { data: settingsData },
        { data: productsData },
        { data: categoriesData },
        { data: promoData },
      ] = await Promise.all([
        axiosClient.get("/api/offer-settings"),
        axiosClient.get("/api/products", { params: { limit: 200, raw: true } }),
        axiosClient.get("/api/categories").catch(() => ({ data: [] })),
        axiosClient.get("/api/promo-codes").catch(() => ({ data: [] })),
      ]);

      setFormData({
        title: settingsData.title || "",
        subtitle: settingsData.subtitle || "",
        badgeText: settingsData.badgeText || "",
        promoCode: settingsData.promoCode || "",
        discountPercentage: settingsData.discountPercentage !== undefined ? settingsData.discountPercentage : 0,
        endDate: toDatetimeLocal(settingsData.endDate),
        isEnabled: typeof settingsData.isEnabled === "boolean" ? settingsData.isEnabled : true,
        scope: settingsData.scope || "selective",
      });

      const initialProducts = Array.isArray(settingsData.products)
        ? settingsData.products.map((p) => (typeof p === "string" ? p : p._id || p.id))
        : [];
      setSelectedProductIds(initialProducts);

      setSelectedCategories(Array.isArray(settingsData.categories) ? settingsData.categories : []);

      if (productsData && Array.isArray(productsData.data)) {
        setAllProducts(productsData.data);
      }

      if (Array.isArray(categoriesData)) {
        setAllCategories(categoriesData);
      }

      if (Array.isArray(promoData)) {
        setPromoCodes(promoData);
      }
    } catch (error) {
      console.error("Unable to load offer settings", error);
      showToast("تعذر تحميل إعدادات التخفيضات والمنتجات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleProductSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const toggleCategorySelect = (catName) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleSelectAllProducts = () => {
    setSelectedProductIds(allProducts.map((p) => p.id || p._id));
  };

  const handleDeselectAllProducts = () => {
    setSelectedProductIds([]);
  };

  const handleSelectDiscountedOnly = () => {
    const discountedIds = allProducts
      .filter((p) => (p.originalPrice && p.originalPrice > p.price) || p.discountTag)
      .map((p) => p.id || p._id);
    setSelectedProductIds(discountedIds);
  };

  const handleSubmitCampaign = async (e) => {
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
        categories: selectedCategories,
      });
      showToast("تم حفظ إعدادات العروض والتخفيضات ونطاق التطبيق بنجاح 🎯", "success");
    } catch (error) {
      console.error("Unable to save offer settings", error);
      showToast("حدث خطأ أثناء حفظ الإعدادات", "error");
    } finally {
      setSaving(false);
    }
  };

  // Promo Code Handlers
  const handleOpenNewPromoModal = () => {
    setPromoFormData({
      ...defaultPromoState,
      startDate: toDatetimeLocal(new Date().toISOString()),
      endDate: toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
    });
    setShowPromoModal(true);
  };

  const handleEditPromoModal = (promo) => {
    setPromoFormData({
      _id: promo._id || promo.id,
      code: promo.code,
      discountType: promo.discountType || "percentage",
      discountValue: promo.discountValue,
      startDate: toDatetimeLocal(promo.startDate),
      endDate: toDatetimeLocal(promo.endDate),
      isEnabled: typeof promo.isEnabled === "boolean" ? promo.isEnabled : true,
      scope: promo.scope || "global",
      applicableCategories: Array.isArray(promo.applicableCategories) ? promo.applicableCategories : [],
      applicableProducts: Array.isArray(promo.applicableProducts)
        ? promo.applicableProducts.map((p) => (typeof p === "string" ? p : p._id || p.id))
        : [],
      usageLimit: promo.usageLimit !== null ? promo.usageLimit : "",
    });
    setShowPromoModal(true);
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!promoFormData.code.trim() || !promoFormData.discountValue || !promoFormData.endDate) {
      showToast("يرجى تعبئة رمز الكود وقيمة الخصم وتاريخ الانتهاء", "error");
      return;
    }

    setSavingPromo(true);
    try {
      const payload = {
        code: promoFormData.code.trim().toUpperCase(),
        discountType: promoFormData.discountType,
        discountValue: Number(promoFormData.discountValue),
        startDate: promoFormData.startDate ? new Date(promoFormData.startDate).toISOString() : new Date().toISOString(),
        endDate: new Date(promoFormData.endDate).toISOString(),
        isEnabled: promoFormData.isEnabled,
        scope: promoFormData.scope,
        applicableCategories: promoFormData.applicableCategories,
        applicableProducts: promoFormData.applicableProducts,
        usageLimit: promoFormData.usageLimit ? Number(promoFormData.usageLimit) : null,
      };

      if (promoFormData._id) {
        await axiosClient.put(`/api/promo-codes/${promoFormData._id}`, payload);
        showToast("تم تحديث كود الخصم بنجاح 🎉", "success");
      } else {
        await axiosClient.post("/api/promo-codes", payload);
        showToast("تم إضافة كود الخصم الجديد بنجاح 🚀", "success");
      }

      setShowPromoModal(false);
      fetchAllData();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "حدث خطأ أثناء حفظ كود الخصم";
      showToast(msg, "error");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("هل أنت تأكد من رغبتك في حذف كود الخصم هذا؟")) return;
    try {
      await axiosClient.delete(`/api/promo-codes/${id}`);
      showToast("تم حذف كود الخصم بنجاح", "success");
      fetchAllData();
    } catch (error) {
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  const togglePromoStatus = async (promo) => {
    try {
      await axiosClient.put(`/api/promo-codes/${promo._id || promo.id}`, {
        isEnabled: !promo.isEnabled,
      });
      showToast(promo.isEnabled ? "تم إيقاف كود الخصم" : "تم تفعيل كود الخصم", "info");
      fetchAllData();
    } catch (error) {
      showToast("حدث خطأ أثناء تغيير الحالة", "error");
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
            <span className="text-primary-400 font-semibold">مركز العروض وأكواد الخصم</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <ClockIcon className="h-8 w-8 text-primary-400" />
            إدارة العروض التنازلية وأكواد الخصم
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

      {/* Main Tabs Header */}
      <div className="flex border-b border-white/10 mb-8 gap-4">
        <button
          onClick={() => setActiveTab("campaign")}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "campaign"
              ? "border-primary-500 text-primary-400"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <span>🔥</span> حملات العروض والتخفيضات التنازلية
        </button>

        <button
          onClick={() => setActiveTab("promoCodes")}
          className={`pb-3 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "promoCodes"
              ? "border-primary-500 text-primary-400"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <span>🏷️</span> إدارة أكواد الخصم ({promoCodes.length})
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center text-white/70 animate-pulse">
          جاري تحميل الإعدادات والمنتجات والأكواد...
        </div>
      ) : activeTab === "campaign" ? (
        /* TAB 1: CAMPAIGN CONFIG & SCOPE */
        <form onSubmit={handleSubmitCampaign} className="space-y-8">
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
                <label className="mb-2 block text-xs font-semibold text-white/80">تاريخ ووقت انتهاء العرض (مدة العرض)</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={handleChange("endDate")}
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/90 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Badge Text */}
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

              <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white">نطاق تطبيق التخفيض التنازلي</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    onClick={() => setFormData((prev) => ({ ...prev, scope: "global" }))}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition select-none ${
                      formData.scope === "global"
                        ? "bg-primary-950/60 border-primary-500 text-white font-bold"
                        : "bg-neutral-900/60 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-lg mb-1">🌐</span>
                    <span className="text-xs block">تطبيق عام (Global)</span>
                    <span className="text-[10px] block opacity-60">كافة منتجات الخصومات</span>
                  </label>

                  <label
                    onClick={() => setFormData((prev) => ({ ...prev, scope: "categories" }))}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition select-none ${
                      formData.scope === "categories"
                        ? "bg-primary-950/60 border-primary-500 text-white font-bold"
                        : "bg-neutral-900/60 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-lg mb-1">📁</span>
                    <span className="text-xs block">أقسام معينة</span>
                    <span className="text-[10px] block opacity-60">تطبيق على أقسام كاملة</span>
                  </label>

                  <label
                    onClick={() => setFormData((prev) => ({ ...prev, scope: "selective" }))}
                    className={`p-3 rounded-2xl border text-center cursor-pointer transition select-none ${
                      formData.scope === "selective"
                        ? "bg-primary-950/60 border-primary-500 text-white font-bold"
                        : "bg-neutral-900/60 border-white/10 text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="block text-lg mb-1">🎯</span>
                    <span className="text-xs block">منتجات محددة</span>
                    <span className="text-[10px] block opacity-60">اختيار فردي بالمنتج</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Scope Category / Product Selection Block */}
          {formData.scope === "categories" && (
            <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📁 اختر الأقسام المشمولة بالتخفيض التنازلي
              </h3>
              <div className="flex flex-wrap gap-3">
                {allCategories.map((cat) => {
                  const catName = typeof cat === "string" ? cat : cat.name;
                  const isChecked = selectedCategories.includes(catName);

                  return (
                    <button
                      type="button"
                      key={catName}
                      onClick={() => toggleCategorySelect(catName)}
                      className={`px-4 py-2 rounded-2xl border text-xs font-semibold transition ${
                        isChecked
                          ? "bg-primary-600 text-white border-primary-400 shadow-lg"
                          : "bg-neutral-800/80 text-white/70 border-white/10 hover:border-white/30"
                      }`}
                    >
                      {isChecked ? "✓ " : "+ "}
                      {catName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {formData.scope === "selective" && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span>🎯</span> اختيار المنتجات المشمولة بالعرض
                  </h2>
                  <p className="text-xs text-white/60">
                    حدد المنتجات التي تريد إظهار تخفيضها وتضمينها في العرض التنازلي.
                  </p>
                </div>

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
                    onClick={handleSelectAllProducts}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    تحديد الكل ({allProducts.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllProducts}
                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition"
                  >
                    إلغاء تحديد الكل
                  </button>
                </div>
              </div>

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

              <div className="max-h-96 overflow-y-auto pr-1 space-y-2 border border-white/10 rounded-2xl p-3 bg-black/20">
                {filteredProducts.map((product) => {
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
                })}
              </div>
            </div>
          )}

          {/* Submit Campaign Settings Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-primary-600 via-pink-600 to-amber-500 py-4 text-base font-extrabold text-white shadow-2xl hover:opacity-95 transition disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات ونشر العرض التنازلي 🚀"}
          </button>
        </form>
      ) : (
        /* TAB 2: PROMO CODES MANAGEMENT */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/10">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>🏷️</span> إدارة أكواد الخصومات (Promotional Codes)
              </h2>
              <p className="text-xs text-white/60">
                يمكنك إنشاء أكواد خصم متعددة وتحديد مدتها ونسبة الخصم أو قيمته المباشرة ونطاق تطبيقها.
              </p>
            </div>

            <button
              onClick={handleOpenNewPromoModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-600 text-xs font-bold text-white shadow-lg hover:opacity-90 transition whitespace-nowrap self-start sm:self-auto"
            >
              + إنشاء كود خصم جديد
            </button>
          </div>

          {/* Promo Codes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promoCodes.length === 0 ? (
              <div className="col-span-full glass-card p-12 text-center text-white/50 rounded-3xl">
                لا توجد أكواد خصم حالية. انقر فوق زر "+ إنشاء كود خصم جديد" لإضافة أول كود خصم!
              </div>
            ) : (
              promoCodes.map((promo) => {
                const now = new Date();
                const isExpired = promo.endDate && now > new Date(promo.endDate);
                const isNotStarted = promo.startDate && now < new Date(promo.startDate);

                return (
                  <div
                    key={promo._id || promo.id}
                    className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 bg-neutral-900/80 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-xl border border-amber-500/30">
                          {promo.code}
                        </span>
                        {promo.isEnabled && !isExpired && !isNotStarted && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            نشط الآن ✓
                          </span>
                        )}
                        {isExpired && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            منتهي الصلاحية ⌛
                          </span>
                        )}
                        {!promo.isEnabled && !isExpired && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white/50">
                            معطل
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePromoStatus(promo)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            promo.isEnabled
                              ? "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                          }`}
                        >
                          {promo.isEnabled ? "إيقاف" : "تفعيل"}
                        </button>
                        <button
                          onClick={() => handleEditPromoModal(promo)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-300 border border-primary-500/30 hover:bg-primary-500/30 transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo._id || promo.id)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-white/50 block text-[10px]">قيمة الخصم</span>
                        <span className="font-extrabold text-white text-sm">
                          {promo.discountType === "percentage"
                            ? `${promo.discountValue}% خصم`
                            : `${promo.discountValue} د.أ خصم مباشر`}
                        </span>
                      </div>

                      <div>
                        <span className="text-white/50 block text-[10px]">نطاق التطبيق</span>
                        <span className="font-semibold text-white/90">
                          {promo.scope === "global" && "🌐 تطبيق عام (كل السلة)"}
                          {promo.scope === "categories" && `📁 أقسام معينة (${promo.applicableCategories?.length || 0})`}
                          {promo.scope === "products" && `🎯 منتجات محددة (${promo.applicableProducts?.length || 0})`}
                        </span>
                      </div>

                      <div>
                        <span className="text-white/50 block text-[10px]">فترة الصلاحية (Duration)</span>
                        <span className="text-white/80 text-[11px]">
                          حتى {new Date(promo.endDate).toLocaleDateString("ar-JO")}
                        </span>
                      </div>

                      <div>
                        <span className="text-white/50 block text-[10px]">عدد الاستخدامات</span>
                        <span className="text-white/80 text-[11px]">
                          {promo.usageCount || 0} {promo.usageLimit ? `/ ${promo.usageLimit}` : "مرة (غير محدود)"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROMO CODE MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-900 p-6 md:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🏷️</span> {promoFormData._id ? "تعديل كود الخصم" : "إضافة كود خصم جديد"}
              </h2>
              <button
                onClick={() => setShowPromoModal(false)}
                className="rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              {/* Promo Code Input */}
              <div>
                <label className="mb-1.5 block font-semibold text-white/80">رمز كود الخصم</label>
                <input
                  type="text"
                  required
                  value={promoFormData.code}
                  onChange={(e) => setPromoFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="مثال: SUMMER20"
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm font-mono text-amber-300 focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-semibold text-white/80">نوع الخصم</label>
                  <select
                    value={promoFormData.discountType}
                    onChange={(e) => setPromoFormData((prev) => ({ ...prev, discountType: e.target.value }))}
                    className="w-full rounded-2xl border border-white/20 bg-neutral-800 px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="percentage">٪ نسبة مئوية (Percentage)</option>
                    <option value="fixed">💰 مبلغ ثابت (Direct Value)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block font-semibold text-white/80">
                    قيمة الخصم {promoFormData.discountType === "percentage" ? "(٪)" : "(د.أ)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="0.1"
                    step="any"
                    value={promoFormData.discountValue}
                    onChange={(e) => setPromoFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                    placeholder={promoFormData.discountType === "percentage" ? "مثال: 20" : "مثال: 5"}
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                </div>
              </div>

              {/* Duration: Start & End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-semibold text-white/80">تاريخ بداية الصلاحية</label>
                  <input
                    type="datetime-local"
                    value={promoFormData.startDate}
                    onChange={(e) => setPromoFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-2xl border border-white/20 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-semibold text-white/80">تاريخ الانتهاء (Duration)</label>
                  <input
                    type="datetime-local"
                    required
                    value={promoFormData.endDate}
                    onChange={(e) => setPromoFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-2xl border border-white/20 bg-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="mb-1.5 block font-semibold text-white/80">نطاق تطبيق الخصم</label>
                <select
                  value={promoFormData.scope}
                  onChange={(e) => setPromoFormData((prev) => ({ ...prev, scope: e.target.value }))}
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800 px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="global">🌐 تطبيق عام (كامل المنتجات والسلة)</option>
                  <option value="categories">📁 تطبيق على أقسام محددة فقط</option>
                  <option value="products">🎯 تطبيق على منتجات محددة فقط</option>
                </select>
              </div>

              {/* Scope Categories Checklist */}
              {promoFormData.scope === "categories" && (
                <div className="p-3 rounded-2xl border border-white/10 bg-black/30 space-y-2">
                  <label className="block font-semibold text-white/80">اختر الأقسام المشمولة بهذا الكود:</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allCategories.map((cat) => {
                      const catName = typeof cat === "string" ? cat : cat.name;
                      const isSelected = promoFormData.applicableCategories.includes(catName);

                      return (
                        <button
                          type="button"
                          key={catName}
                          onClick={() =>
                            setPromoFormData((prev) => ({
                              ...prev,
                              applicableCategories: isSelected
                                ? prev.applicableCategories.filter((c) => c !== catName)
                                : [...prev.applicableCategories, catName],
                            }))
                          }
                          className={`px-3 py-1 rounded-xl border text-[11px] transition ${
                            isSelected
                              ? "bg-primary-600 text-white border-primary-400"
                              : "bg-neutral-800 text-white/60 border-white/10 hover:border-white/30"
                          }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {catName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scope Products Checklist */}
              {promoFormData.scope === "products" && (
                <div className="p-3.5 rounded-2xl border border-white/10 bg-black/30 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block font-semibold text-white/80">اختر المنتجات المشمولة بهذا الكود:</label>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() =>
                          setPromoFormData((prev) => ({
                            ...prev,
                            applicableProducts: allProducts.map((p) => p._id || p.id),
                          }))
                        }
                        className="px-2 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPromoFormData((prev) => ({
                            ...prev,
                            applicableProducts: [],
                          }))
                        }
                        className="px-2 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition"
                      >
                        إلغاء الكل
                      </button>
                    </div>
                  </div>

                  <span className="text-[10px] text-white/50 block">
                    تم تحديد {promoFormData.applicableProducts?.length || 0} من {allProducts.length} منتج
                  </span>

                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {allProducts.map((prod) => {
                      const pId = prod._id || prod.id;
                      const isSelected = promoFormData.applicableProducts.includes(pId);

                      return (
                        <div
                          key={pId}
                          onClick={() =>
                            setPromoFormData((prev) => ({
                              ...prev,
                              applicableProducts: isSelected
                                ? prev.applicableProducts.filter((id) => id !== pId)
                                : [...prev.applicableProducts, pId],
                            }))
                          }
                          className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer text-[11px] transition ${
                            isSelected
                              ? "bg-primary-950/60 border-primary-500/60 text-white font-bold"
                              : "bg-neutral-800/60 border-white/5 text-white/70 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="h-3.5 w-3.5 rounded border-white/30 bg-neutral-800 text-primary-600 focus:ring-primary-500"
                            />
                            <span>{prod.name}</span>
                          </div>
                          <span className="text-[10px] text-primary-400 font-mono">{prod.price} د.أ</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enabled & Usage Limit */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="mb-1.5 block font-semibold text-white/80">الحد الأقصى للاستخدام (اختياري)</label>
                  <input
                    type="number"
                    min="1"
                    value={promoFormData.usageLimit}
                    onChange={(e) => setPromoFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                    placeholder="مثال: 100 (اتركه فارغاً لإلغاء حد الاستخدام)"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-6">
                  <span className="font-semibold text-white/80">تفعيل كود الخصم الآن</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={promoFormData.isEnabled}
                      onChange={(e) => setPromoFormData((prev) => ({ ...prev, isEnabled: e.target.checked }))}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-white/10 peer-checked:bg-primary-600 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>

              {/* Submit Modal Button */}
              <button
                type="submit"
                disabled={savingPromo}
                className="w-full mt-4 rounded-2xl bg-gradient-to-r from-primary-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-xl hover:opacity-90 transition disabled:opacity-50"
              >
                {savingPromo ? "جاري الحفظ..." : "حفظ وحفظ كود الخصم 🚀"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffersConfig;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import ProductConfigBuilder from "../components/ProductConfigBuilder.jsx";
import {
  BoxIcon,
  PlusIcon,
  SearchIcon,
  SparkleIcon,
  CloseIcon,
  FilterIcon,
} from "../components/icons.jsx";

const defaultValues = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  discountTag: "",
  category: "",
  productCollection: "",
  sizes: "",
  colors: "",
  inStock: true,
  configurable: false,
  pieces: [],
};

const fallbackCategories = [
  "عباءات",
  "ادناءات",
  "نقابات",
  "سبورات شرعية",
  "حقائب",
];

const fallbackCollections = [
  "الكوليكشن الصيفي",
  "الكوليكشن الخريفي",
  "الكوليكشن الشتوي",
  "الكوليكشن الربيعي",
];

const normalizeImages = (images, fallbackImage) => {
  const normalized = Array.isArray(images)
    ? images.map((image) => (typeof image === "string" ? image : image?.url)).filter(Boolean)
    : [];

  if (!normalized.length && fallbackImage) {
    normalized.push(fallbackImage);
  }

  return normalized;
};

const AdminProducts = () => {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ ...defaultValues });

  // Form Tabs State
  const [activeFormTab, setActiveFormTab] = useState("basic"); // 'basic' | 'variants' | 'configurator'

  // Mobile View Switch
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'form'

  // Search & Filter for Product List
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  // Bulk Selection State
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  const [categories, setCategories] = useState(fallbackCategories);
  const [collections, setCollections] = useState(fallbackCollections);
  const [colorGuides, setColorGuides] = useState([]);

  const loadCategories = async () => {
    try {
      const { data } = await axiosClient.get("/api/categories");
      if (Array.isArray(data) && data.length > 0) {
        const catNames = data.filter((c) => c.type === "category").map((c) => c.name);
        const colNames = data.filter((c) => c.type === "collection").map((c) => c.name);
        if (catNames.length) setCategories(catNames);
        if (colNames.length) setCollections(colNames);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadColorGuides = async () => {
    try {
      const { data } = await axiosClient.get("/api/colors");
      if (Array.isArray(data)) {
        setColorGuides(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/products", { params: { limit: 100, raw: true } });
      setProducts(data.data || []);
      setSelectedProductIds([]);
    } catch (error) {
      showToast("تعذر تحميل المنتجات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadColorGuides();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleColor = (colorName) => {
    const currentColors = formData.colors
      ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean)
      : [];
    let updated;
    if (currentColors.includes(colorName)) {
      updated = currentColors.filter((c) => c !== colorName);
    } else {
      updated = [...currentColors, colorName];
    }
    setFormData((prev) => ({ ...prev, colors: updated.join(", ") }));
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: Number(formData.price) || 0,
    originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
    discountTag: formData.discountTag.trim(),
    category: formData.category.trim(),
    productCollection: formData.productCollection.trim(),
    inStock: formData.inStock,
    sizes: formData.sizes
      ? formData.sizes
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
    colors: formData.colors
      ? formData.colors
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      : [],
    images: uploadedImages,
    configurable: formData.configurable,
    pieces: formData.configurable ? formData.pieces : [],
  });

  const resetForm = () => {
    setEditingProduct(null);
    setSelectedFiles([]);
    setUploadedImages([]);
    setFormData({ ...defaultValues });
    setActiveFormTab("basic");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildPayload();

    if (!payload.name || payload.price === undefined || payload.price === null || isNaN(payload.price)) {
      showToast("يرجى تعبئة اسم المنتج وسعره بالشكل الصحيح", "error");
      return;
    }

    try {
      if (editingProduct) {
        await axiosClient.put(`/api/products/${editingProduct._id || editingProduct.id}`, payload);
        showToast("تم تحديث المنتج بنجاح", "success");
      } else {
        await axiosClient.post("/api/products", payload);
        showToast("تم إنشاء المنتج بنجاح", "success");
      }
      resetForm();
      loadProducts();
      setMobileView("list");
    } catch (error) {
      showToast("تعذر حفظ المنتج، يرجى المحاولة لاحقاً", "error");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const existingImages = normalizeImages(product.images, product.image);
    setUploadedImages(existingImages);
    setSelectedFiles([]);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      originalPrice: product.originalPrice?.toString() || "",
      discountTag: product.discountTag || "",
      category: product.category || "",
      productCollection: product.productCollection || "",
      inStock: product.inStock !== false,
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      configurable: product.configurable || false,
      pieces: product.pieces || [],
    });
    setMobileView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً؟")) return;
    try {
      await axiosClient.delete(`/api/products/${id}`);
      showToast("تم حذف المنتج بنجاح", "info");
      loadProducts();
    } catch (error) {
      showToast("تعذر حذف المنتج", "error");
    }
  };

  const toggleQuickInStock = async (product, e) => {
    e.stopPropagation();
    const prodId = product._id || product.id;
    const nextStatus = !product.inStock;
    try {
      await axiosClient.put(`/api/products/${prodId}`, { inStock: nextStatus });
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === prodId ? { ...p, inStock: nextStatus } : p))
      );
      showToast(`تم ${nextStatus ? "تفعيل توفر" : "إيقاف توفر"} المنتج`, "success");
    } catch (err) {
      showToast("فشل تحديث حالة التوفر", "error");
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p._id || p.id));
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, inStockVal = true) => {
    if (selectedProductIds.length === 0) return;
    if (action === "delete" && !window.confirm(`هل أنت متأكد من حذف ${selectedProductIds.length} منتج؟`)) return;

    try {
      await axiosClient.post("/api/products/bulk", {
        productIds: selectedProductIds,
        action,
        inStock: inStockVal,
      });
      showToast(`تم تنفيذ الإجراء على ${selectedProductIds.length} منتج بنجاح`, "success");
      loadProducts();
    } catch (error) {
      showToast("فشل تنفيذ الإجراء الجماعي", "error");
    }
  };

  // Drag-and-Drop Image Uploader
  const handleDropImages = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
      setSelectedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const handleUploadImages = async () => {
    if (!selectedFiles.length) return;
    const uploadData = new FormData();
    selectedFiles.forEach((file) => uploadData.append("images", file));
    setUploading(true);
    try {
      const { data } = await axiosClient.post("/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (Array.isArray(data.urls)) {
        setUploadedImages((prev) => [...prev, ...data.urls]);
        showToast("تم رفع الصور بنجاح", "success");
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      showToast("فشل رفع الصور", "error");
    } finally {
      setUploading(false);
      setSelectedFiles([]);
    }
  };

  const removeImage = (url) => {
    setUploadedImages((prev) => prev.filter((image) => image !== url));
  };

  const setAsCover = (index) => {
    if (index === 0) return;
    setUploadedImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
  };

  const reorderImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= uploadedImages.length) return;
    setUploadedImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = productSearch === "" || p.name?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === "" || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <BoxIcon className="h-7 w-7 text-secondary-400" />
            <span>إدارة المنتجات والمخزون</span>
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1">
            إضافة وتعديل المنتجات، خيارات التفصيل والتخصيص، وتحديد الأسعار والخصومات
          </p>
        </div>

        {/* Mobile Screen Tab Switcher */}
        <div className="lg:hidden flex rounded-2xl bg-white/5 border border-white/10 p-1">
          <button
            onClick={() => setMobileView("list")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mobileView === "list" ? "bg-primary-600 text-white shadow" : "text-white/60 hover:text-white"
            }`}
          >
            قائمة المنتجات ({products.length})
          </button>
          <button
            onClick={() => setMobileView("form")}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              mobileView === "form" ? "bg-primary-600 text-white shadow" : "text-white/60 hover:text-white"
            }`}
          >
            {editingProduct ? "✏️ تعديل المنتج" : "➕ إضافة منتج"}
          </button>
        </div>
      </div>

      {/* ─── Main Grid: Form (Left) & Products List (Right) ─── */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr,1.3fr]">
        {/* ─── PRODUCT FORM (Tabbed & Structured) ─── */}
        <section
          className={`rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <SparkleIcon className="h-5 w-5 text-primary-400" />
              <span>{editingProduct ? "تعديل بيانات المنتج" : "إضافة منتج جديد للمتجر"}</span>
            </h2>
            {editingProduct && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-rose-300 font-bold hover:underline"
              >
                إلغاء التعديل ✕
              </button>
            )}
          </div>

          {/* Form Tabs Navigator */}
          <div className="flex rounded-2xl bg-white/5 p-1 my-5 border border-white/10">
            <button
              type="button"
              onClick={() => setActiveFormTab("basic")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                activeFormTab === "basic"
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              1. الأساسيات والوسائط
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("variants")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                activeFormTab === "variants"
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              2. الألوان والمقاسات
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab("configurator")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                activeFormTab === "configurator"
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow"
                  : "text-white/60 hover:text-white"
              }`}
            >
              3. نظام التفصيل {formData.configurable && "✨"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* TAB 1: BASIC INFO & MEDIA */}
            {activeFormTab === "basic" && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-white/70">اسم المنتج *</label>
                  <input
                    value={formData.name}
                    onChange={handleChange("name")}
                    required
                    placeholder="مثال: عباءة البيلسان الملكية الفاخرة"
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-white/70">السعر النهائي (د.أ) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.price}
                      onChange={handleChange("price")}
                      required
                      placeholder="مثال: 35.00"
                      className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white font-mono focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-amber-300">السعر قبل الخصم (اختياري)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.originalPrice}
                      onChange={handleChange("originalPrice")}
                      placeholder="مثال: 45.00"
                      className="w-full rounded-2xl border border-amber-500/20 bg-neutral-950/60 px-4 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-white/70">التصنيف الرئيسي *</label>
                    <select
                      value={formData.category}
                      onChange={handleChange("category")}
                      className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">اختر التصنيف...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-white/70">المجموعة / الكوليكشن</label>
                    <select
                      value={formData.productCollection}
                      onChange={handleChange("productCollection")}
                      className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">اختر المجموعة...</option>
                      {collections.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-pink-300">شارة الخصم أو الترويج (Badge)</label>
                  <input
                    type="text"
                    value={formData.discountTag}
                    onChange={handleChange("discountTag")}
                    placeholder="مثال: الأكثر مبيعاً ⭐ أو خصم 20%"
                    className="w-full rounded-2xl border border-pink-500/20 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-pink-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-white/70">وصف المنتج</label>
                  <textarea
                    value={formData.description}
                    onChange={handleChange("description")}
                    rows={3}
                    placeholder="وصف وتفاصيل القماش والقصة..."
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {/* Stock Toggle */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={handleChange("inStock")}
                    className="h-4 w-4 rounded border-white/20 bg-neutral-800 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="inStock" className="text-xs font-bold text-white cursor-pointer">
                    متوفر بالمخزون ومتاح للطلب الفوري
                  </label>
                </div>

                {/* Drag-and-Drop Image Uploader */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-white/70">صور المنتج (اسحب وأفلت)</label>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropImages}
                    className="rounded-2xl border-2 border-dashed border-white/20 bg-neutral-950/40 p-5 text-center transition hover:border-primary-500/50"
                  >
                    <input
                      type="file"
                      id="imageFileInput"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const filesArr = Array.from(e.target.files);
                          setSelectedFiles((prev) => [...prev, ...filesArr]);
                        }
                      }}
                    />
                    <label htmlFor="imageFileInput" className="cursor-pointer space-y-1 block">
                      <p className="text-xs font-bold text-primary-300">اضغط لاختيار صور من جهازك أو اسحبها هنا</p>
                      <p className="text-[10px] text-white/40">PNG, JPG, WEBP مدعومة</p>
                    </label>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="flex items-center justify-between rounded-xl bg-purple-950/60 border border-purple-500/30 p-2.5">
                      <span className="text-xs text-purple-200 font-semibold">
                        تم اختيار ({selectedFiles.length}) ملفات جاهزة للرفع
                      </span>
                      <button
                        type="button"
                        onClick={handleUploadImages}
                        disabled={uploading}
                        className="rounded-xl bg-purple-600 px-3 py-1 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50"
                      >
                        {uploading ? "جارٍ الرفع..." : "رفع الصور الآن ⬆"}
                      </button>
                    </div>
                  )}

                  {/* Uploaded Images Gallery & Cover Selector */}
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {uploadedImages.map((imageUrl, idx) => {
                        const isCover = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden border p-1 group transition ${
                              isCover ? "border-amber-400 bg-amber-950/20 ring-2 ring-amber-400/30" : "border-white/10 bg-white/5"
                            }`}
                          >
                            <img src={imageUrl} alt="" className="h-16 w-16 object-cover rounded-lg" />
                            {isCover ? (
                              <span className="absolute bottom-1 right-1 rounded bg-amber-500 text-black text-[9px] font-black px-1">
                                غلاف
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setAsCover(idx)}
                                className="absolute bottom-1 right-1 rounded bg-black/80 text-amber-300 text-[9px] font-bold px-1 hover:bg-amber-500 hover:text-black"
                              >
                                غلاف
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(imageUrl)}
                              className="absolute top-1 left-1 rounded bg-black/80 text-rose-400 text-[10px] px-1 hover:bg-rose-600 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: VARIANTS (COLORS & SIZES) */}
            {activeFormTab === "variants" && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-white/70">
                    المقاسات المتوفرة (مفصولة بفاصلة)
                  </label>
                  <input
                    value={formData.sizes}
                    onChange={handleChange("sizes")}
                    placeholder="مثال: 50, 52, 54, 56, 58, 60 أو S, M, L, XL"
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">اكتب المقاسات مفصولة بفواصل عادية (,)</span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-white/70">
                    الألوان المتاحة (نصياً أو اضغط على الدليل أدناه)
                  </label>
                  <input
                    value={formData.colors}
                    onChange={handleChange("colors")}
                    placeholder="مثال: أسود ملكي, كحلي, زيتي, بيج"
                    className="w-full rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:outline-none mb-3"
                  />

                  {/* Interactive Color Guide Chips */}
                  {colorGuides.length > 0 && (
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2">
                      <span className="text-[11px] font-bold text-white/60 block">
                        🎨 دليل الألوان الجاهز (اضغط للإضافة السريعة):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {colorGuides.map((guide) => {
                          const isSelected = (formData.colors || "").includes(guide.name);
                          return (
                            <button
                              key={guide._id || guide.id}
                              type="button"
                              onClick={() => toggleColor(guide.name)}
                              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold border transition ${
                                isSelected
                                  ? "border-primary-400 bg-primary-600 text-white shadow"
                                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span
                                className="h-3 w-3 rounded-full border border-white/30"
                                style={{ backgroundColor: guide.hex || "#333" }}
                              />
                              <span>{guide.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CONFIGURATOR (PIECES & TREE) */}
            {activeFormTab === "configurator" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between rounded-2xl bg-primary-950/40 border border-primary-500/30 p-4">
                  <div>
                    <h3 className="text-xs font-black text-white">تفعيل نظام التفصيل المرن لهذا المنتج</h3>
                    <p className="text-[11px] text-white/60">يتيح للزبونة تخصيص القطع والإضافات واختيار المقاس لكل قطعة</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.configurable}
                    onChange={(e) => setFormData((p) => ({ ...p, configurable: e.target.checked }))}
                    className="h-5 w-5 rounded border-white/20 bg-neutral-800 text-primary-600 cursor-pointer"
                  />
                </div>

                {formData.configurable && (
                  <ProductConfigBuilder
                    pieces={formData.pieces}
                    colorGuides={colorGuides}
                    onChange={(newPieces) => setFormData((p) => ({ ...p, pieces: newPieces }))}
                  />
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600 py-3 text-xs font-bold text-white shadow-xl shadow-primary-950/50 hover:scale-[1.01] active:scale-[0.99] transition"
              >
                {editingProduct ? "حفظ وتحديث المنتج ✓" : "إنشاء ونشر المنتج 🚀"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/80 hover:bg-white/10"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </section>

        {/* ─── PRODUCTS LISTING (Right Column) ─── */}
        <section
          className={`rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between ${
            mobileView === "form" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="space-y-4">
            {/* List Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <BoxIcon className="h-5 w-5 text-secondary-400" />
                <span>المنتجات المسجلة ({filteredProducts.length})</span>
              </h2>

              <button
                onClick={toggleSelectAll}
                className="text-xs font-bold text-primary-300 hover:underline"
              >
                {selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0
                  ? "إلغاء التحديد"
                  : "تحديد الكل"}
              </button>
            </div>

            {/* Search and Category Filter for Products */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                <input
                  type="search"
                  placeholder="بحث في المنتجات..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950/60 pr-9 pl-3 py-2 text-xs text-white placeholder-white/40 focus:border-primary-500 focus:outline-none"
                />
              </div>

              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="rounded-xl border border-white/10 bg-neutral-950/60 px-3 py-2 text-xs text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="">كل التصنيفات</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions Banner */}
            {selectedProductIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-purple-950/80 border border-purple-400/30 p-2.5 animate-fadeIn">
                <span className="text-xs font-bold text-white">({selectedProductIds.length}) محدد:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleBulkAction("updateStock", true)}
                    className="rounded-lg bg-emerald-600/80 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500"
                  >
                    متوفر ✓
                  </button>
                  <button
                    onClick={() => handleBulkAction("updateStock", false)}
                    className="rounded-lg bg-amber-600/80 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-500"
                  >
                    غير متوفر ✕
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="rounded-lg bg-rose-600/80 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-500"
                  >
                    حذف
                  </button>
                </div>
              </div>
            )}

            {/* Products Scrollable List */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40">لا توجد منتجات مطابقة للبحث.</div>
            ) : (
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {filteredProducts.map((product) => {
                  const prodId = product._id || product.id;
                  const isSelected = selectedProductIds.includes(prodId);
                  const coverImage = normalizeImages(product.images, product.image)[0];

                  return (
                    <div
                      key={prodId}
                      className={`rounded-2xl border p-3 transition flex items-center justify-between gap-3 group ${
                        isSelected
                          ? "border-primary-500 bg-primary-950/30"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(prodId)}
                          className="h-4 w-4 rounded border-white/20 bg-neutral-800 text-primary-600 cursor-pointer"
                        />

                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-neutral-800 shrink-0 border border-white/10">
                          {coverImage ? (
                            <img src={coverImage} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-white/40">
                              بدون صورة
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-[180px]">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-emerald-400 font-mono">{product.price} د.أ</span>
                            <button
                              type="button"
                              onClick={(e) => toggleQuickInStock(product, e)}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border transition ${
                                product.inStock === false
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                              }`}
                              title="اضغط للتبديل السريع لحالة التوفر"
                            >
                              {product.inStock === false ? "غير متوفر ✕" : "متوفر ✓"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/15 transition"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prodId)}
                          className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 text-center text-xs text-white/40">
            متجر البيلسان • إدارة الكتالوج والمخزون
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminProducts;

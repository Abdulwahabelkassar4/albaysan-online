import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

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
      const { data } = await axiosClient.get("/api/products", { params: { limit: 100 } });
      setProducts(data.data || []);
      setSelectedProductIds([]);
    } catch (error) {
      showToast(t("adminProductsPage.toast.loadError"), "error");
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
  });

  const resetForm = () => {
    setEditingProduct(null);
    setSelectedFiles([]);
    setUploadedImages([]);
    setFormData({ ...defaultValues });
  };

  const saveProduct = async () => {
    const payload = buildPayload();
    try {
      if (editingProduct?._id || editingProduct?.id) {
        const prodId = editingProduct._id || editingProduct.id;
        await axiosClient.put(`/api/products/${prodId}`, payload);
        showToast(t("adminProductsPage.toast.updateSuccess"), "success");
      } else {
        await axiosClient.post("/api/products", payload);
        showToast(t("adminProductsPage.toast.createSuccess"), "success");
      }
      resetForm();
      loadProducts();
    } catch (error) {
      showToast(
        editingProduct ? t("adminProductsPage.toast.updateError") : t("adminProductsPage.toast.createError"),
        "error"
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.category || !formData.productCollection) {
      showToast(t("adminProductsPage.validation.categoryCollection"), "error");
      return;
    }
    await saveProduct();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setSelectedFiles([]);
    setUploadedImages(product.images || []);
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
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("adminProductsPage.confirmDelete"))) return;
    try {
      await axiosClient.delete(`/api/products/${id}`);
      showToast(t("adminProductsPage.toast.deleteSuccess"), "info");
      loadProducts();
    } catch (error) {
      showToast(t("adminProductsPage.toast.deleteError"), "error");
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map((p) => p._id || p.id));
    }
  };

  const toggleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (action, inStockVal = true) => {
    if (selectedProductIds.length === 0) return;
    if (action === "delete" && !window.confirm(`هل أنت تأكد من حذف ${selectedProductIds.length} منتج؟`)) return;

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
        showToast(t("adminProductsPage.toast.uploadSuccess"), "success");
      } else {
        throw new Error("Invalid upload response");
      }
    } catch (error) {
      showToast(t("adminProductsPage.toast.uploadError"), "error");
    } finally {
      setUploading(false);
      setSelectedFiles([]);
    }
  };

  const removeImage = (url) => {
    setUploadedImages((prev) => prev.filter((image) => image !== url));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 rounded-2xl border border-secondary-400/40 bg-secondary-500/20 px-4 py-2 text-sm font-semibold text-secondary-200 hover:bg-secondary-500/30"
          >
            ⚙️ إدارة الفئات والمجموعات
          </Link>
          <Link
            to="/admin/colors"
            className="inline-flex items-center gap-2 rounded-2xl border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/30"
          >
            🎨 دليل مرجعية الألوان
          </Link>
        </div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {isRTL ? `${t("adminProductsPage.backToDashboard")} →` : `← ${t("adminProductsPage.backToDashboard")}`}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr,1.3fr]">
        {/* Product Form */}
        <section className={`glass-card p-8 rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-2xl font-bold text-white">
            {editingProduct ? t("adminProductsPage.editTitle") : t("adminProductsPage.createTitle")}
          </h2>
          
          <form className={`mt-6 grid gap-5 ${isRTL ? "text-right" : "text-left"}`} onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.name")}</label>
              <input
                value={formData.name}
                onChange={handleChange("name")}
                required
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Price & Original Price */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.price")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.price}
                  onChange={handleChange("price")}
                  required
                  placeholder="مثال: 35"
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-amber-200 font-medium">السعر قبل الخصم (اختياري)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.originalPrice}
                  onChange={handleChange("originalPrice")}
                  placeholder="مثال: 45"
                  className="w-full rounded-2xl border border-amber-400/30 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>

            {/* Discount Tag */}
            <div>
              <label className="mb-2 block text-sm text-pink-200 font-medium">تاغ العرض / الخصم</label>
              <input
                type="text"
                value={formData.discountTag}
                onChange={handleChange("discountTag")}
                placeholder="تاغ العرض الترويجي (مثال: خصم 20%)"
                className="w-full rounded-2xl border border-pink-400/30 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>

            {/* Category & Collection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.category")}</label>
                <select
                  value={formData.category}
                  onChange={handleChange("category")}
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t("adminProductsPage.form.categoryPlaceholder")}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.collection")}</label>
                <select
                  value={formData.productCollection}
                  onChange={handleChange("productCollection")}
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t("adminProductsPage.form.collectionPlaceholder")}</option>
                  {collections.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock Availability Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
                onChange={handleChange("inStock")}
                className="h-5 w-5 rounded border-white/20 bg-neutral-800 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="inStock" className="text-sm font-semibold text-white">
                متوفر في المخزون حالياً
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.description")}</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={handleChange("description")}
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.sizes")}</label>
                <input
                  value={formData.sizes}
                  onChange={handleChange("sizes")}
                  placeholder="S, M, L, XL"
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70 flex items-center justify-between">
                  <span>{t("adminProductsPage.form.colors")} (انقر لاختيار الألوان)</span>
                  <Link to="/admin/colors" className="text-xs text-secondary-300 hover:underline">
                    🎨 مرجعية الألوان
                  </Link>
                </label>

                {/* Interactive Palette Chips Selector */}
                {colorGuides.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/40 p-3 max-h-36 overflow-y-auto">
                    {colorGuides.map((guide) => {
                      const selectedList = formData.colors
                        ? formData.colors.split(",").map((c) => c.trim()).filter(Boolean)
                        : [];
                      const isSelected = selectedList.includes(guide.name);

                      return (
                        <button
                          key={guide._id || guide.name}
                          type="button"
                          onClick={() => toggleColor(guide.name)}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                            isSelected
                              ? "border-secondary-400 bg-secondary-500/30 text-white ring-2 ring-secondary-400/50"
                              : "border-white/20 bg-neutral-800/80 text-white/70 hover:border-white/40 hover:text-white"
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/30 shadow-sm shrink-0"
                            style={{ backgroundColor: guide.hexCode || "#121212" }}
                          />
                          <span>{guide.name}</span>
                          {isSelected && <span className="text-emerald-400">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                <input
                  value={formData.colors}
                  onChange={handleChange("colors")}
                  placeholder="أسود، كحلي، بيج (أو انقر على لوحة الألوان أعلاه)"
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Drag and Drop Image Dropzone */}
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.images")}</label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropImages}
                className="relative border-2 border-dashed border-white/20 hover:border-primary-500 rounded-3xl p-6 text-center bg-neutral-800/50 transition cursor-pointer"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-3xl mb-2">📸</div>
                <p className="text-sm font-semibold text-white">اسحب الصور وأفلتها هنا أو انقر للاختيار</p>
                <p className="text-xs text-white/50 mt-1">تنسيقات مسموحة: JPG, PNG, WEBP</p>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                {selectedFiles.length > 0 && (
                  <p className="text-xs font-medium text-emerald-400">
                    تم اختيار {selectedFiles.length} ملفات جاهزة للرفع
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="rounded-full bg-primary-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-primary-500 disabled:opacity-50"
                >
                  {uploading ? "جاري الرفع..." : t("adminProductsPage.form.uploadImagesButton")}
                </button>
              </div>

              {/* Uploaded Thumbnails */}
              <div className="mt-4 flex flex-wrap gap-3">
                {uploadedImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 group">
                    <img src={imageUrl} alt="product" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(imageUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs font-bold text-rose-300 opacity-0 group-hover:opacity-100 transition"
                    >
                      حذف ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex gap-3 ${isRTL ? "justify-start" : "justify-end"}`}>
              <button type="submit" className="btn-primary">
                {editingProduct ? t("adminProductsPage.form.submitUpdate") : t("adminProductsPage.form.submitCreate")}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/30 px-5 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  {t("adminProductsPage.form.cancelEdit")}
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Products List & Bulk Actions */}
        <section className={`glass-card p-6 rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white">
              قائمة المنتجات ({products.length})
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-primary-400 hover:underline"
              >
                {selectedProductIds.length === products.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
              </button>
            </div>
          </div>

          {/* Bulk Action Bar */}
          {selectedProductIds.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-purple-950/80 border border-purple-400/30 p-3">
              <span className="text-xs font-bold text-white">
                تم تحديد ({selectedProductIds.length}) منتجات:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction("updateStock", true)}
                  className="rounded-xl bg-emerald-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  تعيين كـ متوفر
                </button>
                <button
                  onClick={() => handleBulkAction("updateStock", false)}
                  className="rounded-xl bg-amber-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-500"
                >
                  تعيين كـ غير متوفر
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="rounded-xl bg-rose-600/80 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                >
                  حذف المحدد
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="h-48 animate-pulse bg-white/5 rounded-2xl" />
          ) : (
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {products.map((product) => {
                const prodId = product._id || product.id;
                const isSelected = selectedProductIds.includes(prodId);
                const coverImage = normalizeImages(product.images, product.image)[0];

                return (
                  <div
                    key={prodId}
                    className={`rounded-2xl border p-3 transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-primary-500 bg-primary-950/30"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectProduct(prodId)}
                        className="h-4 w-4 rounded border-white/20 bg-neutral-800 text-primary-600"
                      />
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-neutral-800 shrink-0">
                        {coverImage ? (
                          <img src={coverImage} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-white/40">
                            بدون صورة
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-primary-300 font-bold">{product.price} د.أ</span>
                          {product.inStock === false ? (
                            <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 border border-rose-500/30 font-semibold">
                              غير متوفر ❌
                            </span>
                          ) : (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30 font-semibold">
                              متوفر ✅
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-xl border border-white/20 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(prodId)}
                        className="rounded-xl border border-rose-500/30 px-3 py-1 text-xs text-rose-300 transition hover:bg-rose-500/20"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                );
              })}

              {products.length === 0 && (
                <div className="p-8 text-center text-xs text-white/50">لا يوجد منتجات مسجلة حالياً.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminProducts;

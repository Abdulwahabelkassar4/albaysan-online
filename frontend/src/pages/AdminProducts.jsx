import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

const defaultValues = {
  name: "",
  description: "",
  price: "",
  category: "",
  productCollection: "",
  sizes: "",
  colors: "",
};

const categoryOptions = [
  { value: "عباءات", labelKey: "adminProductsPage.categories.abayas", fallback: "Abayas" },
  { value: "ادناءات", labelKey: "adminProductsPage.categories.idnaas", fallback: "Khima/Idnaas" },
  { value: "نقابات", labelKey: "adminProductsPage.categories.niqabs", fallback: "Niqabs" },
  { value: "سبورات شرعية", labelKey: "adminProductsPage.categories.sports", fallback: "Modest sportswear" },
  { value: "حقائب", labelKey: "adminProductsPage.categories.bags", fallback: "Bags" },
];

const collectionOptions = [
  { value: "الكوليكشن الصيفي", labelKey: "adminProductsPage.collections.summer" },
  { value: "الكوليكشن الخريفي", labelKey: "adminProductsPage.collections.autumn" },
  { value: "الكوليكشن الشتوي", labelKey: "adminProductsPage.collections.winter" },
  { value: "الكوليكشن الربيعي", labelKey: "adminProductsPage.collections.spring" },
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

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/products", { params: { limit: 50 } });
      setProducts(data.data || []);
    } catch (error) {
      showToast(t("adminProductsPage.toast.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    description: formData.description.trim(),
    price: Number(formData.price) || 0,
    category: formData.category.trim(),
    productCollection: formData.productCollection.trim(),
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
      if (editingProduct?._id) {
        await axiosClient.put(`/api/products/${editingProduct._id}`, payload);
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
      category: product.category || "",
      productCollection: product.productCollection || "",
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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className={`mb-6 flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {isRTL ? `${t("adminProductsPage.backToDashboard")} →` : `← ${t("adminProductsPage.backToDashboard")}`}
        </Link>
      </div>
      <div className="glass-card grid gap-8 p-10 lg:grid-cols-[1.2fr,1fr]">
        <section className={isRTL ? "text-right" : "text-left"}>
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
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
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
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.category")}</label>
                <select
                  value={formData.category}
                  onChange={handleChange("category")}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="">{t("adminProductsPage.form.categoryPlaceholder")}</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-black">
                      {t(option.labelKey, { defaultValue: option.fallback })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.collection")}</label>
              <select
                value={formData.productCollection}
                onChange={handleChange("productCollection")}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">{t("adminProductsPage.form.collectionPlaceholder")}</option>
                {collectionOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-black">
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.description")}</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={handleChange("description")}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.sizes")}</label>
                <input
                  value={formData.sizes}
                  onChange={handleChange("sizes")}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.colors")}</label>
                <input
                  value={formData.colors}
                  onChange={handleChange("colors")}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">{t("adminProductsPage.form.images")}</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))}
                disabled={uploading}
                className="w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-white"
              />
              <div className={`mt-3 flex flex-wrap items-center gap-3 ${isRTL ? "justify-end" : "justify-start"}`}>
                {selectedFiles.length > 0 && (
                  <p className="text-sm text-white/70">
                    {t("adminProductsPage.form.selectedImagesCount", { count: selectedFiles.length })}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={selectedFiles.length === 0 || uploading}
                  className="rounded-full border border-white/30 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("adminProductsPage.form.uploadImagesButton")}
                </button>
              </div>
              <div className={`mt-4 flex flex-wrap gap-3 ${isRTL ? "justify-end" : "justify-start"}`}>
                {uploadedImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="relative h-24 w-24 overflow-hidden rounded-2xl">
                    <img src={imageUrl} alt="product" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(imageUrl)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm"
                    >
                      &times;
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
                  className="rounded-full border border-white/30 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  {t("adminProductsPage.form.cancelEdit")}
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={`space-y-4 overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}>
          <h3 className="text-lg font-semibold text-white">{t("adminProductsPage.sections.currentProducts")}</h3>
          {loading ? (
            <div className="glass-card h-32 animate-pulse bg-white/5" />
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const coverImage = normalizeImages(product.images, product.image)[0];
                return (
                  <div
                    key={product._id}
                    className={`glass-card flex items-center justify-between p-4 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className="h-14 w-14 overflow-hidden rounded-2xl">
                        {coverImage ? (
                          <img src={coverImage} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-white/5 text-white/40">
                            {t("adminProductsPage.list.noImage")}
                          </div>
                        )}
                      </div>
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <p className="text-sm font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-white/60">
                          {product.price} {t("adminProductsPage.list.priceSuffix")}
                        </p>
                      </div>
                    </div>
                    <div className={`flex gap-2 text-xs ${isRTL ? "flex-row-reverse" : ""}`}>
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-full border border-white/30 px-3 py-1 text-white/80 transition hover:bg-white/10"
                      >
                        {t("adminProductsPage.list.edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="rounded-full border border-rose-400/40 px-3 py-1 text-rose-200 transition hover:bg-rose-500/20"
                      >
                        {t("adminProductsPage.list.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
              {products.length === 0 && (
                <div className="glass-card p-6 text-center text-white/60">{t("adminProductsPage.list.empty")}</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminProducts;

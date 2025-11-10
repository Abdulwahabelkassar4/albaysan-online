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
  collection: "",
  sizes: "",
  colors: "",
  image: "",
};

const categoryOptions = [
  { value: "عبايات", labelKey: "adminProductsPage.categories.abayas" },
  { value: "نقابات", labelKey: "adminProductsPage.categories.niqabs" },
  { value: "سبورات شرعية", labelKey: "adminProductsPage.categories.sports" },
  { value: "حقائب", labelKey: "adminProductsPage.categories.bags" },
];

const collectionOptions = [
  { value: "الكوليكشن الصيفي", labelKey: "adminProductsPage.collections.summer" },
  { value: "الكوليكشن الخريفي", labelKey: "adminProductsPage.collections.autumn" },
  { value: "الكوليكشن الشتوي", labelKey: "adminProductsPage.collections.winter" },
  { value: "الكوليكشن الربيعي", labelKey: "adminProductsPage.collections.spring" },
];

const AdminProducts = () => {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [images, setImages] = useState([]);
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

  const buildPayload = () => {
    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price) || 0,
      category: formData.category.trim(),
      collection: formData.collection.trim(),
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
      images,
    };
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImages([]);
    setFormData({ ...defaultValues });
  };

  const handleCreate = async () => {
    const payload = buildPayload();
    try {
      await axiosClient.post("/api/products", payload);
      showToast(t("adminProductsPage.toast.createSuccess"), "success");
      resetForm();
      loadProducts();
    } catch (error) {
      showToast(t("adminProductsPage.toast.createError"), "error");
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct?._id) return;
    const payload = buildPayload();
    try {
      await axiosClient.put(`/api/products/${editingProduct._id}`, payload);
      console.log("Product updated", editingProduct._id);
      showToast(t("adminProductsPage.toast.updateSuccess"), "success");
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Update failed", error);
      showToast(t("adminProductsPage.toast.updateError"), "error");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.category || !formData.collection) {
      alert(t("adminProductsPage.validation.categoryCollection"));
      return;
    }
    if (editingProduct) {
      handleUpdate();
    } else {
      handleCreate();
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setImages(product.images || []);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      category: product.category || "",
      collection: product.collection || "",
      sizes: product.sizes?.join(", ") || "",
      colors: product.colors?.join(", ") || "",
      image: product.images?.[0]?.url || "",
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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploading(true);
    try {
      const { data } = await axiosClient.post("/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((prev) => [...prev, data]);
      showToast(t("adminProductsPage.toast.uploadSuccess"), "success");
    } catch (error) {
      showToast(t("adminProductsPage.toast.uploadError"), "error");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = (publicId) => {
    setImages((prev) => prev.filter((image) => image.publicId !== publicId));
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className={`mb-6 flex ${isRTL ? "justify-start" : "justify-end"}`}>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {isRTL
            ? `${t("adminProductsPage.backToDashboard")} →`
            : `← ${t("adminProductsPage.backToDashboard")}`}
        </Link>
      </div>
      <div className="glass-card grid gap-8 p-10 lg:grid-cols-[1.2fr,1fr]">
        <section className={isRTL ? "text-right" : "text-left"}>
          <h2 className="text-2xl font-bold text-white">
            {editingProduct ? t("adminProductsPage.editTitle") : t("adminProductsPage.createTitle")}
          </h2>
          <form
            className={`mt-6 grid gap-5 ${isRTL ? "text-right" : "text-left"}`}
            onSubmit={handleSubmit}
          >
            <div>
              <label className="mb-2 block text-sm text-white/70">
                {t("adminProductsPage.form.name")}
              </label>
              <input
                value={formData.name}
                onChange={handleChange("name")}
                required
                className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  {t("adminProductsPage.form.price")}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.price}
                  onChange={handleChange("price")}
                  required
                  className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  {t("adminProductsPage.form.category")}
                </label>
                <select
                  value={formData.category}
                  onChange={handleChange("category")}
                  className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <option value="">{t("adminProductsPage.form.categoryPlaceholder")}</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-black">
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">
                {t("adminProductsPage.form.collection")}
              </label>
              <select
                value={formData.collection}
                onChange={handleChange("collection")}
                className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                  isRTL ? "text-right" : "text-left"
                }`}
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
              <label className="mb-2 block text-sm text-white/70">
                {t("adminProductsPage.form.description")}
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={handleChange("description")}
                className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  {t("adminProductsPage.form.sizes")}
                </label>
                <input
                  value={formData.sizes}
                  onChange={handleChange("sizes")}
                  className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">
                  {t("adminProductsPage.form.colors")}
                </label>
                <input
                  value={formData.colors}
                  onChange={handleChange("colors")}
                  className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">
                {t("adminProductsPage.form.images")}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-white"
              />
              <div className={`mt-4 flex flex-wrap gap-3 ${isRTL ? "justify-end" : "justify-start"}`}>
                {images.map((image) => (
                  <div key={image.publicId} className="relative h-24 w-24 overflow-hidden rounded-2xl">
                    <img src={image.url} alt={image.publicId} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(image.publicId)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className={`flex gap-3 ${isRTL ? "justify-start" : "justify-end"}`}>
              <button type="submit" className="btn-primary">
                {editingProduct
                  ? t("adminProductsPage.form.submitUpdate")
                  : t("adminProductsPage.form.submitCreate")}
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
          <h3 className="text-lg font-semibold text-white">
            {t("adminProductsPage.sections.currentProducts")}
          </h3>
          {loading ? (
            <div className="glass-card h-32 animate-pulse bg-white/5" />
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`glass-card flex items-center justify-between p-4 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <div className="h-14 w-14 overflow-hidden rounded-2xl">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
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
              ))}
              {products.length === 0 && (
                <div className="glass-card p-6 text-center text-white/60">
                  {t("adminProductsPage.list.empty")}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminProducts;


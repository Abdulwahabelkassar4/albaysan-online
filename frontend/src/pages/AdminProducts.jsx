import { useEffect, useState } from "react";
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

const categories = ["عبايات", "نقابات", "سبورات شرعية", "حقائب"];
const collections = ["الكوليكشن الصيفي", "الكوليكشن الخريفي", "الكوليكشن الشتوي", "الكوليكشن الربيعي"];

const AdminProducts = () => {
  const { showToast } = useToast();
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
      showToast("تعذر تحميل المنتجات", "error");
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
      showToast("تم إضافة المنتج", "success");
      resetForm();
      loadProducts();
    } catch (error) {
      showToast("تعذر حفظ المنتج", "error");
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct?._id) return;
    const payload = buildPayload();
    try {
      await axiosClient.put(`/api/products/${editingProduct._id}`, payload);
      console.log("Product updated", editingProduct._id);
      showToast("تم تحديث المنتج", "success");
      resetForm();
      loadProducts();
    } catch (error) {
      console.error("Update failed", error);
      showToast("تعذر تحديث المنتج", "error");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.category || !formData.collection) {
      alert("يرجى اختيار الفئة والمجموعة قبل إضافة المنتج");
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
    if (!window.confirm("هل أنت متأكدة من حذف المنتج؟")) return;
    try {
      await axiosClient.delete(`/api/products/${id}`);
      showToast("تم حذف المنتج", "info");
      loadProducts();
    } catch (error) {
      showToast("تعذر حذف المنتج", "error");
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
      showToast("تم رفع الصورة", "success");
    } catch (error) {
      showToast("تعذر رفع الصورة", "error");
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
      <div className="glass-card grid gap-8 p-10 lg:grid-cols-[1.2fr,1fr]">
        <section>
          <h2 className="text-2xl font-bold text-white">
            {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm text-white/70">اسم المنتج</label>
              <input
                value={formData.name}
                onChange={handleChange("name")}
                required
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">السعر (د.أ)</label>
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
                <label className="mb-2 block text-sm text-white/70">الفئة</label>
                <select
                  value={formData.category}
                  onChange={handleChange("category")}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((option) => (
                    <option key={option} value={option} className="text-black">
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">المجموعة</label>
              <select
                value={formData.collection}
                onChange={handleChange("collection")}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">اختر المجموعة</option>
                {collections.map((option) => (
                  <option key={option} value={option} className="text-black">
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">الوصف</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={handleChange("description")}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/70">المقاسات (افصليها بفاصلة)</label>
                <input
                  value={formData.sizes}
                  onChange={handleChange("sizes")}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">الألوان (افصليها بفاصلة)</label>
                <input
                  value={formData.colors}
                  onChange={handleChange("colors")}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/70">الصور</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full rounded-2xl border border-dashed border-white/20 bg-transparent px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-white"
              />
              <div className="mt-4 flex flex-wrap gap-3">
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
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingProduct ? "تحديث المنتج" : "إضافة المنتج"}
              </button>
              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/30 px-4 py-2 text-sm text-white"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </section>
        <section className="space-y-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white">المنتجات الحالية</h3>
          {loading ? (
            <div className="glass-card h-32 animate-pulse bg-white/5" />
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product._id} className="glass-card flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 overflow-hidden rounded-2xl">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white/5 text-white/40">لا</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-white/60">{product.price} د.أ</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleEdit(product)}
                      className="rounded-full border border-white/30 px-3 py-1 text-white/80"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="rounded-full border border-rose-400/40 px-3 py-1 text-rose-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="glass-card p-6 text-center text-white/60">لم يتم إضافة منتجات بعد.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminProducts;


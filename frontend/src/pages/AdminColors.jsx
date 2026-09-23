import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { PaletteIcon, SparkleIcon, EditIcon, TrashIcon } from "../components/icons.jsx";

const PRESET_HEX_COLORS = [
  "#121212", "#1f2937", "#0f172a", "#1e3a8a", "#312e81", "#581c87", 
  "#831843", "#701a75", "#706d7e", "#450a0a", "#5c1326", "#2d3a27", 
  "#064e3b", "#047857", "#90ee90", "#94a3b8", "#d4b896", "#f59e0b",
  "#ef4444", "#ec4899", "#a855f7", "#ffffff"
];

const defaultValues = {
  name: "",
  hexCode: "#121212",
  imageUrl: "",
  description: "",
  inStock: true,
};

const AdminColors = () => {
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingColor, setEditingColor] = useState(null);
  const [formData, setFormData] = useState({ ...defaultValues });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const loadColors = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/colors");
      setColors(data || []);
    } catch (error) {
      showToast("فشل تحميل دليل الألوان", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const uploadData = new FormData();
    uploadData.append("images", file);

    setUploading(true);
    try {
      const { data } = await axiosClient.post("/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (Array.isArray(data.urls) && data.urls.length > 0) {
        setFormData((prev) => ({ ...prev, imageUrl: data.urls[0] }));
        showToast("تم رفع صورة عينة اللون بنجاح", "success");
      }
    } catch (error) {
      showToast("فشل رفع الصورة المرجعية", "error");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingColor(null);
    setFormData({ ...defaultValues });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hexCode.trim()) {
      showToast("اسم اللون والرمز المترادف مطلوبان", "error");
      return;
    }

    try {
      if (editingColor?._id) {
        await axiosClient.put(`/api/colors/${editingColor._id}`, formData);
        showToast("تم تحديث مرجعية اللون بنجاح", "success");
      } else {
        await axiosClient.post("/api/colors", formData);
        showToast("تم إضافة مرجعية اللون بنجاح", "success");
      }
      resetForm();
      loadColors();
    } catch (error) {
      showToast(error.response?.data?.message || "حدث خطأ أثناء حفظ مرجعية اللون", "error");
    }
  };

  const handleEdit = (color) => {
    setEditingColor(color);
    setFormData({
      name: color.name || "",
      hexCode: color.hexCode || "#121212",
      imageUrl: color.imageUrl || "",
      description: color.description || "",
      inStock: color.inStock !== false,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت تأكد من حذف مرجعية هذا اللون؟")) return;
    try {
      await axiosClient.delete(`/api/colors/${id}`);
      showToast("تم حذف مرجعية اللون بنجاح", "info");
      loadColors();
    } catch (error) {
      showToast("فشل حذف مرجعية اللون", "error");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
          <PaletteIcon className="h-7 w-7 text-amber-400" />
          <span>دليل وركام الألوان المعتمدة</span>
        </h1>
        <p className="text-xs md:text-sm text-white/60">
          إضافة وتعديل الألوان المعتمدة مع عينات صور الأقمشة الحقيقية ورموز HEX
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr,1.3fr]">
        {/* Form Card */}
        <section className={`glass-card p-8 rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl ${isRTL ? "text-right" : "text-left"}`}>
          <h2 className="text-xl font-bold text-white mb-4">
            {editingColor ? "تعديل مرجعية لون" : "إضافة لون جديد لمرجعية الألوان"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Color Name */}
            <div>
              <label className="mb-2 block text-sm text-white/80 font-medium">
                اسم اللون <span className="text-rose-400">*</span>
              </label>
              <input
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="مثال: أخضر فاتح، كحلي، أسود ملكي..."
                required
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-400"
              />
            </div>

            {/* Color Palette Selector (Hex Code) */}
            <div>
              <label className="mb-2 block text-sm text-white/80 font-medium flex items-center justify-between">
                <span>اختيار من لوحة الألوان (Color Palette Code)</span>
                <span
                  className="inline-block h-6 w-6 rounded-full border border-white/30 shadow-md"
                  style={{ backgroundColor: formData.hexCode }}
                />
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.hexCode}
                  onChange={handleChange("hexCode")}
                  className="h-11 w-16 cursor-pointer rounded-xl border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={formData.hexCode}
                  onChange={handleChange("hexCode")}
                  placeholder="#121212"
                  className="flex-1 rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-400 font-mono"
                />
              </div>

              {/* Quick Preset Palette Chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESET_HEX_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, hexCode: hex }))}
                    style={{ backgroundColor: hex }}
                    className={`h-7 w-7 rounded-full border border-white/20 transition hover:scale-110 ${
                      formData.hexCode.toLowerCase() === hex.toLowerCase() ? "ring-2 ring-secondary-400 scale-110" : ""
                    }`}
                    title={hex}
                  />
                ))}
              </div>
            </div>

            {/* Fabric Photo Reference Sample */}
            <div>
              <label className="mb-2 block text-sm text-white/80 font-medium">
                صورة عينة القماش الحقيقية (Photo Reference Sample)
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={handleChange("imageUrl")}
                  placeholder="رابط الصورة أو ارفع ملف عينة القماش أدناه..."
                  className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-400"
                />
                
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer rounded-2xl border border-secondary-400/40 bg-secondary-500/20 px-4 py-2 text-xs font-bold text-secondary-200 hover:bg-secondary-500/30 transition">
                    {uploading ? "جاري الرفع..." : "📸 رفع صورة العينة"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {formData.imageUrl && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      تم تعيين صورة العينة
                    </div>
                  )}
                </div>

                {formData.imageUrl && (
                  <div className="relative mt-2 h-32 w-32 overflow-hidden rounded-2xl border border-white/20 shadow-lg">
                    <img src={formData.imageUrl} alt="Sample" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm text-white/80 font-medium">وصف اللون (اختياري)</label>
              <input
                value={formData.description}
                onChange={handleChange("description")}
                placeholder="مثال: درجة صيفية فاتحة، غير شفافة..."
                className="w-full rounded-2xl border border-white/20 bg-neutral-800/80 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-400"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="colorInStock"
                checked={formData.inStock}
                onChange={handleChange("inStock")}
                className="h-5 w-5 rounded border-white/20 bg-neutral-800 text-secondary-600 focus:ring-secondary-500"
              />
              <label htmlFor="colorInStock" className="text-sm font-semibold text-white">
                هذا اللون متوفر حالياً في دليل القماش
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1">
                {editingColor ? "تحديث اللون" : "إضافة اللون للمرجعية"}
              </button>
              {editingColor && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Colors List */}
        <section className={`glass-card p-6 rounded-3xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl ${isRTL ? "text-right" : "text-left"}`}>
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4">
            دليل الألوان المعتمد ({colors.length})
          </h3>

          {loading ? (
            <div className="h-48 animate-pulse bg-white/5 rounded-2xl flex items-center justify-center text-xs text-white/50">
              جاري تحميل الألوان...
            </div>
          ) : (
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {colors.map((color) => (
                <div
                  key={color._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Color Chip */}
                    <div
                      className="h-12 w-12 rounded-2xl border border-white/20 shadow-md shrink-0 flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: color.hexCode }}
                    >
                      {color.imageUrl && (
                        <img
                          src={color.imageUrl}
                          alt={color.name}
                          className="h-full w-full object-cover opacity-80 hover:opacity-100 transition"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white truncate">{color.name}</span>
                        <span className="text-[10px] font-mono text-white/50 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                          {color.hexCode}
                        </span>
                      </div>
                      {color.description && (
                        <p className="text-xs text-white/60 truncate mt-0.5">{color.description}</p>
                      )}
                      {color.imageUrl ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 mt-1">
                          📸 مزود بصورة عينة حقيقية
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300/80 mt-1">
                          ⚠️ بدون صورة عينة قماش
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEdit(color)}
                      className="rounded-xl border border-white/15 bg-white/5 p-2 text-white/90 hover:bg-white/20 transition"
                      title="تعديل اللون"
                      aria-label="Edit color"
                    >
                      <EditIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(color._id)}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20 transition"
                      title="حذف اللون"
                      aria-label="Delete color"
                    >
                      <TrashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {colors.length === 0 && (
                <div className="p-8 text-center text-xs text-white/50">لا يوجد ألوان مسجلة في الدليل حالياً.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminColors;

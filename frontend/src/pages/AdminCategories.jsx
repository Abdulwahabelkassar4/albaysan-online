import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { ChartIcon, PlusIcon, CloseIcon, TrashIcon } from "../components/icons.jsx";

const AdminCategories = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const isRTL = i18n.language === "ar";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [type, setType] = useState("category"); // 'category' or 'collection'
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axiosClient.get("/api/categories/all");
      setCategories(data || []);
    } catch (error) {
      console.error(error);
      showToast("تعذر تحميل التصنيفات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await axiosClient.post("/api/categories", { name: name.trim(), type });
      showToast("تمت إضافة الفئة بنجاح", "success");
      setName("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "تعذر إضافة الفئة", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التصنيف؟")) return;
    try {
      await axiosClient.delete(`/api/categories/${id}`);
      showToast("تم حذف الفئة بنجاح", "success");
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast("تعذر حذف الفئة", "error");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axiosClient.put(`/api/categories/${id}`, { isActive: !currentStatus });
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const categoryList = categories.filter((c) => c.type === "category");
  const collectionList = categories.filter((c) => c.type === "collection");

  return (
    <div className="mx-auto max-w-7xl px-2.5 sm:px-4 md:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
          <ChartIcon className="h-7 w-7 text-emerald-400" />
          <span>إدارة التصنيفات والمجموعات</span>
        </h1>
        <p className="text-xs md:text-sm text-white/60">
          تنظيم أقسام المتجر (عباءات، ادناءات، نقابات) والمجموعات الموسمية
        </p>
      </div>

      {/* ─── Add Category Form ─── */}
      <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-neutral-900/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-sm sm:text-base font-bold text-white mb-3">إضافة تصنيف أو كوليكشن جديد</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم (مثال: ادناءات، عروض رمضان، فساتين)"
            className="flex-1 rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
            required
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-2xl border border-white/10 bg-neutral-950/60 px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="category">فئة (تصنيف رئيسي)</option>
            <option value="collection">مجموعة (كوليكشن موسمي)</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
          >
            {submitting ? "جارٍ الإضافة..." : "إضافة الآن +"}
          </button>
        </form>
      </div>

      {/* ─── Categories & Collections Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {/* Categories Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-neutral-900/80 p-4 sm:p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center gap-2">
              <span>🏷️ الفئات والتصنيفات ({categoryList.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : categoryList.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-6">لا توجد فئات مسجلة حالياً.</p>
          ) : (
            <ul className="space-y-2">
              {categoryList.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 sm:p-3 text-xs text-white hover:border-white/15 transition"
                >
                  <span className="font-bold text-xs sm:text-sm truncate max-w-[180px]">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`rounded-xl px-2 py-1 text-[10px] font-bold border transition ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {item.isActive ? "نشط ✓" : "معطل ✕"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20 transition"
                      title="حذف"
                      aria-label="Delete category"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Collections Section */}
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-neutral-900/80 p-4 sm:p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-secondary-300 flex items-center gap-2">
              <span>✨ المجموعات والكوليكشن ({collectionList.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : collectionList.length === 0 ? (
            <p className="text-xs text-white/50 text-center py-6">لا توجد مجموعات مسجلة حالياً.</p>
          ) : (
            <ul className="space-y-2">
              {collectionList.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-2.5 sm:p-3 text-xs text-white hover:border-white/15 transition"
                >
                  <span className="font-bold text-xs sm:text-sm truncate max-w-[180px]">{item.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`rounded-xl px-2 py-1 text-[10px] font-bold border transition ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {item.isActive ? "نشط ✓" : "معطل ✕"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20 transition"
                      title="حذف"
                      aria-label="Delete collection"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";
import { ChartIcon, PlusIcon, CloseIcon } from "../components/icons.jsx";

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
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 space-y-6">
      {/* ─── Top Header ─── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
          <ChartIcon className="h-7 w-7 text-emerald-400" />
          <span>إدارة التصنيفات والمجموعات</span>
        </h1>
        <p className="text-xs md:text-sm text-white/60">
          تنظيم أقسام المتجر (عباءات، ادناءات، نقابات) والمجموعات الموسمية
        </p>
      </div>

      {/* ─── Add Category Form ─── */}
      <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-base font-bold text-white mb-4">إضافة تصنيف أو كوليكشن جديد</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Categories Section */}
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <span>🏷️ الفئات والتصنيفات الرئيسية ({categoryList.length})</span>
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
            <ul className="space-y-2.5">
              {categoryList.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 text-xs text-white hover:border-white/15 transition"
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`rounded-xl px-2.5 py-1 text-[10px] font-bold border transition ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {item.isActive ? "نشط ✓" : "معطل ✕"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20 transition"
                    >
                      حذف
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Collections Section */}
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <h3 className="text-sm font-bold text-secondary-300 flex items-center gap-2">
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
            <ul className="space-y-2.5">
              {collectionList.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 text-xs text-white hover:border-white/15 transition"
                >
                  <span className="font-bold text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`rounded-xl px-2.5 py-1 text-[10px] font-bold border transition ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {item.isActive ? "نشط ✓" : "معطل ✕"}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-300 hover:bg-rose-500/20 transition"
                    >
                      حذف
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

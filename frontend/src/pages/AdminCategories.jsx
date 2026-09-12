import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

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
      showToast(t("adminCategoriesPage.toast.addError"), "error");
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
      showToast(t("adminCategoriesPage.toast.addSuccess"), "success");
      setName("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || t("adminCategoriesPage.toast.addError"),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("adminCategoriesPage.deleteConfirm"))) return;
    try {
      await axiosClient.delete(`/api/categories/${id}`);
      showToast(t("adminCategoriesPage.toast.deleteSuccess"), "success");
      fetchCategories();
    } catch (error) {
      console.error(error);
      showToast(t("adminCategoriesPage.toast.deleteError"), "error");
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
    <section className="relative overflow-hidden py-12">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            {t("adminCategoriesPage.title")}
          </h1>
          <Link
            to="/admin"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
          >
            {t("general.backToDashboard")}
          </Link>
        </div>

        {/* Add Form */}
        <div className="glass-card mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            إضافة تصنيف أو مجموعة جديدة
          </h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم (مثال: ادناءات، عروض رمضان، فساتين)"
              className={`flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary-300 ${
                isRTL ? "text-right" : "text-left"
              }`}
              required
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-2xl border border-white/20 bg-purple-950 px-4 py-3 text-sm text-white focus:outline-none"
            >
              <option value="category">فئة (تصنيف)</option>
              <option value="collection">مجموعة (كوليكشن)</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
            >
              {submitting ? "جاري الإضافة..." : "إضافة"}
            </button>
          </form>
        </div>

        {/* List of Categories */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Categories */}
          <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-bold text-secondary-200">
              🏷️ الفئات (Categories)
            </h3>
            {loading ? (
              <p className="text-white/60">جارٍ التحميل...</p>
            ) : categoryList.length === 0 ? (
              <p className="text-white/60">لا توجد فئات حالياً.</p>
            ) : (
              <ul className="space-y-3">
                {categoryList.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                  >
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(item._id, item.isActive)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {item.isActive ? "مفعل" : "معطل"}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Collections */}
          <div className="glass-card p-6">
            <h3 className="mb-4 text-lg font-bold text-secondary-200">
              📦 المجموعات (Collections)
            </h3>
            {loading ? (
              <p className="text-white/60">جارٍ التحميل...</p>
            ) : collectionList.length === 0 ? (
              <p className="text-white/60">لا توجد مجموعات حالياً.</p>
            ) : (
              <ul className="space-y-3">
                {collectionList.map((item) => (
                  <li
                    key={item._id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white"
                  >
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(item._id, item.isActive)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {item.isActive ? "مفعل" : "معطل"}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-semibold text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
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
    </section>
  );
};

export default AdminCategories;

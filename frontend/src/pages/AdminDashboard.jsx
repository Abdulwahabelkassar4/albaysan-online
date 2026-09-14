import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { ArrowForwardIcon, BoxIcon, ChartIcon, ClipboardIcon, ClockIcon, PaletteIcon, SparkleIcon } from "../components/icons.jsx";
import { useToast } from "../context/ToastContext.jsx";

const controlLinks = [
  { to: "/admin/products", icon: BoxIcon, labelKey: "admin.links.products" },
  { to: "/admin/categories", icon: ChartIcon, labelKey: "admin.links.categories" },
  { to: "/admin/colors", icon: PaletteIcon, labelKey: "🎨 دليل وركام الألوان" },
  { to: "/admin/orders", icon: ClipboardIcon, labelKey: "admin.links.orders" },
  { to: "/admin/offers-config", icon: ClockIcon, labelKey: "عداد العروض والتخفيضات" },
];

const AdminDashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    productsCount: 0,
    monthlyRevenue: [],
  });
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [{ data: productsData }, { data: orderStats }] = await Promise.all([
          axiosClient.get("/api/products", { params: { limit: 1 } }),
          axiosClient.get("/api/orders/stats"),
        ]);

        setStats({
          ...orderStats,
          productsCount: productsData.pagination?.total || 0,
        });
      } catch (error) {
        console.error(error);
        showToast("تعذر تحميل الإحصائيات الشاملة", "error");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [showToast, i18n.language]);

  const handleLogout = () => {
    localStorage.removeItem("albaylsan_token");
    onLogout?.();
    showToast(t("admin.logoutToast"), "info");
    navigate("/admin/login", { replace: true });
  };

  const maxRevenue = Math.max(...(stats.monthlyRevenue || []).map((m) => m.revenue), 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      {/* Header */}
      <div
        className={`flex flex-col gap-6 md:flex-row md:items-center md:justify-between ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <SparkleIcon className="h-7 w-7 text-primary-400" />
            {t("admin.dashboardTitle")}
          </h1>
          <p className="mt-2 text-sm text-white/70">{t("admin.dashboardIntro")}</p>
        </div>
        <button onClick={handleLogout} className="btn-ghost self-start md:self-auto">
          {t("admin.logout")}
        </button>
      </div>

      {/* Primary KPI Stats Grid */}
      <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>إجمالي المبيعات</span>
            <SparkleIcon className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-emerald-400">
            {stats.totalRevenue.toFixed(2)} <span className="text-xs font-normal">د.أ</span>
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>إجمالي الطلبات</span>
            <ClipboardIcon className="h-5 w-5 text-primary-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-primary-400">{stats.totalOrders}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>طلبات قيد الانتظار</span>
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <p className="mt-3 text-3xl font-black text-amber-400">{stats.pendingOrders}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>عدد المنتجات بالمتجر</span>
            <BoxIcon className="h-5 w-5 text-secondary-400" />
          </div>
          <p className="mt-3 text-3xl font-black text-secondary-400">{stats.productsCount}</p>
        </div>
      </section>

      {/* Monthly Revenue Chart Visualizer */}
      <section className="mt-10 rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <ChartIcon className="h-5 w-5 text-primary-400" />
          مخطط الإيرادات الشهرية
        </h2>

        {loading ? (
          <div className="h-48 flex items-center justify-center text-xs text-white/50 animate-pulse">
            جاري تحميل البيانات...
          </div>
        ) : stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
          <div className="flex h-56 items-end gap-4 border-b border-white/10 pb-4 pt-8 px-2 overflow-x-auto">
            {stats.monthlyRevenue.map((item, idx) => {
              const heightPercent = Math.max(10, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[50px]">
                  <span className="text-[10px] text-primary-300 font-semibold">{item.revenue} د.أ</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-primary-600 via-secondary-500 to-primary-400 transition-all duration-500 hover:brightness-125"
                  />
                  <span className="text-xs text-white/70 truncate w-full text-center">{item.month}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-white/40">
            لا تتوفر مبيعات سابقة لعرض المخطط البياني حالياً.
          </div>
        )}
      </section>

      {/* Action Links */}
      <section className="mt-12 text-center">
        <h2 className="text-xl font-bold text-white/80 mb-6">{t("admin.linksTitle")}</h2>
        <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {controlLinks.map((item) => {
            const Icon = item.icon;
            const labelText = item.labelKey.startsWith("admin.") ? t(item.labelKey) : item.labelKey;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`action-panel w-full text-white rounded-3xl p-6 border border-white/10 bg-neutral-900/80 hover:border-primary-500/50 transition ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-2xl bg-white/10 p-3 text-secondary-300">
                    <Icon className="h-6 w-6" />
                  </span>
                  <ArrowForwardIcon className={`h-5 w-5 text-white/70 ${isRTL ? "rotate-180" : ""}`} />
                </div>
                <span className="mt-4 block text-lg font-bold">{labelText}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

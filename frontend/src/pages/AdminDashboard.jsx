import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import {
  ArrowForwardIcon,
  BoxIcon,
  ChartIcon,
  ClipboardIcon,
  ClockIcon,
  PaletteIcon,
  SparkleIcon,
  PlusIcon,
  WhatsAppIcon,
} from "../components/icons.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { normalizeJordanPhoneForWhatsApp } from "../config/contact.js";

const quickLinks = [
  { to: "/admin/orders", icon: ClipboardIcon, title: "إدارة الطلبات والحجوزات", subtitle: "متابعة وتحديث حالات طلبات الزبائن", color: "from-blue-600/20 to-primary-600/20", borderColor: "border-blue-500/30", badgeKey: "pendingOrders" },
  { to: "/admin/products", icon: BoxIcon, title: "إدارة المنتجات والأسعار", subtitle: "إضافة وتعديل المنتجات والمخزون", color: "from-purple-600/20 to-pink-600/20", borderColor: "border-purple-500/30" },
  { to: "/admin/categories", icon: ChartIcon, title: "التصنيفات والمجموعات", subtitle: "تنظيم أقسام وتصنيفات المتجر", color: "from-emerald-600/20 to-teal-600/20", borderColor: "border-emerald-500/30" },
  { to: "/admin/colors", icon: PaletteIcon, title: "دليل وركام الألوان", subtitle: "تحديد باليتات وخيارات الألوان للقطع", color: "from-amber-600/20 to-orange-600/20", borderColor: "border-amber-500/30" },
  { to: "/admin/reviews", icon: SparkleIcon, title: "تقييمات وآراء العملاء", subtitle: "التحكم بظهور التقييمات وإنشاء الروابط", color: "from-rose-600/20 to-pink-600/20", borderColor: "border-rose-500/30" },
  { to: "/admin/offers-config", icon: ClockIcon, title: "العروض وأكواد الخصم", subtitle: "إعداد مؤقت العروض وقسائم التخفيض", color: "from-indigo-600/20 to-cyan-600/20", borderColor: "border-indigo-500/30" },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    productsCount: 0,
    monthlyRevenue: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [{ data: productsData }, { data: orderStats }, { data: ordersData }] = await Promise.all([
          axiosClient.get("/api/products", { params: { limit: 1 } }),
          axiosClient.get("/api/orders/stats"),
          axiosClient.get("/api/orders", { params: { limit: 5 } }),
        ]);

        setStats({
          ...orderStats,
          productsCount: productsData.pagination?.total || 0,
        });

        const list = ordersData?.data || (Array.isArray(ordersData) ? ordersData : []);
        setRecentOrders(list.slice(0, 5));
      } catch (error) {
        console.error(error);
        showToast("تعذر تحميل بيانات لوحة التحكم", "error");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [showToast]);

  const maxRevenue = Math.max(...(stats.monthlyRevenue || []).map((m) => m.revenue), 100);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold">قيد الانتظار</span>;
      case "confirmed":
        return <span className="rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-xs font-bold">جاري التجهيز</span>;
      case "completed":
        return <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold">مكتمل</span>;
      case "cancelled":
        return <span className="rounded-full bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 text-xs font-bold">ملغي</span>;
      default:
        return <span className="rounded-full bg-white/10 text-white/70 px-2.5 py-0.5 text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-2.5 sm:px-4 md:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* ─── Header & Quick Action Launcher ─── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold tracking-wide uppercase text-emerald-400">لوحة الإدارة الحية</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            مرحباً بك في مركز إدارة متجر البيلسان 🌸
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1">
            نظرة عامة على أداء المبيعات، الطلبات المعلقة، والعمليات السريعة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-950/40 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <PlusIcon className="h-4 w-4" />
            <span>إضافة منتج جديد</span>
          </Link>
          <Link
            to="/admin/orders?status=pending"
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition"
          >
            <ClipboardIcon className="h-4 w-4" />
            <span>طلبات معلقة ({stats.pendingOrders})</span>
          </Link>
        </div>
      </div>

      {/* ─── Primary KPI Stats Grid ─── */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl group hover:border-emerald-500/30 transition">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>إجمالي المبيعات المحققة</span>
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
              <SparkleIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
            {stats.totalRevenue.toFixed(2)} <span className="text-xs font-bold text-white/70">د.أ</span>
          </p>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">✓ يشمل الطلبات المكتملة والمؤكدة</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl group hover:border-primary-500/30 transition">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>إجمالي الطلبات المستلمة</span>
            <div className="rounded-xl bg-primary-500/20 p-2 text-primary-400">
              <ClipboardIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-primary-400 tracking-tight">
            {stats.totalOrders} <span className="text-xs font-normal text-white/60">طلب</span>
          </p>
          <span className="text-[11px] text-white/50 mt-1 block">توصيل واستلام من المتجر</span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-950/20 p-5 shadow-xl backdrop-blur-xl group transition">
          <div className="flex items-center justify-between text-xs text-amber-300/80">
            <span>طلبات بانتظار المتابعة</span>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-amber-400 tracking-tight">
            {stats.pendingOrders} <span className="text-xs font-normal text-amber-300/70">جديد</span>
          </p>
          <Link to="/admin/orders" className="text-[11px] font-bold text-amber-300 hover:underline mt-1 inline-block">
            معالجة الطلبات المعلقة ➔
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/80 p-5 shadow-xl backdrop-blur-xl group hover:border-secondary-500/30 transition">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>المنتجات النشطة بالمتجر</span>
            <div className="rounded-xl bg-secondary-500/20 p-2 text-secondary-400">
              <BoxIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-secondary-400 tracking-tight">
            {stats.productsCount} <span className="text-xs font-normal text-white/60">منتج</span>
          </p>
          <Link to="/admin/products" className="text-[11px] font-bold text-secondary-300 hover:underline mt-1 inline-block">
            إدارة المخزون والتفاصيل ➔
          </Link>
        </div>
      </section>

      {/* ─── Chart & Recent Orders Split Grid ─── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Revenue Chart Visualizer (2 Cols) */}
        <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ChartIcon className="h-5 w-5 text-primary-400" />
              مخطط الإيرادات الشهرية (د.أ)
            </h2>
            <span className="text-xs text-white/50 font-mono">آخر الأشهر</span>
          </div>

          {loading ? (
            <div className="h-52 flex items-center justify-center text-xs text-white/50 animate-pulse">
              جاري تحميل المخطط البياني...
            </div>
          ) : stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
            <div className="flex h-56 items-end gap-3 border-b border-white/10 pb-4 pt-6 px-2 overflow-x-auto">
              {stats.monthlyRevenue.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[55px]">
                    <span className="text-[11px] text-primary-300 font-bold">{item.revenue.toFixed(0)}</span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] rounded-t-xl bg-gradient-to-t from-primary-600 via-secondary-500 to-primary-400 shadow-md shadow-primary-950/40 transition-all duration-500 hover:brightness-125 cursor-pointer"
                      title={`${item.month}: ${item.revenue} د.أ`}
                    />
                    <span className="text-xs text-white/70 truncate w-full text-center font-medium">{item.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-xs text-white/40 gap-2">
              <ChartIcon className="h-8 w-8 text-white/20" />
              لا تتوفر مبيعات سابقة لعرض المخطط البياني حالياً.
            </div>
          )}
        </section>

        {/* Recent Orders Live Feed (1 Col) */}
        <section className="rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ClipboardIcon className="h-5 w-5 text-amber-400" />
                أحدث الطلبات المستلمة
              </h2>
              <Link to="/admin/orders" className="text-xs text-primary-300 font-bold hover:underline">
                عرض الكل
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((ord) => {
                  const phoneBase = normalizeJordanPhoneForWhatsApp(ord.phone);
                  const orderTotal = ord.items?.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0) || 0;

                  return (
                    <div
                      key={ord._id || ord.id}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 hover:border-white/15 transition group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{ord.customerName}</span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <p className="text-[11px] text-white/60">
                          {ord.type === "delivery" ? "🚚 توصيل" : "🛍️ استلام"} • {orderTotal.toFixed(2)} د.أ
                        </p>
                      </div>

                      {phoneBase && (
                        <a
                          href={`https://wa.me/${phoneBase}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-emerald-400 hover:bg-emerald-500/20 transition"
                          title="محادثة واتساب سريعة"
                        >
                          <WhatsAppIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-xs text-white/40 gap-2">
                <ClipboardIcon className="h-8 w-8 text-white/20" />
                لا توجد طلبات حديثة حالياً.
              </div>
            )}
          </div>

          <Link
            to="/admin/orders"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition"
          >
            انتقال لجدول الطلبات الكامل ➔
          </Link>
        </section>
      </div>

      {/* ─── Control Panels & Management Modules Grid ─── */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-white flex items-center gap-2">
          <span>أقسام ولوحات الإدارة المتخصصة</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            const badgeValue = item.badgeKey === "pendingOrders" ? stats.pendingOrders : null;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative overflow-hidden rounded-3xl border ${item.borderColor} bg-gradient-to-br ${item.color} p-5 backdrop-blur-xl hover:scale-[1.01] hover:shadow-2xl transition duration-300 group`}
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-white/10 p-3 text-white shadow-inner group-hover:scale-110 transition duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  {badgeValue > 0 && (
                    <span className="rounded-full bg-amber-400 text-neutral-950 font-black text-xs px-2.5 py-0.5 shadow-md animate-pulse">
                      {badgeValue} معلق
                    </span>
                  )}
                  <ArrowForwardIcon className={`h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition ${isRTL ? "rotate-180" : ""}`} />
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="text-base font-bold text-white tracking-wide">{item.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{item.subtitle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

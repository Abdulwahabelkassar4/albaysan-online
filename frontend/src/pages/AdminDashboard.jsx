import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { useToast } from "../context/ToastContext.jsx";

const controlLinks = [
  { to: "/admin/products", icon: "🛍️", labelKey: "admin.links.products" },
  { to: "/admin/orders", icon: "📦", labelKey: "admin.links.orders" },
  { to: "/admin/dashboard#analytics", icon: "📊", labelKey: "admin.links.analytics" },
];

const AdminDashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0, pendingReservations: 0 });
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [{ data: productsData }, { data: ordersData }] = await Promise.all([
          axiosClient.get("/api/products", { params: { limit: 1 } }),
          axiosClient.get("/api/orders", { params: { status: "pending" } }),
        ]);

        const pendingOrders = ordersData.filter((order) => order.type === "delivery").length;
        const pendingReservations = ordersData.filter((order) => order.type === "reservation").length;

        setStats({
          products: productsData.pagination?.total || productsData.data?.length || 0,
          pendingOrders,
          pendingReservations,
        });
      } catch (error) {
        showToast(t("admin.stats.loadError"), "error");
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div
        className={`flex flex-col gap-6 md:flex-row md:items-center md:justify-between ${
          isRTL ? "text-right" : "text-left"
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold text-white">{t("admin.dashboardTitle")}</h1>
          <p className="mt-2 text-sm text-white/70">{t("admin.dashboardIntro")}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/30 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          {t("admin.logout")}
        </button>
      </div>
      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="glass-card p-6">
          <p className="text-sm text-white/70">{t("admin.stats.products")}</p>
          <p className="mt-3 text-4xl font-black text-secondary-200">{stats.products}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/70">{t("admin.stats.pendingOrders")}</p>
          <p className="mt-3 text-4xl font-black text-primary-200">{stats.pendingOrders}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-white/70">{t("admin.stats.pendingReservations")}</p>
          <p className="mt-3 text-4xl font-black text-white">{stats.pendingReservations}</p>
        </div>
      </section>
      <section className="mt-12 text-center">
        <h2
          className="animate-admin-fade text-xl font-bold text-white/80"
          style={{ animationDelay: "0.05s" }}
        >
          {t("admin.linksTitle")}
        </h2>
        <div className="mt-6 grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
          {controlLinks.map((item, index) => (
            <Link
              key={item.labelKey}
              to={item.to}
              className="animate-admin-fade w-full max-w-xs rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center text-white shadow-lg shadow-primary-900/20 transition hover:border-secondary-300 hover:bg-white/10"
              style={{ animationDelay: `${0.2 + index * 0.15}s` }}
            >
              <span className="text-3xl" aria-hidden="true">
                {item.icon}
              </span>
              <span className="mt-3 block text-lg font-semibold">{t(item.labelKey)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

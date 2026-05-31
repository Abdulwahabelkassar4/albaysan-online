import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../api/axiosClient.js";
import { ArrowForwardIcon, BoxIcon, ChartIcon, ClipboardIcon } from "../components/icons.jsx";
import { useToast } from "../context/ToastContext.jsx";

const controlLinks = [
  { to: "/admin/products", icon: BoxIcon, labelKey: "admin.links.products" },
  { to: "/admin/orders", icon: ClipboardIcon, labelKey: "admin.links.orders" },
  { to: "/admin/dashboard#analytics", icon: ChartIcon, labelKey: "admin.links.analytics" },
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
          className="btn-ghost"
        >
          {t("admin.logout")}
        </button>
      </div>
      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <div className={`info-panel ${isRTL ? "text-right" : "text-left"} animate-reveal`}>
          <div className={`flex items-center gap-2 text-sm text-white/70 ${isRTL ? "flex-row-reverse" : ""}`}>
            <BoxIcon className="h-4 w-4 text-secondary-200" />
            <span>{t("admin.stats.products")}</span>
          </div>
          <p className="mt-3 text-4xl font-black text-secondary-200">{stats.products}</p>
        </div>
        <div className={`info-panel ${isRTL ? "text-right" : "text-left"} animate-reveal`} style={{ animationDelay: "0.08s" }}>
          <div className={`flex items-center gap-2 text-sm text-white/70 ${isRTL ? "flex-row-reverse" : ""}`}>
            <ClipboardIcon className="h-4 w-4 text-primary-200" />
            <span>{t("admin.stats.pendingOrders")}</span>
          </div>
          <p className="mt-3 text-4xl font-black text-primary-200">{stats.pendingOrders}</p>
        </div>
        <div className={`info-panel ${isRTL ? "text-right" : "text-left"} animate-reveal`} style={{ animationDelay: "0.16s" }}>
          <div className={`flex items-center gap-2 text-sm text-white/70 ${isRTL ? "flex-row-reverse" : ""}`}>
            <ChartIcon className="h-4 w-4 text-white" />
            <span>{t("admin.stats.pendingReservations")}</span>
          </div>
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
          {controlLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.labelKey}
                to={item.to}
                className={`animate-admin-fade action-panel w-full max-w-xs text-white ${isRTL ? "text-right" : "text-left"}`}
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                <div className={`flex items-center justify-between gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <span className="inline-flex rounded-full bg-white/10 p-3 text-secondary-200" aria-hidden="true">
                    <Icon className="h-6 w-6" />
                  </span>
                  <ArrowForwardIcon className={`h-5 w-5 text-white/70 ${isRTL ? "rotate-180" : ""}`} />
                </div>
                <span className="mt-4 block text-lg font-semibold">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;

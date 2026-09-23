import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosClient from "../../api/axiosClient.js";
import logoImg from "../../assets/logo.jpg";
import {
  BoxIcon,
  ChartIcon,
  ClipboardIcon,
  ClockIcon,
  PaletteIcon,
  SparkleIcon,
  MenuIcon,
  CloseIcon,
  HomeIcon,
  ShoppingBagIcon,
  ArrowForwardIcon,
} from "../icons.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const navItems = [
  { to: "/admin/dashboard", labelKey: "admin.dashboardTitle", defaultLabel: "لوحة التحكم", icon: HomeIcon, exact: true },
  { to: "/admin/orders", labelKey: "admin.links.orders", defaultLabel: "إدارة الطلبات", icon: ClipboardIcon, hasBadge: true },
  { to: "/admin/products", labelKey: "admin.links.products", defaultLabel: "إدارة المنتجات", icon: BoxIcon },
  { to: "/admin/categories", labelKey: "admin.links.categories", defaultLabel: "التصنيفات والمجموعات", icon: ChartIcon },
  { to: "/admin/colors", labelKey: "🎨 دليل وركام الألوان", defaultLabel: "دليل الألوان", icon: PaletteIcon },
  { to: "/admin/reviews", labelKey: "⭐ تقييمات العملاء", defaultLabel: "تقييمات العملاء", icon: SparkleIcon },
  { to: "/admin/offers-config", labelKey: "عداد العروض والتخفيضات", defaultLabel: "العروض وأكواد الخصم", icon: ClockIcon },
];

const AdminLayout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isRTL = i18n.language === "ar";

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Fetch pending orders count for notification badge
  useEffect(() => {
    let isMounted = true;
    const fetchBadge = async () => {
      try {
        const res = await axiosClient.get("/api/orders/stats");
        if (isMounted && res.data?.pendingOrders !== undefined) {
          setPendingOrdersCount(res.data.pendingOrders);
        }
      } catch (err) {
        // Silently ignore stat badge errors
      }
    };
    fetchBadge();
    const interval = setInterval(fetchBadge, 30000); // refresh every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("albaylsan_token");
    showToast(t("admin.logoutToast") || "تم تسجيل الخروج بنجاح", "info");
    navigate("/admin/login", { replace: true });
  };

  const handleToggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    localStorage.setItem("albaylsan_lang", next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-purple-950/40 text-white flex flex-col lg:flex-row font-sans selection:bg-primary-500 selection:text-white">
      {/* ─── DESKTOP SIDEBAR (lg+) ─── */}
      <aside
        className={`hidden lg:flex flex-col justify-between border-r border-white/10 bg-neutral-900/90 backdrop-blur-2xl transition-all duration-300 z-30 sticky top-0 h-screen ${
          isRTL ? "border-l border-r-0" : ""
        } ${isSidebarCollapsed ? "w-20" : "w-72"}`}
      >
        {/* Sidebar Header / Brand */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <Link to="/admin/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <img
                src={logoImg}
                alt="Al-Baylsan Logo"
                className="h-10 w-10 rounded-2xl object-cover ring-2 ring-primary-500/40 shadow-lg group-hover:scale-105 transition duration-300 shrink-0"
              />
              {!isSidebarCollapsed && (
                <div className="truncate">
                  <h2 className="text-base font-black tracking-wide bg-gradient-to-r from-primary-300 via-secondary-300 to-pink-300 bg-clip-text text-transparent">
                    {t("site.title", "البيلسان")}
                  </h2>
                  <span className="text-[10px] text-white/50 font-semibold tracking-wider uppercase block">
                    لوحة التحكم الإدارية
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="rounded-xl p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition"
              title={isSidebarCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
            >
              <ArrowForwardIcon
                className={`h-4 w-4 transition-transform duration-300 ${
                  isSidebarCollapsed ? (isRTL ? "rotate-0" : "rotate-180") : isRTL ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
          </div>

          {/* Quick Storefront Link Button */}
          {!isSidebarCollapsed && (
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2 text-xs font-medium text-white/80 hover:bg-primary-500/20 hover:border-primary-500/30 hover:text-white transition group"
            >
              <span className="flex items-center gap-2">
                <ShoppingBagIcon className="h-4 w-4 text-primary-400 group-hover:scale-110 transition" />
                زيارة المتجر المباشر
              </span>
              <span className="text-[10px] text-white/40 group-hover:text-primary-300 font-mono">↗</span>
            </Link>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const label = item.labelKey.startsWith("admin.") ? t(item.labelKey, item.defaultLabel) : item.labelKey;
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={isSidebarCollapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-950/50"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                } ${isSidebarCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition group-hover:scale-110 ${isActive ? "text-white" : "text-white/60"}`} />
                {!isSidebarCollapsed && <span className="truncate">{label}</span>}

                {/* Badge for Pending Orders */}
                {item.hasBadge && pendingOrdersCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] shadow-sm ${
                      isSidebarCollapsed
                        ? "absolute top-1 right-1 h-4 w-4"
                        : "ms-auto h-5 px-2"
                    }`}
                  >
                    {pendingOrdersCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="p-3 border-t border-white/10 bg-neutral-950/40 space-y-2">
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                المشرف العام
              </span>
              <button
                onClick={handleToggleLanguage}
                className="rounded-lg px-2 py-0.5 font-bold uppercase text-[11px] bg-white/10 text-white/80 hover:bg-white/20 transition"
              >
                {i18n.language === "ar" ? "EN" : "عربي"}
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
            title="تسجيل الخروج"
          >
            <CloseIcon className="h-4 w-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t("admin.logout", "تسجيل الخروج")}</span>}
          </button>
        </div>
      </aside>

      {/* ─── MOBILE TOP BAR (< lg) ─── */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-neutral-900/95 backdrop-blur-xl px-4 py-3 shadow-lg">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-xl object-cover ring-1 ring-primary-500/50 shadow" />
          <div>
            <h1 className="text-sm font-black bg-gradient-to-r from-primary-300 to-pink-300 bg-clip-text text-transparent">
              {t("site.title", "البيلسان")}
            </h1>
            <span className="text-[9px] text-white/50 block -mt-0.5">لوحة الإدارة</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition flex items-center gap-1"
          >
            <ShoppingBagIcon className="h-3.5 w-3.5 text-primary-400" />
            <span className="hidden sm:inline">المتجر</span>
          </Link>

          <button
            onClick={handleToggleLanguage}
            className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10"
          >
            {i18n.language === "ar" ? "EN" : "عربي"}
          </button>

          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="relative rounded-xl border border-white/15 bg-white/10 p-2 text-white hover:bg-white/20 transition"
            aria-label="Open navigation menu"
          >
            <MenuIcon className="h-5 w-5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-neutral-950">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ─── MOBILE DRAWER MODAL ─── */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div
            className={`relative z-10 w-4/5 max-w-xs bg-neutral-900 border-r border-white/10 p-5 flex flex-col justify-between shadow-2xl h-full ${
              isRTL ? "border-l border-r-0 mr-auto" : "ml-auto"
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <img src={logoImg} alt="Logo" className="h-8 w-8 rounded-xl object-cover" />
                  <span className="font-bold text-sm text-white">قائمة الإدارة</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="rounded-xl p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const label = item.labelKey.startsWith("admin.") ? t(item.labelKey, item.defaultLabel) : item.labelKey;
                  const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md shadow-primary-950/40"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary-300" />
                        <span>{label}</span>
                      </div>
                      {item.hasBadge && pendingOrdersCount > 0 && (
                        <span className="rounded-full bg-amber-400 text-neutral-950 font-black text-[10px] px-2 py-0.5">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                <ShoppingBagIcon className="h-4 w-4 text-primary-400" />
                زيارة المتجر
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
              >
                <CloseIcon className="h-4 w-4" />
                {t("admin.logout", "تسجيل الخروج")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-20 lg:pb-10">
        <Outlet />
      </main>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR (< lg) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 shadow-2xl flex items-center justify-around">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[10px] font-bold transition ${
              isActive ? "text-primary-400 scale-105" : "text-white/60 hover:text-white"
            }`
          }
        >
          <HomeIcon className="h-5 w-5" />
          <span>الرئيسية</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[10px] font-bold transition ${
              isActive ? "text-primary-400 scale-105" : "text-white/60 hover:text-white"
            }`
          }
        >
          <ClipboardIcon className="h-5 w-5" />
          <span>الطلبات</span>
          {pendingOrdersCount > 0 && (
            <span className="absolute top-1 right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-neutral-950">
              {pendingOrdersCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[10px] font-bold transition ${
              isActive ? "text-primary-400 scale-105" : "text-white/60 hover:text-white"
            }`
          }
        >
          <BoxIcon className="h-5 w-5" />
          <span>المنتجات</span>
        </NavLink>

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[10px] font-bold text-white/60 hover:text-white transition"
        >
          <MenuIcon className="h-5 w-5" />
          <span>المزيد</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;

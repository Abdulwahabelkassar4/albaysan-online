import React, { useEffect, useState, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoImg from "../assets/logo.jpg";
import {
  CloseIcon,
  MenuIcon,
  CartIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  LayersIcon,
  InfoIcon,
  PhoneIcon,
  TruckIcon,
  CalendarIcon,
  SparkleIcon,
} from "./icons.jsx";
import { useCart } from "../context/CartContext.jsx";
import { bounceFlower } from "../utils/animeEffects.js";

const navLinks = [
  { to: "/", key: "home", icon: HomeIcon },
  { to: "/shop", key: "shop", icon: ShoppingBagIcon },
  { to: "/offers", key: "offers", icon: TagIcon },
  { to: "/collections", key: "collections", icon: LayersIcon },
  { to: "/about", key: "about", icon: InfoIcon },
  { to: "/contact", key: "contact", icon: PhoneIcon },
  { to: "/delivery", key: "delivery", icon: TruckIcon },
  { to: "/reservation", key: "reservation", icon: CalendarIcon },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const cartBtnRef = useRef(null);

  const { totalQuantity, openCart } = useCart();
  const location = useLocation();

  const handleToggleLanguage = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
    localStorage.setItem("albaylsan_lang", next);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleCartClick = () => {
    if (cartBtnRef.current) {
      bounceFlower(cartBtnRef.current);
    }
    openCart();
  };

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-secondary-500 to-rose-500 text-white shadow-md shadow-rose-950/50 scale-[1.02]"
        : "text-rose-100/80 hover:bg-rose-500/15 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-xl border-b border-rose-300/15 shadow-xl shadow-neutral-950/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 text-white shrink-0 group">
          <div className="relative">
            <img
              src={logoImg}
              alt={t("brandName")}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-rose-400/60 group-hover:scale-105 group-hover:ring-rose-300 transition duration-300 md:h-13 md:w-13 shadow-md shadow-rose-950/50"
              draggable={false}
            />
            <span className="absolute -bottom-1 -right-1 text-xs">🌸</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-wide md:text-lg group-hover:text-rose-200 transition">
              {t("brandName")}
            </span>
            <span className="text-[11px] text-rose-300/70 hidden sm:inline">{t("navbar.femaleOnlyTag")}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Icons */}
        <nav className="hidden xl:flex items-center gap-1 bg-neutral-900/70 border border-rose-300/20 rounded-full px-3 py-1 backdrop-blur-md shrink-0 shadow-inner">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.key}
                to={link.to}
                className={linkClass}
                end={link.to === "/"}
              >
                {({ isActive }) => (
                  <>
                    <IconComponent className={`h-4 w-4 shrink-0 transition ${isActive ? "text-white" : "text-rose-300"}`} />
                    <span className="whitespace-nowrap">{t(`nav.${link.key}`)}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cart Icon Button with Girlish Bounce & Badge */}
          <button
            ref={cartBtnRef}
            onClick={handleCartClick}
            className="relative inline-flex items-center justify-center rounded-full border border-rose-300/30 bg-rose-500/10 p-2.5 text-white hover:bg-rose-500/20 hover:border-rose-300/60 transition shadow-sm"
            aria-label="فتح السلة"
            title="سلة التسوق"
          >
            <CartIcon className="h-5 w-5 text-rose-300" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-secondary-500 to-rose-500 text-[10px] font-black text-white shadow-md shadow-rose-950/60 animate-bounce">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleToggleLanguage}
            className="hidden sm:inline-flex rounded-full border border-rose-300/30 bg-white/5 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20 hover:border-rose-300/50 whitespace-nowrap"
          >
            {i18n.language === "ar" ? "English" : "العربية"}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="inline-flex items-center justify-center rounded-full border border-rose-300/30 p-2.5 text-white xl:hidden hover:bg-rose-500/20"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <CloseIcon className="h-5 w-5 text-rose-300" /> : <MenuIcon className="h-5 w-5 text-rose-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <nav className="xl:hidden border-t border-rose-300/20 bg-neutral-950/98 px-4 py-4 backdrop-blur-xl animate-fade-in-up">
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <NavLink
                  key={link.key}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setIsOpen(false)}
                  end={link.to === "/"}
                >
                  {({ isActive }) => (
                    <>
                      <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-rose-300"}`} />
                      <span className="whitespace-nowrap">{t(`nav.${link.key}`)}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-rose-300/20 flex justify-center sm:hidden">
            <button
              onClick={handleToggleLanguage}
              className="rounded-full border border-rose-300/30 bg-rose-500/10 px-5 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
            >
              {i18n.language === "ar" ? "English" : "العربية"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

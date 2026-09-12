import { useEffect, useState } from "react";
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
} from "./icons.jsx";
import { useCart } from "../context/CartContext.jsx";

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

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition duration-200 ${
      isActive
        ? "bg-primary-600 text-white shadow-md shadow-primary-950/40"
        : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-white/10 shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 text-white shrink-0 group">
          <img
            src={logoImg}
            alt={t("brandName")}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-primary-500/50 group-hover:scale-105 transition duration-300 md:h-13 md:w-13"
            draggable={false}
          />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-wide md:text-lg group-hover:text-primary-300 transition">
              {t("brandName")}
            </span>
            <span className="text-[11px] text-white/60 hidden sm:inline">{t("navbar.femaleOnlyTag")}</span>
          </div>
        </Link>

        {/* Desktop Navigation Links with Icons - Single Line (xl breakpoint prevents wrapping) */}
        <nav className="hidden xl:flex items-center gap-1 bg-neutral-800/50 border border-white/10 rounded-full px-2.5 py-1 backdrop-blur-sm shrink-0">
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
                    <IconComponent className={`h-4 w-4 shrink-0 transition ${isActive ? "text-white" : "text-pink-400 group-hover:scale-110"}`} />
                    <span className="whitespace-nowrap">{t(`nav.${link.key}`)}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Header Action Controls (Cart Icon Badge, Language Toggle, Mobile Hamburger Button) */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Cart Icon Button with Badge */}
          <button
            onClick={openCart}
            className="relative inline-flex items-center justify-center rounded-full border border-white/15 bg-neutral-800/80 p-2.5 text-white hover:bg-neutral-800 hover:border-pink-400 transition"
            aria-label="فتح السلة"
            title="سلة التسوق"
          >
            <CartIcon className="h-5 w-5 text-pink-400" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-md animate-bounce">
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleToggleLanguage}
            className="hidden sm:inline-flex rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10 whitespace-nowrap"
          >
            {i18n.language === "ar" ? "English" : "العربية"}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="inline-flex items-center justify-center rounded-full border border-white/20 p-2.5 text-white xl:hidden hover:bg-white/10"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle navigation"
          >
            {isOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5 text-pink-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <nav className="xl:hidden border-t border-white/10 bg-neutral-900/98 px-4 py-4 backdrop-blur-xl animate-fade-in-up">
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
                      <IconComponent className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-pink-400"}`} />
                      <span className="whitespace-nowrap">{t(`nav.${link.key}`)}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex justify-center sm:hidden">
            <button
              onClick={handleToggleLanguage}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
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

import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logoImg from "../assets/logo.jpg";
import { CloseIcon, MenuIcon } from "./icons.jsx";

const navLinks = [
  { to: "/", key: "home" },
  { to: "/shop", key: "shop" },
  { to: "/collections", key: "collections" },
  { to: "/about", key: "about" },
  { to: "/contact", key: "contact" },
  { to: "/delivery", key: "delivery" },
  { to: "/reservation", key: "reservation" },
];

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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
    `rounded-full px-4 py-2 text-sm font-semibold transition hover:bg-white/10 ${
      isActive ? "bg-white/20 text-white" : "text-white/80"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-white">
          <img
            src={logoImg}
            alt={t("brandName")}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-primary-500/50 md:h-16 md:w-16"
            draggable={false}
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-wide">{t("brandName")}</span>
            <span className="text-xs text-white/70">{t("navbar.femaleOnlyTag")}</span>
          </div>
        </Link>
        <button
          className="inline-flex items-center rounded-full border border-white/20 px-3 py-2 text-sm text-white md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="main-navigation"
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <nav
          id="main-navigation"
          className={`${
            isOpen ? "flex" : "hidden"
          } absolute left-0 right-0 top-full flex-col items-center gap-3 border-b border-white/10 bg-neutral-900/95 px-6 py-4 md:static md:flex md:flex-row md:border-none md:bg-transparent md:py-0`}
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.key}
              to={link.to}
              className={linkClass}
              onClick={() => setIsOpen(false)}
              end={link.to === "/"}
            >
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
          <button
            onClick={handleToggleLanguage}
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {i18n.language === "ar" ? "English" : "العربية"}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

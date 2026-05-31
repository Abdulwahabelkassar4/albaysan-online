import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Toast from "./components/Toast.jsx";
import CartModal from "./components/CartModal.jsx";
import CartButton from "./components/CartButton.jsx";
import AppRoutes from "./AppRoutes.jsx";
import { WhatsAppIcon } from "./components/icons.jsx";
import { buildWhatsAppLink } from "./config/contact.js";
import BackendWarmupBanner from "./components/BackendWarmupBanner.jsx";

const App = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const floralElements = document.querySelectorAll(".animate-floralFade");
    if (!floralElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-10");
          }
        });
      },
      { threshold: 0.2 }
    );

    floralElements.forEach((element) => observer.observe(element));

    return () => {
      floralElements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, []);

  const whatsappLink = useMemo(
    () =>
      buildWhatsAppLink({
        message: t("whatsapp.prefill", {
          defaultValue: "Hello, I would like to shop from Albaysan Online",
        }),
      }),
    [t, i18n.language]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-900/80 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-right-bottom bg-contain opacity-0 animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <BackendWarmupBanner />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
        {!isAdminRoute && <CartModal />}
        {!isAdminRoute && <CartButton />}
        <Toast />
        {!isAdminRoute && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-900/40 transition hover:scale-110"
            aria-label={t("product.contactWhatsapp")}
          >
            <WhatsAppIcon className="h-7 w-7" />
          </a>
        )}
      </div>
    </div>
  );
};

export default App;

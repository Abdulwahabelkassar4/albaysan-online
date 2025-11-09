import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Toast from "./components/Toast.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CartModal from "./components/CartModal.jsx";
import CartButton from "./components/CartButton.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Collections from "./pages/Collections.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Delivery from "./pages/Delivery.jsx";
import Reservation from "./pages/Reservation.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

const App = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("albaylsan_token"))
  );

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
      "https://wa.me/962798522935?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7.%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D8%A8%D8%A7%D9%84%D8%AA%D8%B3%D9%88%D9%82%20%D9%85%D9%86%20%D9%85%D8%AA%D8%AC%D8%B1%20%D8%A7%D9%84%D8%A8%D9%8A%D9%84%D8%B3%D8%A7%D9%86",
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-900/80 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/assets/background-floral.png')] bg-no-repeat bg-right-bottom bg-contain opacity-0 animate-floralFade"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="/admin/login"
              element={<AdminLogin onLogin={() => setIsAuthenticated(true)} />}
            />
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route
                path="/admin/dashboard"
                element={<AdminDashboard onLogout={() => setIsAuthenticated(false)} />}
              />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        <CartModal />
        <CartButton />
        <Toast />
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-xl shadow-emerald-900/40 transition hover:scale-110"
          aria-label="التواصل عبر واتساب"
        >
          واتس
        </a>
      </div>
    </div>
  );
};

export default App;
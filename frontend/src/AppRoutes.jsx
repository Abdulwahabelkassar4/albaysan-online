import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Offers from "./pages/Offers.jsx";
import Collections from "./pages/Collections.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Delivery from "./pages/Delivery.jsx";
import Reservation from "./pages/Reservation.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/offers" element={<Offers />} />
    <Route path="/collections" element={<Collections />} />
    <Route path="/product/:id" element={<ProductDetails />} />
    <Route path="/products/:id" element={<ProductDetails />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/delivery" element={<Delivery />} />
    <Route path="/reservation" element={<Reservation />} />
    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
    </Route>
  </Routes>
);

export default AppRoutes;

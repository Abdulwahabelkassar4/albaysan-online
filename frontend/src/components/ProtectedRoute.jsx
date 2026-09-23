import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";
import AdminLayout from "./admin/AdminLayout.jsx";

const ProtectedRoute = () => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      const token = localStorage.getItem("albaylsan_token");

      if (!token) {
        if (isMounted) {
          setStatus("unauthorized");
        }
        return;
      }

      try {
        await axiosClient.get("/api/admin/me");
        if (isMounted) {
          setStatus("authorized");
        }
      } catch (error) {
        localStorage.removeItem("albaylsan_token");
        if (isMounted) {
          setStatus("unauthorized");
        }
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
          <span className="text-sm text-white/70 font-semibold">جارٍ التحقق من صلاحيات الإدارة…</span>
        </div>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
};

export default ProtectedRoute;
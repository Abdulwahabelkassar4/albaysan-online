import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axiosClient from "../api/axiosClient.js";

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
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/80">
        جارٍ التحقق…
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
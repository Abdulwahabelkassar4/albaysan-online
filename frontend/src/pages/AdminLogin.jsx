import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginAdmin } from "../api/auth.js";
import { useToast } from "../context/ToastContext.jsx";

const AdminLogin = ({ onLogin }) => {
  const { register, handleSubmit, formState } = useForm();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const onSubmit = async (values) => {
    try {
      const payload = {
        username: String(values.username || "").trim(),
        password: values.password,
      };
      const data = await loginAdmin(payload);
      localStorage.setItem("albaylsan_token", data.token);
      showToast(t("admin.loginSuccess"), "success");
      onLogin?.();
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message && typeof error.response.data.message === "string"
          ? error.response.data.message
          : t("admin.loginError");
      showToast(message, "error");
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
      <div className={`glass-card space-y-6 p-10 text-white ${isRTL ? "text-right" : "text-left"}`}>
        <h1 className="text-2xl font-bold">{t("admin.loginTitle")}</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm text-white/70">{t("forms.loginUsername")}</label>
            <input
              {...register("username", { required: true })}
              className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                isRTL ? "text-right" : "text-left"
              }`}
            />
            {formState.errors.username && (
              <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">{t("forms.loginPassword")}</label>
            <input
              type="password"
              {...register("password", { required: true })}
              className={`w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300 ${
                isRTL ? "text-right" : "text-left"
              }`}
            />
            {formState.errors.password && (
              <span className="mt-1 block text-xs text-rose-300">{t("forms.required")}</span>
            )}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? t("forms.loginSubmitting") : t("forms.loginSubmit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


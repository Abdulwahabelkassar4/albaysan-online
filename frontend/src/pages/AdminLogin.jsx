import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/auth.js";
import { useToast } from "../context/ToastContext.jsx";

const AdminLogin = ({ onLogin }) => {
  const { register, handleSubmit, formState } = useForm();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const onSubmit = async (values) => {
    try {
      const data = await loginAdmin(values);
      localStorage.setItem("albaylsan_token", data.token);
      showToast("تم تسجيل الدخول بنجاح", "success");
      onLogin?.();
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      showToast(error.response?.data?.message || "بيانات الدخول غير صحيحة", "error");
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-20">
      <div className="glass-card space-y-6 p-10 text-white">
        <h1 className="text-2xl font-bold">تسجيل دخول المشرف</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="mb-2 block text-sm text-white/70">اسم المستخدم</label>
            <input
              {...register("username", { required: true })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            {formState.errors.username && (
              <span className="mt-1 block text-xs text-rose-300">هذا الحقل مطلوب</span>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">كلمة المرور</label>
            <input
              type="password"
              {...register("password", { required: true })}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            {formState.errors.password && (
              <span className="mt-1 block text-xs text-rose-300">هذا الحقل مطلوب</span>
            )}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


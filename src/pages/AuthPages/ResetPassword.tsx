import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import api from "../../api/api";
import AuthLayout from "./AuthPageLayout";
import PageMeta from "../../components/common/PageMeta";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo restablecer la contraseña. El enlace puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <PageMeta title="Enlace inválido | PlacesHub" description="" />
        <AuthLayout>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
              <FiAlertCircle size={32} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Enlace inválido</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Este enlace de recuperación no es válido o ha expirado.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Nueva contraseña | PlacesHub"
        description="Establece una nueva contraseña para tu cuenta"
      />
      <AuthLayout>
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              <FiLock size={12} />
              Restablecer contraseña
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Nueva contraseña
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Elige una contraseña segura de al menos 6 caracteres.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-6 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 rounded-2xl text-center">
                <div className="w-14 h-14 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                  <FiCheckCircle size={28} className="text-success-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">¡Contraseña actualizada!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tu contraseña fue cambiada correctamente. Serás redirigido al inicio de sesión en unos segundos.
                  </p>
                </div>
              </div>
              <Link
                to="/signin"
                className="block w-full text-center py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Ir a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                  <FiAlertCircle size={15} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/25 disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiLock size={15} />
                    Establecer nueva contraseña
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-7 text-center">
              <Link
                to="/signin"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
              >
                <FiArrowLeft size={14} />
                Volver a Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      </AuthLayout>
    </>
  );
}

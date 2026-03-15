import { useState } from "react";
import { Link } from "react-router";
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import api from "../../api/api";
import AuthLayout from "./AuthPageLayout";
import PageMeta from "../../components/common/PageMeta";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudo procesar la solicitud. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Recuperar contraseña | PlacesHub"
        description="Recupera el acceso a tu cuenta en PlacesHub"
      />
      <AuthLayout>
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold">
              <FiMail size={12} />
              Recuperación de cuenta
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {sent ? (
            /* Success state */
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-6 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 rounded-2xl text-center">
                <div className="w-14 h-14 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center">
                  <FiCheckCircle size={28} className="text-success-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">Revisa tu correo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Si <span className="font-semibold text-gray-700 dark:text-gray-200">{email}</span> está registrado, recibirás un enlace de recuperación en los próximos minutos.
                  </p>
                </div>
              </div>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                ¿No llegó el correo? Revisa tu carpeta de spam o{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  intenta de nuevo
                </button>
                .
              </p>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="tu@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  required
                  autoFocus
                />
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
                    Enviando...
                  </>
                ) : (
                  <>
                    <FiMail size={15} />
                    Enviar enlace de recuperación
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-7 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
            >
              <FiArrowLeft size={14} />
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

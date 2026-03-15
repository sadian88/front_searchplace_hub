import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiMail, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUnverifiedEmail('');
    setResendDone(false);
    try {
      const response = await api.post('/auth/login', { username, password });
      await login(response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(err.response.data.email || username);
      } else {
        setError(err.response?.data?.message || 'Usuario o contraseña incorrectos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendDone(false);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
    } catch {
      // endpoint siempre retorna 200
    } finally {
      setResendDone(true);
      setResending(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Plataforma B2B de leads
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
          Bienvenido de vuelta
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa con tu email para acceder a PlacesHub.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Email
          </label>
          <input
            type="email"
            placeholder="tu@empresa.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Contraseña
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
        </div>

        {/* Error genérico */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
            <FiAlertCircle size={15} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Email no verificado */}
        {unverifiedEmail && (
          <div className="px-4 py-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5">
              <FiMail size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Debes verificar tu email antes de ingresar. Revisa{" "}
                <span className="font-semibold">{unverifiedEmail}</span>.
              </p>
            </div>
            {resendDone ? (
              <div className="flex items-center gap-1.5 text-xs text-success-600 dark:text-success-400 font-semibold">
                <FiCheckCircle size={13} />
                Correo de verificación reenviado
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline disabled:opacity-60"
              >
                {resending
                  ? <FiRefreshCw size={12} className="animate-spin" />
                  : <FiRefreshCw size={12} />
                }
                {resending ? "Reenviando..." : "Reenviar correo de verificación"}
              </button>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="relative overflow-hidden w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-600/25 disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              Entrar al Hub
              <FiArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </button>
      </form>

      {/* Footer link */}
      <p className="mt-7 text-center text-sm text-gray-500 dark:text-gray-400">
        ¿No tienes cuenta?{" "}
        <Link
          to="/signup"
          className="text-brand-600 dark:text-brand-400 font-semibold hover:underline transition-colors"
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  );
}

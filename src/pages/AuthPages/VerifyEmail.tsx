import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { FiCheckCircle, FiXCircle, FiLoader, FiCreditCard } from "react-icons/fi";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthPageLayout";
import PageMeta from "../../components/common/PageMeta";

type Status = "verifying" | "success" | "redirecting_payment" | "error";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { login } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("No se encontró el token de verificación en el enlace.");
      setStatus("error");
      return;
    }

    let cancelled = false;

    api.post("/auth/verify-email", { token })
      .then(async (res) => {
        if (cancelled) return;
        await login(res.data.token);

        // Si había un plan pendiente de pago, retomar el flujo de MP
        const pendingPlan = localStorage.getItem('pending_plan');
        if (pendingPlan) {
          localStorage.removeItem('pending_plan');
          setStatus("redirecting_payment");
          try {
            const prefRes = await api.post<{ init_point: string }>("/payments/create-preference", {
              planName: pendingPlan,
            });
            window.location.href = prefRes.data.init_point;
          } catch {
            // Si falla el pago, igual entrar al dashboard — pueden reintentar desde Perfil
            navigate("/dashboard");
          }
          return;
        }

        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 3000);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(
          err.response?.data?.message ||
          "El enlace de verificación no es válido o ya fue usado."
        );
        setStatus("error");
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <>
      <PageMeta
        title="Verificando cuenta | PlacesHub"
        description="Activando tu cuenta en PlacesHub"
      />
      <AuthLayout>
        <div className="text-center space-y-6">

          {status === "verifying" && (
            <>
              <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mx-auto">
                <FiLoader size={30} className="text-brand-500 animate-spin" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Verificando tu cuenta
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Un momento, estamos activando tu cuenta...
                </p>
              </div>
            </>
          )}

          {status === "redirecting_payment" && (
            <>
              <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mx-auto">
                <FiCreditCard size={30} className="text-brand-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  ¡Cuenta verificada!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Redirigiendo a MercadoPago para completar tu suscripción...
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-brand-500 font-semibold">
                  <span className="inline-block w-3 h-3 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                  Preparando el pago...
                </div>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center mx-auto">
                <FiCheckCircle size={32} className="text-success-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  ¡Cuenta verificada!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Tu cuenta ha sido activada correctamente. Serás redirigido al dashboard en unos segundos.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-brand-500 font-semibold">
                  <span className="inline-block w-3 h-3 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" />
                  Redirigiendo...
                </div>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Ir al dashboard ahora
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
                <FiXCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Enlace no válido
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {errorMsg}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  to="/signup"
                  className="block w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors text-sm"
                >
                  Crear cuenta nueva
                </Link>
                <Link
                  to="/signin"
                  className="block w-full py-2.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Iniciar sesión
                </Link>
              </div>
            </>
          )}

        </div>
      </AuthLayout>
    </>
  );
}

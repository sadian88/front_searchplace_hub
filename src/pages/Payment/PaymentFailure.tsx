import { useNavigate, useSearchParams } from "react-router";
import { FiXCircle, FiRefreshCw, FiHome } from "react-icons/fi";
import api from "../../api/api";
import { useState } from "react";

const PLAN_LABELS: Record<string, string> = {
  basic:   "Basic",
  medium:  "Medium",
  pro:     "Pro",
  standard:"Standard",
};

export default function PaymentFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  // Extract plan from external_reference (format: "userId|planName")
  const externalRef = searchParams.get("external_reference") ?? "";
  const planName = externalRef.split("|")[1] ?? "";
  const planLabel = PLAN_LABELS[planName] ?? planName;

  const handleRetry = async () => {
    if (!planName) {
      navigate("/profile");
      return;
    }
    setRetrying(true);
    setRetryError("");
    try {
      const { data } = await api.post<{ init_point: string }>("/payments/create-subscription", {
        planName,
      });
      window.location.href = data.init_point;
    } catch (err: any) {
      setRetryError(err.response?.data?.message || "No se pudo reiniciar el pago. Intenta desde tu perfil.");
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center">
            <FiXCircle size={36} className="text-error-500" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Pago no completado
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-1">
          {planLabel
            ? <>No se procesó el pago para el plan <span className="font-semibold text-gray-700 dark:text-gray-200">{planLabel}</span>.</>
            : "No pudimos procesar tu pago."
          }
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
          Puedes intentarlo de nuevo o volver a tu cuenta.
        </p>

        {retryError && (
          <p className="mb-4 text-sm text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-lg px-4 py-2">
            {retryError}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {planName && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors"
            >
              {retrying
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <FiRefreshCw size={16} />
              }
              {retrying ? "Redirigiendo..." : `Reintentar pago${planLabel ? ` — Plan ${planLabel}` : ""}`}
            </button>
          )}
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Volver a mi perfil
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FiHome size={13} /> Ir al dashboard
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Procesado por</span>
          <img src="/images/MP_Icono.png.png" alt="MercadoPago" className="w-6 h-6 object-contain" />
          <div className="bg-white rounded-lg px-2 py-0.5 border border-gray-200">
            <img src="/images/mp-logo.png" alt="" className="h-4 w-auto object-contain" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

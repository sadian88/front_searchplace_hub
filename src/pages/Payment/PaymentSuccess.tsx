import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

export default function PaymentSuccess() {
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);
  const [planReady, setPlanReady] = useState(false);
  const initialPlanIdRef = useRef(user?.plan?.id);

  // Poll refreshUser up to 8 times (every 2s) until the plan actually changes
  useEffect(() => {
    if (planReady) return;

    const timer = setTimeout(async () => {
      await refreshUser();
      setAttempts(a => a + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [attempts, planReady, refreshUser]);

  // Detect plan change
  useEffect(() => {
    if (user?.plan && user.plan.id !== initialPlanIdRef.current) {
      setPlanReady(true);
    }
    // After 8 attempts (~16s) give up waiting and show button anyway
    if (attempts >= 8) setPlanReady(true);
  }, [user, attempts]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
            <FiCheckCircle size={36} className="text-success-500" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          ¡Pago exitoso!
        </h1>

        {planReady ? (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Tu plan ha sido actualizado a{" "}
            <span className="font-bold text-gray-800 dark:text-white">
              {user?.plan?.display_name}
            </span>
            . Ya puedes disfrutar de todos los beneficios.
          </p>
        ) : (
          <div className="mb-6 space-y-3">
            <p className="text-gray-500 dark:text-gray-400">
              Confirmando tu pago con MercadoPago...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-brand-500 font-semibold">
              <span className="inline-block w-3.5 h-3.5 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
              Verificando ({Math.min(attempts + 1, 8)}/8)
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          disabled={!planReady}
          className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          Ir al dashboard
        </button>

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

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiClock } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 12; // 60 seconds

export default function PaymentPending() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const polls = useRef(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);

    const poll = setInterval(async () => {
      polls.current += 1;
      await refreshUser();
      if (polls.current >= MAX_POLLS) clearInterval(poll);
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(poll);
    };
  }, [refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <FiClock size={36} className="text-amber-500" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Pago pendiente
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Tu pago está siendo procesado{dots} Te notificaremos cuando se confirme.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors"
          >
            Ir al dashboard
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Ver mi perfil
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Procesado por</span>
          <div className="bg-white rounded-lg px-2 py-1 border border-gray-200">
            <img src="/images/mp-logo.png" alt="MercadoPago" className="h-5 w-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

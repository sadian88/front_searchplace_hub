import { useNavigate } from "react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-error-50 dark:bg-error-500/10 flex items-center justify-center">
            <XCircle size={36} className="text-error-500" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Pago fallido
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          No pudimos procesar tu pago. Por favor intenta de nuevo o elige otro método de pago.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
          >
            Volver a mi perfil
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

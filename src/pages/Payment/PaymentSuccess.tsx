import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function PaymentSuccess() {
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    refreshUser().finally(() => setRefreshed(true));
  }, [refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
            <CheckCircle size={36} className="text-success-500" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Pago exitoso
        </h1>

        {refreshed && user?.plan ? (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Tu plan ha sido actualizado a{" "}
            <span className="font-bold text-gray-800 dark:text-white">
              {user.plan.display_name}
            </span>
            . Ya puedes disfrutar de todos los beneficios.
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Actualizando tu plan...
          </p>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
        >
          Ir al dashboard
        </button>
      </div>
    </div>
  );
}

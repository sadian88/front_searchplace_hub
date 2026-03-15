import { useState, useEffect } from "react";
import { FiCheckCircle, FiShield, FiZap, FiTrendingUp, FiArrowUpCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

interface Plan {
  id: number;
  name: string;
  display_name: string;
  price_monthly: number;
}

function PlanFeature({
  label,
  value,
  active,
}: {
  label: string;
  value?: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center
          ${active
            ? "bg-brand-50 dark:bg-brand-500/10"
            : "bg-gray-100 dark:bg-gray-700"
          }`}
      >
        <FiCheckCircle
          size={12}
          className={active ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500"}
        />
      </div>
      <span className={`text-sm ${active ? "text-gray-700 dark:text-gray-200" : "text-gray-400 dark:text-gray-500 line-through"}`}>
        {label}
        {value && active && (
          <span className="ml-1 font-semibold text-gray-900 dark:text-white">
            {value}
          </span>
        )}
      </span>
    </div>
  );
}

const planColors: Record<string, { ring: string; badge: string; icon: string }> = {
  free:     { ring: "border-gray-200 dark:border-gray-700",         badge: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",           icon: "text-gray-500" },
  standard: { ring: "border-brand-200 dark:border-brand-500/30",    badge: "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300",     icon: "text-brand-600 dark:text-brand-400" },
  pro:      { ring: "border-orange-200 dark:border-orange-500/30",  badge: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300", icon: "text-orange-500" },
  basic:    { ring: "border-brand-200 dark:border-brand-500/30",    badge: "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300",     icon: "text-brand-600 dark:text-brand-400" },
  medium:   { ring: "border-purple-200 dark:border-purple-500/30",  badge: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300", icon: "text-purple-500" },
};

const supportLabel: Record<string, string> = {
  email:     "Soporte por email",
  priority:  "Soporte prioritario",
  dedicated: "Account manager dedicado",
};

export default function PlanCard({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const plan = user?.plan;
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  useEffect(() => {
    api.get<Plan[]>('/plans').then(({ data }) => setAvailablePlans(data)).catch(() => {});
  }, []);

  const handleUpgrade = async (planName: string) => {
    setUpgradingTo(planName);
    try {
      const { data } = await api.post<{ init_point: string }>('/payments/create-preference', { planName });
      window.location.href = data.init_point;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al iniciar el pago.';
      alert(msg);
      setUpgradingTo(null);
    }
  };

  if (!plan) return null;

  const isUnlimited = (val: number | null) => val === null;
  const fmtLimit = (val: number | null) => isUnlimited(val) ? "Ilimitado" : String(val);
  const colors = planColors[plan.name] ?? planColors.free;

  const upgradeable = availablePlans.filter(p => p.price_monthly > (plan.price_monthly ?? 0));

  /* ── compact mode: only limits grid + upgrade buttons ── */
  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden space-y-0">
        {/* Límites */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5 mb-1">
                <FiTrendingUp size={12} className={colors.icon} />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Leads / búsqueda
                </span>
              </div>
              <p className="text-xl font-extrabold text-gray-800 dark:text-white">
                {fmtLimit(plan.max_leads_per_search)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-1.5 mb-1">
                <FiZap size={12} className={colors.icon} />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Búsquedas simult.
                </span>
              </div>
              <p className="text-xl font-extrabold text-gray-800 dark:text-white">
                {fmtLimit(plan.max_concurrent_searches)}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade buttons */}
        {upgradeable.length > 0 && (
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Actualizar plan
            </p>
            {upgradeable.map((p) => (
              <button
                key={p.name}
                onClick={() => handleUpgrade(p.name)}
                disabled={upgradingTo !== null}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 border border-brand-100 dark:border-brand-500/20 rounded-xl hover:from-brand-100 hover:to-brand-200/50 dark:hover:from-brand-500/20 dark:hover:to-brand-500/10 disabled:opacity-60 transition-all"
              >
                <div className="flex items-center gap-2">
                  <FiArrowUpCircle size={15} className="text-brand-600 dark:text-brand-400" />
                  <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
                    Actualizar a {p.display_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded px-1.5 py-0.5 border border-gray-200 shrink-0">
                    <img src="/images/mp-logo.png" alt="MercadoPago" className="h-4 w-auto object-contain" />
                  </div>
                  <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                    ${p.price_monthly}/mes
                  </span>
                  {upgradingTo === p.name && (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── full mode (Profile) ── */
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden ${colors.ring}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiShield size={18} className={colors.icon} />
          <h2 className="font-bold text-gray-800 dark:text-white text-sm">Plan actual</h2>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
          {plan.display_name}
        </span>
      </div>

      {/* Precio + fecha de corte */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            ${plan.price_monthly}
          </span>
          <span className="text-sm text-gray-400 mb-1">/ mes</span>
        </div>
        {plan.price_monthly === 0 ? (
          <p className="text-xs text-gray-400 mt-0.5">Sin costo, para siempre</p>
        ) : plan.expires_at ? (
          <p className="text-xs text-gray-400 mt-1">
            Fecha de corte:{" "}
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              {new Date(plan.expires_at).toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        ) : null}
      </div>

      {/* Límites y características */}
      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <FiTrendingUp size={13} className={colors.icon} />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Leads / búsqueda
              </span>
            </div>
            <p className="text-lg font-extrabold text-gray-800 dark:text-white">
              {fmtLimit(plan.max_leads_per_search)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <FiZap size={13} className={colors.icon} />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Búsquedas simult.
              </span>
            </div>
            <p className="text-lg font-extrabold text-gray-800 dark:text-white">
              {fmtLimit(plan.max_concurrent_searches)}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <PlanFeature label="Exportación CSV" active={plan.can_export_csv} />
          <PlanFeature label="Acceso API"      active={plan.can_export_api} />
          <PlanFeature label={supportLabel[plan.support_level] ?? "Soporte"} active={true} />
        </div>
      </div>

      {/* CTA upgrade */}
      {upgradeable.length > 0 && (
        <div className="px-6 pb-6 space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Actualizar plan
          </p>
          {upgradeable.map((p) => (
            <button
              key={p.name}
              onClick={() => handleUpgrade(p.name)}
              disabled={upgradingTo !== null}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 border border-brand-100 dark:border-brand-500/20 rounded-xl hover:from-brand-100 hover:to-brand-200/50 dark:hover:from-brand-500/20 dark:hover:to-brand-500/10 disabled:opacity-60 transition-all"
            >
              <div className="flex items-center gap-2">
                <FiArrowUpCircle size={16} className="text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
                  Actualizar a {p.display_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                  ${p.price_monthly}/mes
                </span>
                {upgradingTo === p.name && (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

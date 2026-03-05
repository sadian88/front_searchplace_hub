import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Edit3,
  Save,
  X,
  CheckCircle,
  Shield,
  Zap,
  Code2,
  Headphones,
  TrendingUp,
  ArrowUpCircle,
  Loader2,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

/* ── helpers ─────────────────────────────────────────────────────────────── */

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
        <CheckCircle
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

/* ── sección datos básicos ───────────────────────────────────────────────── */

function BasicDataCard() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // Sincroniza el form cuando llega el usuario del contexto
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    if (e.target.name === "email") setEmailError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
    setEmailError("");
    if (user) {
      setForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setEmailError("");
    try {
      await api.put("/auth/profile", {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
      });
      await refreshUser();
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const msg: string = err.response?.data?.message || "Error al guardar los cambios.";
      const field: string | undefined = err.response?.data?.field;
      if (field === "email") setEmailError(msg);
      else setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?"
    : "?";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User size={18} className="text-brand-600 dark:text-brand-400" />
          <h2 className="font-bold text-gray-800 dark:text-white text-sm">
            Datos básicos
          </h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
          >
            <Edit3 size={13} />
            Editar
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg mb-3">
          {initials}
        </div>
        {!editing && (
          <>
            <p className="font-bold text-gray-800 dark:text-white text-base">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.email}
            </p>
          </>
        )}
      </div>

      {/* Form / display */}
      <div className="p-6">
        {success && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-lg text-sm text-brand-700 dark:text-brand-300">
            <CheckCircle size={15} />
            Perfil actualizado correctamente.
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Apellido
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                  emailError
                    ? "border-error-400 dark:border-error-500 focus:ring-error-500"
                    : "border-gray-200 dark:border-gray-600 focus:ring-brand-500"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-error-500">{emailError}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save size={14} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            {[
              { label: "Nombre", value: user?.first_name },
              { label: "Apellido", value: user?.last_name },
              { label: "Email", value: user?.email, icon: <Mail size={13} className="text-gray-400" /> },
            ].map(({ label, value, icon }) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                  {label}
                </dt>
                <dd className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-white">
                  {icon}
                  {value || <span className="text-gray-400 italic">Sin información</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/* ── sección plan actual ─────────────────────────────────────────────────── */

interface Plan {
  id: number;
  name: string;
  display_name: string;
  price_monthly: number;
}

function PlanCard() {
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
  const fmtLimit = (val: number | null) =>
    isUnlimited(val) ? "Ilimitado" : String(val);

  const supportLabel: Record<string, string> = {
    email: "Soporte por email",
    priority: "Soporte prioritario",
    dedicated: "Account manager dedicado",
  };

  const planColors: Record<string, { ring: string; badge: string; icon: string }> = {
    free:     { ring: "border-gray-200 dark:border-gray-700",   badge: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",       icon: "text-gray-500" },
    standard: { ring: "border-brand-200 dark:border-brand-500/30", badge: "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300", icon: "text-brand-600 dark:text-brand-400" },
    pro:      { ring: "border-orange-200 dark:border-orange-500/30", badge: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300", icon: "text-orange-500" },
  };

  const colors = planColors[plan.name] ?? planColors.free;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden ${colors.ring}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={18} className={colors.icon} />
          <h2 className="font-bold text-gray-800 dark:text-white text-sm">
            Plan actual
          </h2>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors.badge}`}>
          {plan.display_name}
        </span>
      </div>

      {/* Precio */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
            ${plan.price_monthly}
          </span>
          <span className="text-sm text-gray-400 mb-1">/ mes</span>
        </div>
        {plan.price_monthly === 0 && (
          <p className="text-xs text-gray-400 mt-0.5">Sin costo, para siempre</p>
        )}
      </div>

      {/* Límites y características */}
      <div className="px-6 py-5 space-y-5">
        {/* Límites numéricos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className={colors.icon} />
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
              <Zap size={13} className={colors.icon} />
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Búsquedas simult.
              </span>
            </div>
            <p className="text-lg font-extrabold text-gray-800 dark:text-white">
              {fmtLimit(plan.max_concurrent_searches)}
            </p>
          </div>
        </div>

        {/* Características booleanas */}
        <div className="space-y-2.5">
          <PlanFeature
            label="Exportación CSV"
            active={plan.can_export_csv}
          />
          <PlanFeature
            label="Acceso API"
            active={plan.can_export_api}
          />
          <PlanFeature
            label={supportLabel[plan.support_level] ?? "Soporte"}
            active={true}
          />
        </div>
      </div>

      {/* CTA upgrade — planes superiores al actual */}
      {(() => {
        const upgradeable = availablePlans.filter(
          (p) => p.price_monthly > (plan.price_monthly ?? 0)
        );
        if (upgradeable.length === 0) return null;
        return (
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
                  <ArrowUpCircle size={16} className="text-brand-600 dark:text-brand-400" />
                  <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
                    Actualizar a {p.display_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                    ${p.price_monthly}/mes
                  </span>
                  {upgradingTo === p.name && (
                    <Loader2 size={14} className="animate-spin text-brand-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}

/* ── sección uso del plan ────────────────────────────────────────────────── */

interface MonthlyUsage { used: number; limit: number | null; percent: number | null }

function UsageCard() {
  const { user } = useAuth();
  const plan = user?.plan;
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage | null>(null);
  const [runningCount, setRunningCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usageRes, runningRes] = await Promise.all([
          api.get('/executions/usage/monthly'),
          api.get('/executions/running-count'),
        ]);
        setMonthlyUsage(usageRes.data);
        setRunningCount(runningRes.data.running);
      } catch { /* silently fail */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const barColor = (pct: number) =>
    pct >= 90 ? 'bg-error-500' : pct >= 70 ? 'bg-amber-400' : 'bg-success-500';

  const maxConcurrent = plan?.max_concurrent_searches ?? null;
  const concurrentPct =
    maxConcurrent !== null && runningCount !== null
      ? Math.min(100, Math.round((runningCount / maxConcurrent) * 100))
      : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
        <TrendingUp size={18} className="text-brand-600 dark:text-brand-400" />
        <h2 className="font-bold text-gray-800 dark:text-white text-sm">Uso del plan</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">— mes actual</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-brand-200 dark:border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8">

          {/* Leads mensuales */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Leads este mes
              </span>
              {monthlyUsage?.percent !== null && monthlyUsage?.percent !== undefined ? (
                <span className={`text-xs font-bold ${
                  monthlyUsage.percent >= 90 ? 'text-error-500'
                  : monthlyUsage.percent >= 70 ? 'text-amber-500'
                  : 'text-success-600 dark:text-success-400'
                }`}>
                  {monthlyUsage.percent}%
                </span>
              ) : (
                <span className="text-xs font-bold text-brand-500 dark:text-brand-400">∞ ilimitado</span>
              )}
            </div>

            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              {monthlyUsage?.percent !== null && monthlyUsage?.percent !== undefined ? (
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor(monthlyUsage.percent)}`}
                  style={{ width: `${monthlyUsage.percent}%` }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-brand-300 to-brand-500 dark:from-brand-500/40 dark:to-brand-500/20 rounded-full" />
              )}
            </div>

            <div className="flex items-end gap-1.5">
              <p className="text-2xl font-extrabold text-gray-800 dark:text-white">
                {(monthlyUsage?.used ?? 0).toLocaleString()}
              </p>
              <span className="text-sm text-gray-400 dark:text-gray-500 mb-0.5">
                / {monthlyUsage?.limit !== null && monthlyUsage?.limit !== undefined
                  ? monthlyUsage.limit.toLocaleString()
                  : '∞'} leads
              </span>
            </div>

            {monthlyUsage?.percent !== null && monthlyUsage?.percent !== undefined && monthlyUsage.percent >= 90 && (
              <p className="text-[11px] font-semibold text-error-500 dark:text-error-400">
                Límite casi alcanzado. Considera actualizar tu plan.
              </p>
            )}
          </div>

          {/* Búsquedas activas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Búsquedas activas
              </span>
              {concurrentPct !== null ? (
                <span className={`text-xs font-bold ${
                  concurrentPct >= 90 ? 'text-error-500'
                  : concurrentPct >= 70 ? 'text-amber-500'
                  : 'text-success-600 dark:text-success-400'
                }`}>
                  {concurrentPct}%
                </span>
              ) : (
                <span className="text-xs font-bold text-brand-500 dark:text-brand-400">∞ ilimitado</span>
              )}
            </div>

            <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              {concurrentPct !== null ? (
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor(concurrentPct)}`}
                  style={{ width: `${concurrentPct}%` }}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-brand-300 to-brand-500 dark:from-brand-500/40 dark:to-brand-500/20 rounded-full" />
              )}
            </div>

            <div className="flex items-end gap-1.5">
              <p className="text-2xl font-extrabold text-gray-800 dark:text-white">
                {runningCount ?? 0}
              </p>
              <span className="text-sm text-gray-400 dark:text-gray-500 mb-0.5">
                / {maxConcurrent !== null ? maxConcurrent : '∞'} simultáneas
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/* ── íconos de features en header (decorativo) ───────────────────────────── */

function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-white/80 text-xs font-medium">
      {icon}
      {label}
    </div>
  );
}

/* ── página principal ────────────────────────────────────────────────────── */

export default function Profile() {
  const { user } = useAuth();

  return (
    <>
      <PageMeta title="Mi Perfil | Places Hub" description="Gestiona tu perfil y plan de suscripción" />

      <div className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden bg-brand-600 rounded-2xl p-6 lg:p-8 shadow-lg border border-white/20">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
              {user
                ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?"
                : "?"}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-white leading-tight">
                {user ? `${user.first_name} ${user.last_name}` : "Mi Perfil"}
              </h1>
              <p className="text-white/70 text-sm mt-0.5">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatChip icon={<Shield size={12} />} label={user?.plan.display_name ?? "Free"} />
                <StatChip icon={<Code2 size={12} />} label={`ID: ${user?.id}`} />
                <StatChip icon={<Headphones size={12} />} label={user?.plan.support_level === "dedicated" ? "Account manager" : user?.plan.support_level === "priority" ? "Soporte prioritario" : "Soporte email"} />
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BasicDataCard />
          <PlanCard />
        </div>

        {/* Uso */}
        <UsageCard />
      </div>
    </>
  );
}

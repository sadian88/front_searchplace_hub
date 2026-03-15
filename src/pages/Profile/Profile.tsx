import { useState, useEffect } from "react";
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiCheckCircle, FiShield, FiTrendingUp, FiCalendar } from "react-icons/fi";
import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import PlanCard from "../../components/common/PlanCard";

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
          <FiUser size={18} className="text-brand-600 dark:text-brand-400" />
          <h2 className="font-bold text-gray-800 dark:text-white text-sm">
            Datos básicos
          </h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
          >
            <FiEdit2 size={13} />
            Editar
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-100 dark:border-gray-700">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-brand-500/30 mb-3">
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
            <FiCheckCircle size={15} />
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
                <FiSave size={14} />
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4">
            {[
              { label: "Nombre", value: user?.first_name },
              { label: "Apellido", value: user?.last_name },
              { label: "Email", value: user?.email, icon: <FiMail size={13} className="text-gray-400" /> },
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

/* ── sección uso del plan ────────────────────────────────────────────────── */

interface MonthlyUsage { used: number; limit: number | null; percent: number | null; period_start: string; reset_date: string }

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
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FiTrendingUp size={18} className="text-brand-600 dark:text-brand-400" />
          <h2 className="font-bold text-gray-800 dark:text-white text-sm">Uso del plan</h2>
        </div>
        {monthlyUsage && (
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <FiCalendar size={11} className="shrink-0" />
              Desde:{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-300 ml-0.5">
                {new Date(monthlyUsage.period_start).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar size={11} className="shrink-0 text-brand-500" />
              Reset:{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-400 ml-0.5">
                {new Date(monthlyUsage.reset_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </span>
          </div>
        )}
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
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8 shadow-lg"
          style={{ background: "linear-gradient(135deg, #030711 0%, #0c1428 50%, #030711 100%)" }}
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: "rgba(37,99,235,0.18)" }} />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(124,58,237,0.10)" }} />
          {/* Top accent line */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/30 flex items-center justify-center text-white text-2xl font-extrabold shrink-0">
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
                <StatChip icon={<FiShield size={12} />} label={user?.plan.display_name ?? "Free"} />
                {user?.plan.expires_at ? (
                  <StatChip
                    icon={<FiCalendar size={12} />}
                    label={`Corte: ${new Date(user.plan.expires_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}`}
                  />
                ) : user?.plan.price_monthly === 0 ? (
                  <StatChip icon={<FiCalendar size={12} />} label="Sin fecha de corte" />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Uso del plan — visible al inicio */}
        <UsageCard />

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BasicDataCard />
          <PlanCard />
        </div>
      </div>
    </>
  );
}

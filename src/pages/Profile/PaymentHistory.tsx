import { useState, useEffect, useMemo } from "react";
import { FiCreditCard, FiCalendar, FiSearch, FiChevronDown, FiChevronUp, FiExternalLink, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import PageMeta from "../../components/common/PageMeta";
import api from "../../api/api";
import { ProfileHero } from "./Profile";

/* ── types & constants ───────────────────────────────────────────────────── */

interface Payment {
  id: string;
  mp_payment_id: string | null;
  mp_status: string;
  amount: number;
  created_at: string;
  plan_name: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  approved: {
    label: 'Aprobado',
    cls: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20',
    dot: 'bg-success-500',
  },
  pending: {
    label: 'Pendiente',
    cls: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    dot: 'bg-amber-400',
  },
  rejected: {
    label: 'Rechazado',
    cls: 'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20',
    dot: 'bg-error-500',
  },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

/* ── expanded detail row ─────────────────────────────────────────────────── */

function PaymentDetail({ p }: { p: Payment }) {
  const st = STATUS_MAP[p.mp_status] ?? STATUS_MAP.pending;
  const fields = [
    { label: 'ID interno',        value: p.id },
    { label: 'ID MercadoPago',    value: p.mp_payment_id ?? '—' },
    { label: 'Plan adquirido',    value: p.plan_name },
    { label: 'Monto',             value: `$${Number(p.amount).toFixed(2)} USD` },
    { label: 'Estado',            value: st.label },
    { label: 'Fecha',             value: `${fmtDate(p.created_at)} · ${fmtTime(p.created_at)}` },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 px-6 py-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
        {fields.map(f => (
          <div key={f.label}>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">
              {f.label}
            </p>
            <p className={`text-xs font-semibold break-all ${
              f.label === 'Estado'
                ? (STATUS_MAP[p.mp_status]?.cls.split(' ').slice(1, 3).join(' ') ?? 'text-gray-600')
                : 'text-gray-800 dark:text-white/90'
            }`}>
              {f.value}
            </p>
          </div>
        ))}
      </div>
      {p.mp_payment_id && (
        <a
          href={`https://www.mercadopago.com.co/activities/search?q=${p.mp_payment_id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 mt-4 text-[10px] font-bold text-brand-500 hover:text-brand-600 uppercase tracking-wider transition-colors"
        >
          <FiExternalLink size={11} />
          Ver en MercadoPago
        </a>
      )}
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────────────────── */

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // pagination
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  // filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    api.get<Payment[]>('/payments/history')
      .then(r => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    setPage(1);
    return payments.filter(p => {
      if (statusFilter !== 'all' && p.mp_status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.plan_name.toLowerCase().includes(q) &&
          !(p.mp_payment_id ?? '').toLowerCase().includes(q)
        ) return false;
      }
      if (dateFrom && new Date(p.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(p.created_at) > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, statusFilter, searchQuery, dateFrom, dateTo]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalApproved = useMemo(
    () => payments.filter(p => p.mp_status === 'approved').reduce((s, p) => s + Number(p.amount), 0),
    [payments]
  );

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <>
      <PageMeta title="Historial de Pagos | Places Hub" description="Consulta tu historial de pagos y suscripciones" />

      <div className="space-y-6">
        <ProfileHero activeTab="pagos" />

        {/* Summary chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total pagos', value: payments.length, sub: 'registros' },
            { label: 'Aprobados',   value: payments.filter(p => p.mp_status === 'approved').length, sub: 'transacciones' },
            { label: 'Total gastado', value: `$${totalApproved.toFixed(2)}`, sub: 'USD aprobado' },
          ].map(card => (
            <div key={card.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{card.label}</p>
              <p className="text-2xl font-extrabold text-gray-800 dark:text-white tabular-nums">{card.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px] group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Buscar por plan o ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-9 pr-4 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:text-white/90 transition-all"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 transition-all"
            >
              <option value="all">Todos los estados</option>
              <option value="approved">Aprobado</option>
              <option value="pending">Pendiente</option>
              <option value="rejected">Rechazado</option>
            </select>

            {/* Date from */}
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-8 pr-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 transition-all"
              />
            </div>

            {/* Date to */}
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 pl-8 pr-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:text-white/90 transition-all"
              />
            </div>

            {/* Clear */}
            {(statusFilter !== 'all' || searchQuery || dateFrom || dateTo) && (
              <button
                onClick={() => { setStatusFilter('all'); setSearchQuery(''); setDateFrom(''); setDateTo(''); }}
                className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-error-500 dark:hover:text-error-400 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors bg-gray-50 dark:bg-gray-900"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">

          {/* Header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
            {['Pago', 'Monto', 'Estado', ''].map(h => (
              <span key={h} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-5 animate-pulse">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="p-5 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-4">
                <FiCreditCard size={28} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm font-bold text-gray-600 dark:text-white/70">
                {payments.length === 0 ? 'Aún no tienes pagos registrados' : 'Sin resultados para estos filtros'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {payments.length === 0
                  ? 'Aquí aparecerán tus pagos de suscripción.'
                  : 'Prueba ajustando los filtros de búsqueda.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {paged.map(p => {
                const st = STATUS_MAP[p.mp_status] ?? STATUS_MAP.pending;
                const isOpen = expandedId === p.id;
                return (
                  <div key={p.id}>
                    <button
                      onClick={() => toggle(p.id)}
                      className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-left"
                    >
                      {/* Plan + date */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2.5 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl shrink-0">
                          <FiCreditCard size={14} className="text-brand-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 dark:text-white/90 truncate">
                            Plan {p.plan_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <FiCalendar size={10} className="text-gray-400 shrink-0" />
                            <span className="text-[10px] text-gray-400 font-semibold">
                              {fmtDate(p.created_at)} · {fmtTime(p.created_at)}
                            </span>
                            {p.mp_payment_id && (
                              <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono hidden sm:inline truncate max-w-[120px]">
                                · #{p.mp_payment_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <span className="text-sm font-extrabold text-gray-800 dark:text-white tabular-nums whitespace-nowrap">
                        ${Number(p.amount).toFixed(2)}
                      </span>

                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${st.cls} whitespace-nowrap`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>

                      {/* Expand toggle */}
                      <span className="text-gray-400 dark:text-gray-500">
                        {isOpen ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                      </span>
                    </button>

                    {isOpen && <PaymentDetail p={p} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer: count + pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {filtered.length} de {payments.length} registros
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { icon: <FiChevronsLeft size={15} />, onClick: () => setPage(1),             disabled: page <= 1 },
                  { icon: <FiChevronLeft  size={15} />, onClick: () => setPage(p => p - 1),   disabled: page <= 1 },
                  { icon: <FiChevronRight size={15} />, onClick: () => setPage(p => p + 1),   disabled: page >= pageCount },
                  { icon: <FiChevronsRight size={15} />, onClick: () => setPage(pageCount),   disabled: page >= pageCount },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.onClick} disabled={btn.disabled}
                    className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all">
                    {btn.icon}
                  </button>
                ))}
                <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg tabular-nums">
                  {page} / {pageCount}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

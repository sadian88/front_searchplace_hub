import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type PaginationState,
} from '@tanstack/react-table';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiCalendar, FiArrowRight, FiUsers, FiTrendingUp, FiAlertTriangle } from "react-icons/fi";
import PageMeta from '../../components/common/PageMeta';

/* ── time counter for running executions ─────────────────────────────────── */

const TimeCounter = ({ startTime, status }: { startTime: string; status: string }) => {
    const [elapsed, setElapsed] = useState('');
    useEffect(() => {
        if (status !== 'running') return;
        const update = () => {
            const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
            setElapsed(`${Math.floor(diff / 60)}:${(diff % 60).toString().padStart(2, '0')}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime, status]);
    if (status !== 'running') return null;
    return <span className="text-[10px] font-mono ml-2 opacity-60">{elapsed}</span>;
};

/* ── monthly usage banner ────────────────────────────────────────────────── */

interface MonthlyUsage { used: number; limit: number | null; percent: number | null }

function UsageBanner({ usage }: { usage: MonthlyUsage | null }) {
    if (!usage) return null;

    if (usage.limit === null) {
        return (
            <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-2xl">
                <FiTrendingUp size={16} className="text-success-500 shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 dark:text-white/80">
                        {usage.used.toLocaleString()} leads obtenidos este mes
                    </p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Plan sin límite mensual</p>
                </div>
            </div>
        );
    }

    const pct = usage.percent ?? 0;
    const isWarning = pct >= 70 && pct < 90;
    const isDanger  = pct >= 90;

    const barColor = isDanger  ? 'bg-error-500'
                   : isWarning ? 'bg-amber-400'
                   : 'bg-brand-500';

    const textColor = isDanger  ? 'text-error-600 dark:text-error-400'
                    : isWarning ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-700 dark:text-white/80';

    const borderColor = isDanger  ? 'border-error-200 dark:border-error-500/20 bg-error-50 dark:bg-error-500/10'
                      : isWarning ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40';

    return (
        <div className={`flex items-center gap-4 px-5 py-3.5 border rounded-2xl ${borderColor}`}>
            {isDanger
                ? <FiAlertTriangle size={16} className="text-error-500 shrink-0" />
                : <FiTrendingUp size={16} className={`shrink-0 ${isWarning ? 'text-amber-500' : 'text-brand-500'}`} />
            }
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                    <p className={`text-xs font-bold ${textColor}`}>
                        {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} leads este mes
                    </p>
                    <span className={`text-[10px] font-extrabold tabular-nums ${textColor}`}>{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                {isDanger && (
                    <p className="text-[10px] text-error-500 font-semibold mt-1">
                        Límite mensual alcanzado · Actualiza tu plan para continuar
                    </p>
                )}
            </div>
        </div>
    );
}

/* ── main component ──────────────────────────────────────────────────────── */

const Executions = () => {
    const { user } = useAuth();
    const navigate  = useNavigate();

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage | null>(null);

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    const maxLeadsPerSearch = user?.plan.max_leads_per_search ?? null;

    const refreshUsage = () =>
        api.get('/executions/usage/monthly').then(r => setMonthlyUsage(r.data)).catch(() => {});

    /* sync running executions with Apify, returns true if any finished */
    const syncRunning = async (executions: any[]): Promise<boolean> => {
        const running = executions.filter((e: any) => e.status === 'running');
        if (running.length === 0) return false;

        const results = await Promise.allSettled(
            running.map((e: any) => api.get(`/executions/${e.id}/sync`))
        );

        return results.some(r =>
            r.status === 'fulfilled' &&
            r.value.data.status !== 'running' &&
            !r.value.data.already_done
        );
    };

    /* fetch executions (+ sync running ones) */
    const fetchAll = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const params = { page: pageIndex + 1, limit: pageSize };
            const response = await api.get('/executions', { params });
            const executions: any[] = response.data.data || [];
            setData(executions);
            setPageCount(response.data.pagination.totalPages || 0);

            const anyFinished = await syncRunning(executions);
            if (anyFinished) {
                // Re-fetch to get updated status and results_count
                const updated = await api.get('/executions', { params });
                setData(updated.data.data || []);
                setPageCount(updated.data.pagination.totalPages || 0);
                refreshUsage();
            }
        } catch {
            setData([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    /* fetch monthly usage once on mount */
    useEffect(() => { refreshUsage(); }, []);

    useEffect(() => { fetchAll(); }, [pageIndex, pageSize]);

    /* auto-refresh every 10 s */
    useEffect(() => {
        const interval = setInterval(() => fetchAll(true), 10_000);
        return () => clearInterval(interval);
    }, [pageIndex, pageSize]);

    /* ── columns ──────────────────────────────────────────────────────────── */

    const columnHelper = createColumnHelper<any>();

    const columns = useMemo(() => [
        columnHelper.accessor('created_at', {
            header: 'Fecha / Hora',
            cell: info => (
                <div className="flex items-center gap-3 py-1">
                    <div className="p-2 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-lg text-brand-500">
                        <FiCalendar size={13} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-800 dark:text-white/90 font-semibold text-sm tracking-tight text-nowrap">
                            {new Date(info.getValue()).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-widest">
                            {new Date(info.getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor('search_term', {
            header: 'Búsqueda',
            cell: info => (
                <div className="flex flex-col py-1">
                    <span className="text-gray-800 dark:text-white/90 font-semibold text-sm tracking-tight">{info.getValue()}</span>
                    <span className="text-[9px] uppercase font-semibold tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 w-fit mt-1">
                        {info.row.original.location}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('results_count', {
            header: 'Resultados',
            cell: info => {
                const status = info.row.original.status;
                const count: number = info.getValue() ?? 0;

                if (status === 'running') {
                    return (
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-purple-500 font-semibold">
                            <span className="inline-block w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin opacity-70" /> Extrayendo...
                        </span>
                    );
                }
                if (status === 'fallido' || count === 0) {
                    return <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>;
                }

                /* saturation bar vs plan limit */
                const pct = maxLeadsPerSearch ? Math.min(100, Math.round((count / maxLeadsPerSearch) * 100)) : null;
                const isFull = pct !== null && pct >= 100;

                return (
                    <div className="flex flex-col gap-1 min-w-[90px]">
                        <div className="flex items-center gap-1.5">
                            <FiUsers size={11} className="text-brand-400 shrink-0" />
                            <span className="text-sm font-bold text-gray-800 dark:text-white/90 tabular-nums">{count}</span>
                            {maxLeadsPerSearch && (
                                <span className="text-[10px] text-gray-400 font-semibold">/ {maxLeadsPerSearch}</span>
                            )}
                        </div>
                        {pct !== null && (
                            <div className="flex items-center gap-1.5">
                                <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${isFull ? 'bg-amber-400' : 'bg-brand-400'}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className={`text-[9px] font-bold tabular-nums ${isFull ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {pct}%
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => {
                const status = info.getValue();
                const s: any = {
                    running:   'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
                    terminado: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20',
                    fallido:   'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20',
                };
                const labels: any = { running: 'En Progreso', terminado: 'Finalizado', fallido: 'Error' };
                return (
                    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${s[status] || s.running}`}>
                        {status === 'running' && (
                            <span className="flex h-1.5 w-1.5 mr-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
                            </span>
                        )}
                        {labels[status] || status}
                        <TimeCounter startTime={info.row.original.created_at} status={status} />
                    </span>
                );
            },
        }),
        columnHelper.accessor('actions' as any, {
            header: '',
            cell: info => {
                const isFinished = info.row.original.status === 'terminado';
                return (
                    <div className="flex justify-end">
                        <button
                            onClick={() => isFinished && navigate(`/leads?execution=${info.row.original.id}`)}
                            disabled={!isFinished}
                            className={`flex items-center gap-2 px-5 py-2 text-[10px] font-semibold rounded-lg border transition-all uppercase tracking-widest group
                                ${isFinished
                                    ? 'bg-brand-600 hover:bg-brand-500 text-white border-transparent shadow-sm shadow-brand-600/20'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-300 border-gray-100 dark:border-gray-700 cursor-not-allowed'
                                }`}
                        >
                            {info.row.original.status === 'running' ? 'Extrayendo...' : 'Ver Resultados'}
                            <FiArrowRight size={13} className={isFinished ? 'group-hover:translate-x-0.5 transition-transform' : ''} />
                        </button>
                    </div>
                );
            },
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [maxLeadsPerSearch]);

    const table = useReactTable({
        data, columns, pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    /* ── render ───────────────────────────────────────────────────────────── */

    return (
        <>
            <PageMeta title="Historial de Búsquedas | Places Hub" description="Registro detallado de tus búsquedas de lugares en el mapa" />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight flex items-center gap-3">
                        Historial de Búsquedas
                        {isRefreshing && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-500 uppercase tracking-widest animate-pulse">
                                <span className="inline-block w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin opacity-70" /> Actualizando
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm border-l-4 border-brand-500 pl-3">
                        Registro detallado de tus búsquedas de lugares en el mapa
                    </p>
                </div>

                {/* Monthly usage banner */}
                <UsageBanner usage={monthlyUsage} />

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id} className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                        {hg.headers.map(h => (
                                            <th key={h.id} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-5 h-20">
                                                <div className="h-full bg-gray-100 dark:bg-gray-700 rounded-xl" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all duration-200">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-6 py-4 transition-colors">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-gray-400 text-xs font-semibold hidden md:block px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-white/90">{pageIndex + 1}</span> / {pageCount || 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {[
                                { icon: <FiChevronsLeft size={16} />, onClick: () => table.setPageIndex(0),                    disabled: !table.getCanPreviousPage() },
                                { icon: <FiChevronLeft  size={16} />, onClick: () => table.previousPage(),                   disabled: !table.getCanPreviousPage() },
                                { icon: <FiChevronRight size={16} />, onClick: () => table.nextPage(),                       disabled: !table.getCanNextPage()     },
                                { icon: <FiChevronsRight size={16} />, onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
                            ].map((btn, i) => (
                                <button key={i}
                                    className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                    onClick={btn.onClick} disabled={btn.disabled}>
                                    {btn.icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {data.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-6">
                            <FiCalendar size={40} className="text-brand-500" />
                        </div>
                        <p className="text-gray-700 dark:text-white/90 text-sm font-bold mb-3">No hay búsquedas registradas</p>
                        <button onClick={() => navigate('/buscador')}
                            className="px-8 py-3 bg-brand-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30">
                            Comenzar Nueva Búsqueda
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Executions;

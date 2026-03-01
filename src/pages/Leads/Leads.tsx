import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '../../api/api';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type PaginationState,
} from '@tanstack/react-table';
import {
    Search, Star, Tag,
    ChevronLeft, ChevronRight,
    ChevronFirst, ChevronLast,
    Globe, ExternalLink, MapPin,
    Building2, ArrowLeft, CalendarDays,
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';

/* ── status helpers ───────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<string, string> = {
    'cliente':    'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20',
    'por visita': 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20',
    'visitado':   'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
    'descartado': 'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20',
};

/* ── component ────────────────────────────────────────────────────────────── */

const Leads = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const executionId = searchParams.get('execution');

    const [execution, setExecution] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalLeads, setTotalLeads] = useState(0);
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (executionId) {
                const [execRes, resultsRes] = await Promise.all([
                    api.get(`/executions/${executionId}`),
                    api.get(`/executions/${executionId}/results`, { params: { page: pageIndex + 1, limit: pageSize } }),
                ]);
                setExecution(execRes.data);
                setData(resultsRes.data.data || []);
                setPageCount(resultsRes.data.pagination.totalPages || 0);
                setTotalLeads(resultsRes.data.pagination.total || 0);
            } else {
                const res = await api.get('/places', { params: { page: pageIndex + 1, limit: pageSize } });
                setData(res.data.data || []);
                setPageCount(res.data.pagination.totalPages || 0);
                setTotalLeads(res.data.pagination.total || 0);
            }
        } catch {
            if (executionId) navigate('/executions');
            else setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Reset page when switching between all-leads / execution mode
    useEffect(() => {
        setPagination({ pageIndex: 0, pageSize: 10 });
        setExecution(null);
    }, [executionId]);

    useEffect(() => { fetchData(); }, [executionId, pageIndex, pageSize]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/places/${id}/status`, { status: newStatus });
            setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch {
            alert('Error al actualizar el estado');
        }
    };

    /* ── columns ──────────────────────────────────────────────────────────── */

    const columnHelper = createColumnHelper<any>();

    const columns = useMemo(() => [
        columnHelper.accessor('image_url', {
            header: '',
            cell: info => (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:border-brand-200 dark:group-hover:border-brand-500/30 transition-all shrink-0">
                    {info.getValue() ? (
                        <img
                            src={info.getValue()}
                            alt="thumb"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={e => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML =
                                    '<div class="text-gray-300 dark:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>';
                            }}
                        />
                    ) : (
                        <div className="text-gray-300 dark:text-gray-600 group-hover:text-brand-400 transition-colors">
                            <Building2 size={18} />
                        </div>
                    )}
                </div>
            ),
        }),
        columnHelper.accessor('title', {
            header: 'Establecimiento',
            cell: info => (
                <div className="flex flex-col py-1 min-w-0">
                    <span
                        className="font-semibold text-gray-800 dark:text-white/90 text-sm leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer truncate"
                        onClick={() => navigate(`/places/${info.row.original.id}`)}
                    >
                        {info.getValue()}
                    </span>
                    <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-500/20 uppercase tracking-wider flex items-center gap-1 w-fit mt-1">
                        <Tag size={9} /> {info.row.original.category_name || 'GENERAL'}
                    </span>
                </div>
            ),
        }),
        columnHelper.accessor('total_score', {
            header: 'Score',
            cell: info => (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl w-fit">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{info.getValue() || '0.0'}</span>
                    {info.row.original.reviews_count != null && (
                        <span className="text-gray-400 text-[10px]">({info.row.original.reviews_count})</span>
                    )}
                </div>
            ),
        }),
        columnHelper.accessor('city', {
            header: 'Ubicación',
            cell: info => info.getValue() ? (
                <div className="flex flex-col text-xs">
                    <span className="font-semibold text-gray-700 dark:text-white/80">{info.getValue()}</span>
                    {info.row.original.country_code && (
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                            {info.row.original.country_code}
                        </span>
                    )}
                </div>
            ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => (
                <select
                    value={info.getValue() || 'por visita'}
                    onChange={e => handleStatusChange(info.row.original.id, e.target.value)}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none bg-white dark:bg-gray-800 cursor-pointer transition-all ${STATUS_STYLES[info.getValue()] || 'bg-gray-50 border-gray-200 text-gray-400'}`}
                >
                    <option value="por visita">Pendiente</option>
                    <option value="cliente">Cliente</option>
                    <option value="visitado">Visitado</option>
                    <option value="descartado">Descartado</option>
                </select>
            ),
        }),
        columnHelper.accessor('actions' as any, {
            header: '',
            cell: info => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    {info.row.original.website && (
                        <a href={info.row.original.website} target="_blank" rel="noreferrer" title="Website"
                            className="p-2 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-400 hover:text-brand-500 rounded-lg transition-all border border-gray-200 dark:border-gray-700">
                            <Globe size={14} />
                        </a>
                    )}
                    {info.row.original.maps_url && (
                        <a href={info.row.original.maps_url} target="_blank" rel="noreferrer" title="Google Maps"
                            className="p-2 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-gray-400 hover:text-purple-500 rounded-lg transition-all border border-gray-200 dark:border-gray-700">
                            <MapPin size={14} />
                        </a>
                    )}
                    <button
                        onClick={() => navigate(`/places/${info.row.original.id}`)}
                        title="Ver detalle"
                        className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all border border-gray-200 dark:border-gray-700"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            ),
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [data]);

    /* ── filter (only in all-leads mode) ─────────────────────────────────── */

    const filteredData = useMemo(() =>
        executionId
            ? data
            : data.filter(p =>
                p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [data, searchTerm, executionId]
    );

    const pagination = useMemo(() => ({ pageIndex, pageSize }), [pageIndex, pageSize]);

    const table = useReactTable({
        data: filteredData,
        columns,
        pageCount,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    /* ── render ───────────────────────────────────────────────────────────── */

    return (
        <>
            <PageMeta
                title={executionId ? 'Resultados de Búsqueda | Places Hub' : 'Leads Hub | Places Hub'}
                description="Gestiona y califica tus prospectos recolectados"
            />

            <div className="space-y-6">

                {/* ── Execution mode: back button + context ── */}
                {executionId && (
                    <>
                        <button
                            onClick={() => navigate('/executions')}
                            className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl w-fit uppercase tracking-widest transition-all bg-white dark:bg-gray-800 group"
                        >
                            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
                            Volver al historial
                        </button>

                        <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">
                                    Resultados de Búsqueda
                                </h1>
                                {execution && (
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] bg-brand-500 text-white px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest shadow-md shadow-brand-500/20">
                                            {execution.search_term}
                                        </span>
                                        <span className="text-[10px] bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest">
                                            {execution.location}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-gray-50 dark:bg-gray-700 text-gray-400 border border-gray-100 dark:border-gray-600 px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest">
                                            <CalendarDays size={10} />
                                            {new Date(execution.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</span>
                                <span className="text-2xl font-bold text-gray-800 dark:text-white/90">{totalLeads}</span>
                                <span className="text-brand-400 font-semibold text-sm italic">leads</span>
                            </div>
                        </div>
                    </>
                )}

                {/* ── All-leads mode: header + search ── */}
                {!executionId && (
                    <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Leads Hub</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm border-l-4 border-brand-500 pl-3">
                                Gestiona y califica tus prospectos recolectados
                            </p>
                        </div>
                        <div className="flex gap-3 w-full xl:w-auto">
                            <div className="relative flex-1 xl:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o categoría..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:text-white/90 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Table ── */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map(hg => (
                                    <tr key={hg.id} className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                        {hg.headers.map(h => (
                                            <th key={h.id} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-4 h-16">
                                                <div className="h-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all duration-200 group">
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id} className="px-6 py-3 transition-colors">
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
                        <div className="flex items-center gap-4">
                            {!executionId && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Filas</span>
                                    <select
                                        value={pageSize}
                                        onChange={e => table.setPageSize(Number(e.target.value))}
                                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none dark:text-white/90"
                                    >
                                        {[10, 20, 30, 50].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            )}
                            <span className="text-gray-400 text-xs font-semibold hidden md:block">
                                <span className="text-gray-700 dark:text-white/90">{totalLeads}</span> leads en total
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {!executionId && (
                                <button
                                    className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronFirst size={16} />
                                </button>
                            )}
                            <button
                                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                {pageIndex + 1} / {pageCount || 1}
                            </span>
                            <button
                                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight size={16} />
                            </button>
                            {!executionId && (
                                <button
                                    className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronLast size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {filteredData.length === 0 && !loading && (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full w-fit mx-auto mb-5">
                            <Search size={36} className="text-brand-500" />
                        </div>
                        <p className="text-gray-700 dark:text-white/90 text-sm font-bold mb-2">No hay leads disponibles</p>
                        <p className="text-gray-400 text-xs max-w-xs mx-auto">
                            {executionId
                                ? 'Esta búsqueda no arrojó resultados.'
                                : 'Realiza una nueva búsqueda en el mapa para generar leads.'}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Leads;

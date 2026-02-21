import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type PaginationState
} from '@tanstack/react-table';
import {
    ChevronLeft, ChevronRight,
    ChevronFirst, ChevronLast, Calendar,
    ArrowRight, Loader2
} from 'lucide-react';
import PageMeta from "../../components/common/PageMeta";

const TimeCounter = ({ startTime, status }: { startTime: string, status: string }) => {
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

const Executions = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    const fetchExecutions = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const response = await api.get('/executions', { params: { page: pageIndex + 1, limit: pageSize } });
            setData(response.data.data || []);
            setPageCount(response.data.pagination.totalPages || 0);
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => { fetchExecutions(); }, [pageIndex, pageSize]);

    useEffect(() => {
        const interval = setInterval(() => fetchExecutions(true), 10000);
        return () => clearInterval(interval);
    }, [pageIndex, pageSize]);

    const columnHelper = createColumnHelper<any>();
    const columns = useMemo(() => [
        columnHelper.accessor('created_at', {
            header: 'Fecha / Hora',
            cell: info => (
                <div className="flex items-center gap-3 py-1">
                    <div className="p-2 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-lg text-brand-500">
                        <Calendar size={13} />
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
            )
        }),
        columnHelper.accessor('search_term', {
            header: 'Búsqueda',
            cell: info => (
                <div className="flex flex-col py-1">
                    <span className="text-gray-800 dark:text-white/90 font-semibold text-sm tracking-tight">{info.getValue()}</span>
                    <span className="text-[9px] uppercase font-semibold tracking-wider bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-600 w-fit mt-1">{info.row.original.location}</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => {
                const status = info.getValue();
                const s: any = {
                    'running': 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
                    'terminado': 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20',
                    'fallido': 'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
                };
                const labels: any = { 'running': 'En Progreso', 'terminado': 'Finalizado', 'fallido': 'Error' };
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
            }
        }),
        columnHelper.accessor('actions', {
            header: '',
            cell: info => {
                const isFinished = info.row.original.status === 'terminado';
                return (
                    <div className="flex justify-end">
                        <button
                            onClick={() => isFinished && navigate(`/executions/${info.row.original.id}`)}
                            disabled={!isFinished}
                            className={`flex items-center gap-2 px-5 py-2 text-[10px] font-semibold rounded-lg border transition-all uppercase tracking-widest group
                                ${isFinished ? 'bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white border-transparent' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 border-gray-100 dark:border-gray-700 cursor-not-allowed'}`}
                        >
                            {info.row.original.status === 'running' ? 'Extrayendo...' : 'Ver Resultados'}
                            <ArrowRight size={13} className={isFinished ? 'group-hover:translate-x-0.5 transition-transform' : ''} />
                        </button>
                    </div>
                );
            }
        })
    ], []);

    const table = useReactTable({
        data, columns, pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <>
            <PageMeta title="Historial de Búsquedas | Places Hub" description="Registro detallado de tus búsquedas de lugares en el mapa" />
            <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight flex items-center gap-3">
                        Historial de Búsquedas
                        {isRefreshing && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-brand-500 uppercase tracking-widest animate-pulse">
                                <Loader2 size={11} className="animate-spin" /> Actualizando
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm border-l-4 border-brand-500 pl-3">Registro detallado de tus búsquedas de lugares en el mapa</p>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-5 h-20">
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

                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-gray-400 text-xs font-semibold hidden md:block px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-white/90">{pageIndex + 1}</span> / {pageCount}
                        </span>
                        <div className="flex items-center gap-1.5">
                            {[
                                { icon: <ChevronFirst size={16} />, onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
                                { icon: <ChevronLeft size={16} />, onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
                                { icon: <ChevronRight size={16} />, onClick: () => table.nextPage(), disabled: !table.getCanNextPage() },
                                { icon: <ChevronLast size={16} />, onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
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
                            <Calendar size={40} className="text-brand-500" />
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

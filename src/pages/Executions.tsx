import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
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

const TimeCounter: React.FC<{ startTime: string, status: string }> = ({ startTime, status }) => {
    const [elapsed, setElapsed] = useState('');

    useEffect(() => {
        if (status !== 'running') return;

        const update = () => {
            const start = new Date(startTime).getTime();
            const now = new Date().getTime();
            const diff = Math.floor((now - start) / 1000);

            const m = Math.floor(diff / 60);
            const s = diff % 60;
            setElapsed(`${m}:${s.toString().padStart(2, '0')}`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startTime, status]);

    if (status !== 'running') return null;
    return <span className="text-[10px] font-black font-mono ml-2 opacity-70 tracking-tighter">{elapsed}</span>;
}

const Executions: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [pageCount, setPageCount] = useState(0);

    const fetchExecutions = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        try {
            const response = await api.get('/executions', {
                params: {
                    page: pageIndex + 1,
                    limit: pageSize
                }
            });
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

    useEffect(() => {
        fetchExecutions();
    }, [pageIndex, pageSize]);

    // Auto-refresh logic every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchExecutions(true);
        }, 10000);
        return () => clearInterval(interval);
    }, [pageIndex, pageSize]);

    const columnHelper = createColumnHelper<any>();
    const columns = useMemo(() => [
        columnHelper.accessor('created_at', {
            header: 'Fecha / Hora',
            cell: info => (
                <div className="flex items-center gap-4 py-1">
                    <div className="p-2.5 bg-[#4DCC9D]/10 border border-[#4DCC9D]/20 rounded-xl text-[#4DCC9D] shadow-sm">
                        <Calendar size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#1B1E32] font-black text-sm tracking-tight text-nowrap">
                            {new Date(info.getValue()).toLocaleDateString()}
                        </span>
                        <span className="text-[#9295A3] text-[10px] font-black uppercase tracking-widest">
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
                    <span className="text-[#1B1E32] font-black text-sm tracking-tighter leading-tight">{info.getValue()}</span>
                    <div className="flex items-center gap-1.5 text-[#9295A3]">
                        <span className="text-[9px] uppercase font-black tracking-widest bg-[#EDF2F7]/40 px-2.5 py-0.5 rounded-lg border border-zinc-100">{info.row.original.location}</span>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => {
                const status = info.getValue();
                const statusStyles: any = {
                    'running': 'bg-[#9B94FF]/10 text-[#9B94FF] border-[#9B94FF]/20 shadow-[#9B94FF]/5',
                    'terminado': 'bg-[#4DCC9D]/10 text-[#4DCC9D] border-[#4DCC9D]/20 shadow-[#4DCC9D]/5',
                    'fallido': 'bg-[#FF7B48]/10 text-[#FF7B48] border-[#FF7B48]/20 shadow-[#FF7B48]/5'
                };
                const labels: any = {
                    'running': 'En Progreso',
                    'terminado': 'Finalizado',
                    'fallido': 'Error'
                };
                return (
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl border ${statusStyles[status] || statusStyles.running} shadow-sm transition-all duration-500`}>
                            {status === 'running' && (
                                <span className="flex h-2 w-2 mr-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9B94FF] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9B94FF]"></span>
                                </span>
                            )}
                            {labels[status] || status}
                            <TimeCounter startTime={info.row.original.created_at} status={status} />
                        </span>
                    </div>
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
                            className={`flex items-center gap-3 px-6 py-2.5 text-[10px] font-black rounded-[14px] border transition-all uppercase tracking-widest group shadow-sm
                                ${isFinished
                                    ? 'bg-[#1B1E32] hover:bg-black text-white border-transparent active:scale-95'
                                    : 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed'
                                }`}
                        >
                            {info.row.original.status === 'running' ? 'Extrayendo...' : 'Ver Resultados'}
                            <ArrowRight size={14} className={`transition-transform duration-300 ${isFinished ? 'group-hover:translate-x-1' : ''}`} />
                        </button>
                    </div>
                );
            }
        })
    ], []);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-10 font-medium">
            <header className="flex flex-col space-y-3 relative">
                <h1 className="text-4xl lg:text-5xl font-black text-[#1B1E32] tracking-tighter">
                    Historial de Búsquedas
                    {isRefreshing && (
                        <span className="ml-4 inline-flex items-center gap-2 text-[10px] font-black text-[#4DCC9D] uppercase tracking-widest animate-pulse">
                            <Loader2 size={12} className="animate-spin" /> Actualizando...
                        </span>
                    )}
                </h1>
                <p className="text-[#9295A3] text-sm font-bold indent-1 border-l-4 border-[#4DCC9D] pl-4">Registro detallado de tus búsquedas de lugares en el mapa</p>
            </header>

            <div className="bg-white border border-zinc-100 rounded-[2.75rem] overflow-hidden shadow-2xl shadow-zinc-200/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-[#EDF2F7]/50 border-b border-zinc-100">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-10 py-5 text-[10px] font-black text-[#9295A3] uppercase tracking-[0.25em]">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[#EDF2F7]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-10 py-8 h-24">
                                            <div className="h-full bg-zinc-50 rounded-[1.5rem]" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-[#EDF2F7]/20 transition-all duration-300 group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-10 py-4 transition-colors">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-10 py-8 bg-[#EDF2F7]/10 border-t border-zinc-100">
                    <div className="flex items-center gap-4">
                        <span className="text-[#9295A3] text-[10px] font-black uppercase tracking-widest hidden md:block px-5 py-2.5 bg-white rounded-full border border-zinc-100 shadow-sm">
                            <span className="text-[#1B1E32]">{pageIndex + 1}</span> <span className="mx-2 opacity-30">/</span> {pageCount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {[
                            { icon: <ChevronFirst size={18} />, onClick: () => table.setPageIndex(0), disabled: !table.getCanPreviousPage() },
                            { icon: <ChevronLeft size={18} />, onClick: () => table.previousPage(), disabled: !table.getCanPreviousPage() },
                            { icon: <ChevronRight size={18} />, onClick: () => table.nextPage(), disabled: !table.getCanNextPage() },
                            { icon: <ChevronLast size={18} />, onClick: () => table.setPageIndex(table.getPageCount() - 1), disabled: !table.getCanNextPage() },
                        ].map((btn, i) => (
                            <button
                                key={i}
                                className="p-3.5 rounded-2xl border border-zinc-100 bg-white hover:bg-[#4DCC9D]/10 hover:text-[#4DCC9D] text-[#9295A3] disabled:opacity-20 transition-all shadow-sm active:scale-90"
                                onClick={btn.onClick}
                                disabled={btn.disabled}
                            >
                                {btn.icon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {data.length === 0 && !loading && (
                <div className="text-center py-24 bg-white rounded-[3.5rem] border-4 border-dashed border-[#EDF2F7] shadow-inner group">
                    <div className="p-8 bg-[#4DCC9D]/5 rounded-full w-fit mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Calendar size={48} className="text-[#4DCC9D]" />
                    </div>
                    <p className="text-[#1B1E32] text-xs tracking-[0.35em] uppercase font-black mb-10">No hay búsquedas registradas</p>
                    <button
                        onClick={() => navigate('/buscador')}
                        className="px-14 py-4.5 bg-[#4DCC9D] text-white font-black rounded-[2rem] text-xs uppercase tracking-widest hover:bg-[#3CB388] transition-all shadow-2xl shadow-[#4DCC9D]/30 active:scale-95"
                    >
                        Comenzar Nueva Búsqueda
                    </button>
                </div>
            )}
        </div>
    );
};

export default Executions;

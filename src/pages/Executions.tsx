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
    ArrowRight
} from 'lucide-react';

const Executions: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [pageCount, setPageCount] = useState(0);

    const fetchExecutions = async () => {
        setLoading(true);
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
        }
    };

    useEffect(() => {
        fetchExecutions();
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
        columnHelper.accessor('category', {
            header: 'Categoría',
            cell: info => <span className="text-[9px] text-[#9295A3] font-black uppercase tracking-[0.25em] px-3 py-1.5 bg-[#EDF2F7]/50 rounded-xl border border-zinc-100 shadow-inner">{info.getValue() || 'GENERAL'}</span>
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => {
                const statusStyles: any = {
                    'running': 'bg-[#9B94FF]/10 text-[#9B94FF] border-[#9B94FF]/20 shadow-[#9B94FF]/5',
                    'terminado': 'bg-[#4DCC9D]/10 text-[#4DCC9D] border-[#4DCC9D]/20 shadow-[#4DCC9D]/5',
                    'fallido': 'bg-[#FF7B48]/10 text-[#FF7B48] border-[#FF7B48]/20 shadow-[#FF7B48]/5'
                };
                const labels: any = {
                    'running': 'Procesando',
                    'terminado': 'Finalizado',
                    'fallido': 'Error'
                };
                return (
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-xl border ${statusStyles[info.getValue()] || statusStyles.running} shadow-sm animate-in fade-in zoom-in-90`}>
                            {labels[info.getValue()] || info.getValue()}
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
                            {info.row.original.status === 'running' ? 'Cargando' : 'Ver Resultados'}
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
            <header className="flex flex-col space-y-3">
                <h1 className="text-4xl lg:text-5xl font-black text-[#1B1E32] tracking-tighter">
                    Historial de Búsquedas
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

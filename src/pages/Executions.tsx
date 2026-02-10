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
    Search, ChevronLeft, ChevronRight,
    ChevronFirst, ChevronLast, Calendar,
    ArrowRight, Activity
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
                <div className="flex items-center gap-3 py-1">
                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-500">
                        <Calendar size={14} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-zinc-100 font-medium text-sm">
                            {new Date(info.getValue()).toLocaleDateString()}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                            {new Date(info.getValue()).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('search_term', {
            header: 'Búsqueda',
            cell: info => (
                <div className="flex flex-col">
                    <span className="text-zinc-200 font-semibold text-sm">{info.getValue()}</span>
                    <span className="text-zinc-500 text-xs">{info.row.original.location}</span>
                </div>
            )
        }),
        columnHelper.accessor('category', {
            header: 'Categoría',
            cell: info => <span className="text-xs text-zinc-400 font-medium px-2 py-1 bg-zinc-800 rounded-md border border-zinc-700">{info.getValue() || 'N/A'}</span>
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => {
                const statusStyles: any = {
                    'running': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    'terminado': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    'fallido': 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                };
                const labels: any = {
                    'running': 'En Proceso',
                    'terminado': 'Finalizado',
                    'fallido': 'Error'
                };
                return (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${statusStyles[info.getValue()] || statusStyles.running}`}>
                        {labels[info.getValue()] || info.getValue()}
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
                            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors uppercase tracking-wider ${isFinished
                                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                                    : 'bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'
                                }`}
                        >
                            {info.row.original.status === 'running' ? 'Procesando...' : 'Ver Resultados'}
                            <ArrowRight size={14} />
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                        <Activity className="text-zinc-500" size={24} /> Historial de Scraping
                    </h1>
                    <p className="text-zinc-500 text-sm">Registro de todas las ejecuciones lanzadas por el sistema</p>
                </div>
            </header>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-tight border-b border-zinc-800">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-4 h-16 bg-zinc-900/20"></td>
                                    </tr>
                                ))
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-3 text-sm text-zinc-300">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/20 border-t border-zinc-800">
                    <span className="text-zinc-600 text-[11px] font-medium hidden md:block">
                        Mostrando página {pageIndex + 1} de {pageCount}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 disabled:opacity-25 transition-colors"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronFirst size={16} />
                        </button>
                        <button
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 disabled:opacity-25 transition-colors"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <button
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 disabled:opacity-25 transition-colors"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button
                            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 disabled:opacity-25 transition-colors"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronLast size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {data.length === 0 && !loading && (
                <div className="text-center py-20 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500 text-sm tracking-widest uppercase font-bold">No hay ejecuciones registradas</p>
                    <button
                        onClick={() => navigate('/scraping')}
                        className="mt-4 px-6 py-2 bg-zinc-100 text-zinc-900 font-bold rounded-xl text-xs uppercase"
                    >
                        Lanzar mi primer Scraping
                    </button>
                </div>
            )}
        </div>
    );
};

export default Executions;

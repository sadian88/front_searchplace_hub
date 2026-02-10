import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    type PaginationState
} from '@tanstack/react-table';
import {
    Star, Tag, ChevronLeft, ChevronRight,
    Globe, MapPin, ArrowLeft,
    LayoutGrid
} from 'lucide-react';

const ExecutionDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [execution, setExecution] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [pageCount, setPageCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [execRes, resultsRes] = await Promise.all([
                api.get(`/executions/${id}`),
                api.get(`/executions/${id}/results`, {
                    params: { page: pageIndex + 1, limit: pageSize }
                })
            ]);

            setExecution(execRes.data);
            setData(resultsRes.data.data || []);
            setPageCount(resultsRes.data.pagination.totalPages || 0);
        } catch (error) {
            console.error(error);
            navigate('/executions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id, pageIndex, pageSize]);

    const columnHelper = createColumnHelper<any>();
    const columns = useMemo(() => [
        columnHelper.accessor('title', {
            header: 'Establecimiento',
            cell: info => (
                <div className="flex flex-col py-1">
                    <span className="font-semibold text-zinc-100 text-sm">{info.getValue()}</span>
                    <span className="text-zinc-500 text-xs flex items-center gap-1">
                        <Tag size={10} /> {info.row.original.category_name}
                    </span>
                </div>
            )
        }),
        columnHelper.accessor('total_score', {
            header: 'Score',
            cell: info => (
                <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{info.getValue()}</span>
                </div>
            )
        }),
        columnHelper.accessor('city', {
            header: 'Ubicación',
            cell: info => <span className="text-xs text-zinc-400">{info.getValue()}, {info.row.original.country_code}</span>
        }),
        columnHelper.accessor('actions', {
            header: '',
            cell: info => (
                <div className="flex items-center justify-end gap-2">
                    {info.row.original.website && (
                        <a href={info.row.original.website} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-blue-400">
                            <Globe size={16} />
                        </a>
                    )}
                    <a href={info.row.original.maps_url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-emerald-400">
                        <MapPin size={16} />
                    </a>
                </div>
            )
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

    if (!execution && loading) return <div className="p-20 text-center text-zinc-500 uppercase tracking-widest text-xs font-bold animate-pulse">Cargando resultados...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/executions')}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-100 uppercase tracking-widest transition-colors w-fit"
                >
                    <ArrowLeft size={14} /> Volver al historial
                </button>

                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100">Resultados de Scraping</h1>
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">{execution?.search_term}</span>
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">{execution?.location}</span>
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">{new Date(execution?.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl flex items-center gap-3">
                        <LayoutGrid size={20} className="text-zinc-600" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-zinc-100 tracking-tight">Total Encontrados</span>
                            <span className="text-xs text-zinc-500 font-medium">{data.length} leads en esta ejecución</span>
                        </div>
                    </div>
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
                    <span className="text-zinc-600 text-[11px] font-medium">
                        Página {pageIndex + 1} de {pageCount}
                    </span>

                    <div className="flex items-center gap-2">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutionDetails;

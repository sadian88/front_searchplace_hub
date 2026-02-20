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
                <div className="flex flex-col py-2">
                    <span className="font-black text-zinc-900 text-sm tracking-tight leading-tight mb-1">{info.getValue()}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50 uppercase tracking-widest flex items-center gap-1.5">
                            <Tag size={10} /> {info.row.original.category_name || 'SIN CATEGORÍA'}
                        </span>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('total_score', {
            header: 'Score',
            cell: info => (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-xl w-fit shadow-sm">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-900">{info.getValue() || '0.0'}</span>
                </div>
            )
        }),
        columnHelper.accessor('city', {
            header: 'Ubicación',
            cell: info => (
                <div className="flex flex-col text-xs">
                    <span className="font-bold text-zinc-700">{info.getValue()}</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{info.row.original.country_code}</span>
                </div>
            )
        }),
        columnHelper.accessor('actions', {
            header: '',
            cell: info => (
                <div className="flex items-center justify-end gap-2 pr-4">
                    {info.row.original.website && (
                        <a href={info.row.original.website} target="_blank" rel="noreferrer" className="p-3 bg-white hover:bg-emerald-50 text-zinc-400 hover:text-emerald-600 rounded-2xl transition-all border border-zinc-100 hover:border-emerald-200 shadow-sm active:scale-90">
                            <Globe size={16} />
                        </a>
                    )}
                    <a href={info.row.original.maps_url} target="_blank" rel="noreferrer" className="p-3 bg-white hover:bg-blue-50 text-zinc-400 hover:text-blue-600 rounded-2xl transition-all border border-zinc-100 hover:border-blue-200 shadow-sm active:scale-90">
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

    if (!execution && loading) return (
        <div className="flex flex-col items-center justify-center h-96 space-y-6">
            <div className="w-16 h-16 border-4 border-emerald-50 border-t-emerald-500 rounded-full animate-spin shadow-lg"></div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Leads...</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-12">
            <header className="flex flex-col gap-8">
                <button
                    onClick={() => navigate('/executions')}
                    className="flex items-center gap-3 text-[10px] font-black text-zinc-400 hover:text-emerald-600 border border-zinc-100 px-6 py-3 rounded-2xl w-fit uppercase tracking-[0.2em] transition-all bg-white shadow-sm active:scale-95 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Volver al historial
                </button>

                <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-8">
                    <div className="space-y-4">
                        <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none">Resultados de Búsqueda</h1>
                        <div className="flex flex-wrap gap-2.5">
                            <span className="text-[10px] bg-[#49C08D] text-white px-5 py-2 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-200">{execution?.search_term}</span>
                            <span className="text-[10px] bg-white text-zinc-500 border border-zinc-100 px-5 py-2 rounded-xl font-black uppercase tracking-widest shadow-sm">{execution?.location}</span>
                            <span className="text-[10px] bg-[#F8FBFF] text-zinc-400 border border-zinc-50 px-5 py-2 rounded-xl font-black uppercase tracking-widest">{new Date(execution?.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="p-8 bg-white border border-emerald-50 rounded-[2.5rem] flex items-center gap-6 shadow-xl shadow-zinc-200/40 min-w-fit hover:-translate-y-1 transition-transform group">
                        <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] shadow-sm group-hover:scale-110 transition-transform">
                            <LayoutGrid size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Encontrados</span>
                            <span className="text-2xl font-black text-zinc-900 tracking-tighter leading-none">
                                {data.length} <span className="text-emerald-300 font-bold italic ml-1">leads</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-200/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-[#F8FBFF] border-b border-zinc-100">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-10 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.25em]">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-10 py-10">
                                            <div className="h-4 bg-zinc-50 rounded-full w-2/3" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-[#F8FBFF]/50 transition-all duration-300 group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-10 py-5 transition-colors">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between px-10 py-8 bg-[#F8FBFF]/30 border-t border-zinc-100">
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest px-5 py-2 bg-white rounded-full border border-zinc-100 shadow-sm">
                            Página {pageIndex + 1} <span className="mx-1 opacity-20">/</span> {pageCount}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="p-3.5 rounded-2xl border border-zinc-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 text-zinc-400 disabled:opacity-20 transition-all shadow-sm active:scale-95"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            className="p-3.5 rounded-2xl border border-zinc-100 bg-white hover:bg-emerald-50 hover:text-emerald-600 text-zinc-400 disabled:opacity-20 transition-all shadow-sm active:scale-95"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutionDetails;

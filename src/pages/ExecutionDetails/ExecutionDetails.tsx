import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../../api/api';
import {
    useReactTable, getCoreRowModel, flexRender,
    createColumnHelper, type PaginationState
} from '@tanstack/react-table';
import { Star, Tag, ChevronLeft, ChevronRight, Globe, MapPin, ArrowLeft, LayoutGrid, Building2 } from 'lucide-react';
import PageMeta from "../../components/common/PageMeta";

const ExecutionDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [execution, setExecution] = useState<any>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [execRes, resultsRes] = await Promise.all([
                api.get(`/executions/${id}`),
                api.get(`/executions/${id}/results`, { params: { page: pageIndex + 1, limit: pageSize } })
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

    useEffect(() => { fetchData(); }, [id, pageIndex, pageSize]);

    const columnHelper = createColumnHelper<any>();
    const columns = useMemo(() => [
        columnHelper.accessor('image_url', {
            header: '',
            cell: info => (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:border-brand-200 dark:group-hover:border-brand-500/30 transition-all">
                    {info.getValue() ? (
                        <img
                            src={info.getValue()}
                            alt="thumb"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-300 dark:text-gray-600"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building-2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg></div>';
                            }}
                        />
                    ) : (
                        <div className="text-gray-300 dark:text-gray-600 group-hover:text-brand-400 transition-colors">
                            <Building2 size={18} />
                        </div>
                    )}
                </div>
            )
        }),
        columnHelper.accessor('title', {
            header: 'Establecimiento',
            cell: info => (
                <div className="flex flex-col py-1">
                    <span className="font-semibold text-gray-800 dark:text-white/90 text-sm leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer" onClick={() => navigate(`/places/${info.row.original.place_id || info.row.original.id}`)}>
                        {info.getValue()}
                    </span>
                    <span className="text-[9px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-500/20 uppercase tracking-widest flex items-center gap-1 w-fit mt-1">
                        <Tag size={9} /> {info.row.original.category_name || 'SIN CATEGORÍA'}
                    </span>
                </div>
            )
        }),
        columnHelper.accessor('total_score', {
            header: 'Score',
            cell: info => (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-lg w-fit">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{info.getValue() || '0.0'}</span>
                </div>
            )
        }),
        columnHelper.accessor('city', {
            header: 'Ubicación',
            cell: info => (
                <div className="flex flex-col text-xs">
                    <span className="font-semibold text-gray-700 dark:text-white/80">{info.getValue()}</span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-widest">{info.row.original.country_code}</span>
                </div>
            )
        }),
        columnHelper.accessor('actions', {
            header: '',
            cell: info => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    {info.row.original.website && (
                        <a href={info.row.original.website} target="_blank" rel="noreferrer" title="Website"
                            className="p-2 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-400 hover:text-brand-500 rounded-lg transition-all border border-gray-200 dark:border-gray-700">
                            <Globe size={14} />
                        </a>
                    )}
                    <a href={info.row.original.maps_url} target="_blank" rel="noreferrer" title="Google Maps"
                        className="p-2 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 text-gray-400 hover:text-brand-600 rounded-lg transition-all border border-gray-200 dark:border-gray-700">
                        <MapPin size={14} />
                    </a>
                </div>
            )
        })
    ], []);

    const table = useReactTable({
        data, columns, pageCount,
        state: { pagination: { pageIndex, pageSize } },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    if (!execution && loading) return (
        <div className="flex flex-col items-center justify-center h-80 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-100 dark:border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Cargando resultados...</span>
        </div>
    );

    return (
        <>
            <PageMeta title="Resultados de Búsqueda | Places Hub" description="Resultados detallados de una ejecución de búsqueda" />
            <div className="space-y-6">
                <button onClick={() => navigate('/executions')}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl w-fit uppercase tracking-widest transition-all bg-white dark:bg-gray-800 group">
                    <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" /> Volver al historial
                </button>

                <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6">
                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Resultados de Búsqueda</h1>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[10px] bg-brand-500 text-white px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest shadow-md shadow-brand-500/20">{execution?.search_term}</span>
                            <span className="text-[10px] bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest">{execution?.location}</span>
                            <span className="text-[10px] bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-600 px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest">{new Date(execution?.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center gap-4 shadow-sm hover:-translate-y-0.5 transition-transform group">
                        <div className="p-3.5 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-xl group-hover:scale-110 transition-transform">
                            <LayoutGrid size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Total Encontrados</span>
                            <span className="text-2xl font-bold text-gray-800 dark:text-white/90 tracking-tight">
                                {data.length} <span className="text-brand-300 font-semibold italic">leads</span>
                            </span>
                        </div>
                    </div>
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
                                            <td colSpan={5} className="px-6 py-6 h-16">
                                                <div className="h-full bg-gray-100 dark:bg-gray-700 rounded-lg" />
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
                        <span className="text-gray-400 text-xs font-semibold px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                            Página {pageIndex + 1} / {pageCount}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                <ChevronLeft size={16} />
                            </button>
                            <button className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-500 text-gray-400 disabled:opacity-20 transition-all"
                                onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExecutionDetails;

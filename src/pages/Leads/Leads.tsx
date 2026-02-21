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
    Search, Star, Tag,
    ChevronLeft, ChevronRight,
    ChevronFirst, ChevronLast, Globe, ExternalLink,
    MapPin, Filter, Building2
} from 'lucide-react';
import PageMeta from "../../components/common/PageMeta";

const Leads = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [stats, setStats] = useState({ total: 0 });
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [pageCount, setPageCount] = useState(0);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/places', { params: { page: pageIndex + 1, limit: pageSize } });
            const receivedData = response.data.data || [];
            setData(receivedData);
            setPageCount(response.data.pagination.totalPages || 0);
            setStats({ total: response.data.pagination.total || 0 });
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlaces(); }, [pageIndex, pageSize]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/places/${id}/status`, { status: newStatus });
            setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch {
            alert('Error al actualizar el estado');
        }
    };

    const statusStyles: any = {
        'cliente': 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20',
        'por visita': 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20',
        'visitado': 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
        'descartado': 'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
    };

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
                    <span className="font-semibold text-gray-800 dark:text-white/90 text-sm leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors cursor-pointer" onClick={() => navigate(`/places/${info.row.original.id}`)}>
                        {info.getValue()}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-400 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-500/20 uppercase tracking-wider flex items-center gap-1">
                            <Tag size={10} /> {info.row.original.category_name || 'GENERAL'}
                        </span>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('total_score', {
            header: 'Calificación',
            cell: info => (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl w-fit">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{info.getValue() || '0.0'}</span>
                    <span className="text-gray-400 text-[10px]">({info.row.original.reviews_count})</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => (
                <select
                    value={info.getValue()}
                    onChange={(e) => handleStatusChange(info.row.original.id, e.target.value)}
                    className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none bg-white dark:bg-gray-800 cursor-pointer transition-all ${statusStyles[info.getValue()] || 'bg-gray-50 border-gray-200 text-gray-400'}`}
                >
                    <option value="por visita">Pendiente</option>
                    <option value="cliente">Cliente</option>
                    <option value="visitado">Visitado</option>
                    <option value="descartado">Descartado</option>
                </select>
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
                        className="p-2 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-gray-400 hover:text-purple-500 rounded-lg transition-all border border-gray-200 dark:border-gray-700">
                        <MapPin size={14} />
                    </a>
                    <button
                        onClick={() => navigate(`/places/${info.row.original.id}`)}
                        className="p-2 bg-white dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-all border border-gray-200 dark:border-gray-700"
                        title="Ver Detalle"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            )
        })
    ], [data]);

    const filteredData = useMemo(() =>
        data.filter(p =>
        (p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category_name?.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [data, searchTerm]);

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

    return (
        <>
            <PageMeta title="Leads Hub | Places Hub" description="Gestiona y califica tus prospectos recolectados" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Leads Hub</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm border-l-4 border-brand-500 pl-3">Gestiona y califica tus prospectos recolectados</p>
                    </div>
                    <div className="flex gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 xl:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors" size={15} />
                            <input
                                type="text"
                                placeholder="Buscar en tus leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 pl-10 pr-5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-300 dark:text-white/90 transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-gray-700">
                            <Filter size={13} /> Filtros
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Encontrados', val: stats.total, icon: <Search size={15} className="text-gray-400" /> },
                        { label: 'Página Actual', val: `${pageIndex + 1} de ${pageCount}`, icon: <Tag size={15} className="text-brand-500" /> },
                        { label: 'Estado del Motor', val: 'Activo', icon: <Globe size={15} className="text-success-500" /> },
                    ].map((stat, i) => (
                        <div key={i} className="border border-gray-200 dark:border-gray-700 p-5 rounded-xl shadow-sm flex items-center gap-4 bg-white dark:bg-gray-800 hover:-translate-y-0.5 transition-all group">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <div className="flex flex-col">
                                <p className="text-gray-400 text-[10px] uppercase font-semibold tracking-wider mb-1">{stat.label}</p>
                                <p className="text-base font-bold text-gray-800 dark:text-white/90 tracking-tight">{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} className="bg-gray-50 dark:bg-gray-900/40 border-b border-gray-200 dark:border-gray-700">
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-4 h-16">
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
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Filas</span>
                                <select
                                    value={pageSize}
                                    onChange={e => table.setPageSize(Number(e.target.value))}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all dark:text-white/90"
                                >
                                    {[10, 20, 30, 50].map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </div>
                            <span className="text-gray-400 text-xs font-semibold hidden md:block">
                                <span className="text-gray-700 dark:text-white/90">{data.length}</span> de {stats.total} leads
                            </span>
                        </div>
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
                            <Search size={40} className="text-brand-500" />
                        </div>
                        <p className="text-gray-700 dark:text-white/90 text-sm font-bold mb-2">No se encontraron prospectos</p>
                        <p className="text-gray-400 text-xs max-w-sm mx-auto">Prueba ajustando los términos de búsqueda o realiza una nueva búsqueda en el mapa.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Leads;

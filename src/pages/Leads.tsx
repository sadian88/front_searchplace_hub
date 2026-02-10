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
    Search, Star, Tag,
    ChevronLeft, ChevronRight,
    ChevronFirst, ChevronLast, Globe, ExternalLink,
    MapPin, Filter
} from 'lucide-react';

const Leads: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total: 0,
        cliente: 0,
        pendientes: 0,
        descartados: 0
    });

    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [pageCount, setPageCount] = useState(0);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const response = await api.get('/places', {
                params: {
                    page: pageIndex + 1,
                    limit: pageSize
                }
            });

            const receivedData = response.data.data || [];
            setData(receivedData);
            setPageCount(response.data.pagination.totalPages || 0);
            setStats(prev => ({
                ...prev,
                total: response.data.pagination.total || 0
            }));

        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaces();
    }, [pageIndex, pageSize]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/places/${id}/status`, { status: newStatus });
            setData(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch (error) {
            alert('Error al actualizar el estado');
        }
    };

    const statusStyles: any = {
        'cliente': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'por visita': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'visitado': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        'descartado': 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    };

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
            header: 'Calificación',
            cell: info => (
                <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{info.getValue()}</span>
                    <span className="text-zinc-500 text-[10px]">({info.row.original.reviews_count})</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => (
                <select
                    value={info.getValue()}
                    onChange={(e) => handleStatusChange(info.row.original.id, e.target.value)}
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border outline-none bg-transparent cursor-pointer transition-colors ${statusStyles[info.getValue()]}`}
                >
                    <option value="por visita" className="bg-zinc-900">Pendiente</option>
                    <option value="cliente" className="bg-zinc-900">Cliente</option>
                    <option value="visitado" className="bg-zinc-900">Visitado</option>
                    <option value="descartado" className="bg-zinc-900">Descartado</option>
                </select>
            )
        }),
        columnHelper.accessor('actions', {
            header: '',
            cell: info => (
                <div className="flex items-center justify-end gap-2">
                    {info.row.original.website && (
                        <a href={info.row.original.website} target="_blank" rel="noreferrer" title="Website" className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-blue-400 transition-colors">
                            <Globe size={16} />
                        </a>
                    )}
                    <a href={info.row.original.maps_url} target="_blank" rel="noreferrer" title="Google Maps" className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-emerald-400 transition-colors">
                        <MapPin size={16} />
                    </a>
                    <button
                        onClick={() => navigate(`/places/${info.row.original.id}`)}
                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-zinc-100 transition-colors"
                        title="Ver Detalle"
                    >
                        <ExternalLink size={16} />
                    </button>
                </div>
            )
        })
    ], [data]);

    const filteredData = useMemo(() =>
        data.filter(p =>
        (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100">Leads Hub</h1>
                    <p className="text-zinc-500 text-sm">Gestiona tus prospectos recolectados</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar establecimiento..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-zinc-800 pl-9 pr-3 py-2 text-sm rounded-lg focus:ring-1 focus:ring-zinc-700 outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm border border-zinc-700 transition-colors">
                        <Filter size={14} /> Filtros
                    </button>
                </div>
            </header>

            {/* Compact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Encontrados', val: stats.total, color: 'text-zinc-100' },
                    { label: 'Página', val: `${pageIndex + 1} / ${pageCount}`, color: 'text-zinc-400' },
                    { label: 'Plan', val: 'Basic', color: 'text-zinc-400' },
                    { label: 'Status', val: 'Active', color: 'text-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-0.5">{stat.label}</p>
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* Modern Table Container */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-800/50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-tight border-b border-zinc-800">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                Array.from({ length: pageSize }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-4 h-16 bg-zinc-900/20"></td>
                                    </tr>
                                ))
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors group">
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

                {/* Improved Compact Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/20 border-t border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-500 text-xs">Fila por página</span>
                            <select
                                value={pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-zinc-800 border border-zinc-700 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-zinc-600 outline-none"
                            >
                                {[10, 20, 30, 50].map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </div>
                        <span className="text-zinc-600 text-[11px] font-medium hidden md:block">
                            {data.length} de {stats.total} resultados
                        </span>
                    </div>

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

                        <span className="text-xs font-bold px-2 text-zinc-400 uppercase tracking-widest text-[10px]">
                            {pageIndex + 1} / {pageCount}
                        </span>

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
                <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                    <p className="text-zinc-500 text-sm">No se encontraron resultados en esta página.</p>
                </div>
            )}
        </div>
    );
};

export default Leads;

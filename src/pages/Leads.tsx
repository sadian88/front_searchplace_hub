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
        'cliente': 'bg-[#4DCC9D]/10 text-[#4DCC9D] border-[#4DCC9D]/20 shadow-[#4DCC9D]/5',
        'por visita': 'bg-[#9B94FF]/10 text-[#9B94FF] border-[#9B94FF]/20 shadow-[#9B94FF]/5',
        'visitado': 'bg-[#EDF2F7] text-[#9295A3] border-zinc-200',
        'descartado': 'bg-[#FF7B48]/10 text-[#FF7B48] border-[#FF7B48]/20 shadow-[#FF7B48]/5'
    };

    const columnHelper = createColumnHelper<any>();
    const columns = useMemo(() => [
        columnHelper.accessor('title', {
            header: 'Establecimiento',
            cell: info => (
                <div className="flex flex-col py-1">
                    <span className="font-black text-[#1B1E32] text-sm tracking-tight leading-tight">{info.getValue()}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-[#4DCC9D] bg-[#4DCC9D]/10 px-2 py-0.5 rounded-lg border border-[#4DCC9D]/20 uppercase tracking-widest flex items-center gap-1">
                            <Tag size={10} /> {info.row.original.category_name || 'GENERAL'}
                        </span>
                    </div>
                </div>
            )
        }),
        columnHelper.accessor('total_score', {
            header: 'Calificación',
            cell: info => (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100/50 rounded-xl w-fit shadow-xs">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-amber-900">{info.getValue() || '0.0'}</span>
                    <span className="text-[#9295A3] text-[10px] font-bold">({info.row.original.reviews_count})</span>
                </div>
            )
        }),
        columnHelper.accessor('status', {
            header: 'Estado',
            cell: info => (
                <select
                    value={info.getValue()}
                    onChange={(e) => handleStatusChange(info.row.original.id, e.target.value)}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border outline-none bg-white cursor-pointer transition-all shadow-sm ${statusStyles[info.getValue()] || 'bg-zinc-50 border-zinc-100 text-zinc-400'}`}
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
                        <a href={info.row.original.website} target="_blank" rel="noreferrer" title="Website" className="p-2.5 bg-white hover:bg-[#4DCC9D]/10 text-[#9295A3] hover:text-[#4DCC9D] rounded-[14px] transition-all border border-zinc-100 hover:border-[#4DCC9D]/30 shadow-xs active:scale-90">
                            <Globe size={15} />
                        </a>
                    )}
                    <a href={info.row.original.maps_url} target="_blank" rel="noreferrer" title="Google Maps" className="p-2.5 bg-white hover:bg-[#9B94FF]/10 text-[#9295A3] hover:text-[#9B94FF] rounded-[14px] transition-all border border-zinc-100 hover:border-[#9B94FF]/30 shadow-xs active:scale-90">
                        <MapPin size={15} />
                    </a>
                    <button
                        onClick={() => navigate(`/places/${info.row.original.id}`)}
                        className="p-2.5 bg-white hover:bg-[#1B1E32] text-[#9295A3] hover:text-white rounded-[14px] transition-all border border-zinc-100 hover:border-[#1B1E32] shadow-xs active:scale-90"
                        title="Ver Detalle"
                    >
                        <ExternalLink size={15} />
                    </button>
                </div>
            )
        })
    ], [data]);

    const filteredData = useMemo(() =>
        data.filter(p =>
        (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="space-y-8 animate-in fade-in duration-700 pb-10 font-medium">
            <header className="flex flex-col xl:flex-row justify-between xl:items-end gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-black text-[#1B1E32] tracking-tighter">Leads Hub</h1>
                    <p className="text-[#9295A3] text-sm font-bold indent-1 border-l-4 border-[#4DCC9D] pl-4">Gestiona y califica tus prospectos recolectados</p>
                </div>

                <div className="flex gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#4DCC9D] transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar en tus leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-zinc-100 pl-12 pr-5 py-4 text-sm rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 shadow-xl shadow-zinc-200/20 transition-all font-semibold"
                        />
                    </div>
                    <button className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-zinc-50 text-[#1B1E32] rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-zinc-100 transition-all shadow-xl shadow-zinc-200/20 active:scale-95">
                        <Filter size={14} /> Filtros
                    </button>
                </div>
            </header>

            {/* Compact Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                    { label: 'Total Encontrados', val: stats.total, color: 'text-[#1B1E32]', bg: 'bg-white', icon: <Search size={16} className="text-[#9295A3]" /> },
                    { label: 'Página Actual', val: `${pageIndex + 1} de ${pageCount}`, color: 'text-[#1B1E32]', bg: 'bg-white', icon: <Tag size={16} className="text-[#4DCC9D]" /> },
                    { label: 'Estado del Motor', val: 'Activo', color: 'text-[#4DCC9D]', bg: 'bg-[#4DCC9D]/5', icon: <Globe size={16} className="text-[#4DCC9D]" /> },
                ].map((stat, i) => (
                    <div key={i} className={`border border-zinc-100/80 p-6 rounded-[2.25rem] shadow-xl shadow-zinc-200/30 flex items-center gap-5 ${stat.bg} hover:-translate-y-1 transition-all group`}>
                        <div className="p-4 bg-[#EDF2F7]/50 border border-zinc-100 rounded-2xl group-hover:scale-110 transition-transform">
                            {stat.icon}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[#9295A3] text-[9px] uppercase font-black tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <p className={`text-base font-black ${stat.color} tracking-tight`}>{stat.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Leads Table Container */}
            <div className="bg-white border border-zinc-100 rounded-[2.75rem] overflow-hidden shadow-2xl shadow-zinc-200/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id} className="bg-[#EDF2F7]/40 border-b border-zinc-100">
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-10 py-5 text-[10px] font-black text-[#9295A3] uppercase tracking-[0.25em]">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[#EDF2F7]">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-10 py-8 h-20">
                                            <div className="h-full bg-zinc-50 rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-[#EDF2F7]/20 transition-all duration-300 group">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-10 py-3 transition-colors">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Refined Pagination */}
                <div className="flex items-center justify-between px-10 py-8 bg-[#EDF2F7]/10 border-t border-zinc-100">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <span className="text-[#9295A3] text-[10px] font-black uppercase tracking-widest">Filas</span>
                            <select
                                value={pageSize}
                                onChange={e => table.setPageSize(Number(e.target.value))}
                                className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-[10px] font-black focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all cursor-pointer shadow-sm"
                            >
                                {[10, 20, 30, 50].map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                        </div>
                        <span className="text-[#9295A3] text-[10px] font-black tracking-widest uppercase hidden md:block">
                            <span className="text-[#1B1E32]">{data.length}</span> de {stats.total} leads
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
                <div className="text-center py-24 bg-white rounded-[3.5rem] border-4 border-dashed border-[#EDF2F7] shadow-inner">
                    <div className="p-8 bg-[#4DCC9D]/5 rounded-full w-fit mx-auto mb-8 shadow-inner">
                        <Search size={48} className="text-[#4DCC9D]" />
                    </div>
                    <p className="text-[#1B1E32] text-xs tracking-[0.35em] uppercase font-black mb-4">No se encontraron prospectos</p>
                    <p className="text-[#9295A3] text-xs font-semibold max-w-sm mx-auto leading-relaxed">Prueba ajustando los términos de búsqueda o realiza una nueva búsqueda en el mapa.</p>
                </div>
            )}
        </div>
    );
};

export default Leads;

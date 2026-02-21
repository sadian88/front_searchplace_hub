import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../../api/api';
import {
    ArrowLeft, Save, Trash2, Globe, MapPin, Phone,
    Star, Tag, Calendar, ExternalLink, Loader2, CheckCircle
} from 'lucide-react';
import PageMeta from "../../components/common/PageMeta";

const PlaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [place, setPlace] = useState<any>(null);

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const response = await api.get(`/places/${id}`);
                setPlace(response.data);
            } catch (error) {
                console.error('Error fetching place:', error);
                navigate('/leads');
            } finally {
                setLoading(false);
            }
        };
        fetchPlace();
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPlace((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/places/${id}`, place);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            alert('Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
        try {
            await api.delete(`/places/${id}`);
            navigate('/leads');
        } catch {
            alert('Error al eliminar');
        }
    };

    if (loading) {
        return (
            <div className="flex h-80 items-center justify-center flex-col space-y-4">
                <div className="w-12 h-12 border-4 border-brand-100 dark:border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest animate-pulse">Cargando...</span>
            </div>
        );
    }

    const statusStyles: any = {
        'cliente': 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20',
        'por visita': 'bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20',
        'visitado': 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
        'descartado': 'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20'
    };

    return (
        <>
            <PageMeta title={`${place?.title} | Places Hub`} description="Detalle y edición de prospecto" />
            <div className="max-w-6xl mx-auto space-y-6 pb-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/leads')}
                            className="p-3 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl text-gray-400 hover:text-brand-500 transition-all border border-gray-200 dark:border-gray-700 group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">{place.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-200 dark:border-brand-500/20 uppercase tracking-widest flex items-center gap-1.5">
                                    <Tag size={10} /> {place.category_name || 'GENERAL'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full lg:w-auto">
                        <button onClick={handleDelete}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 hover:bg-error-50 dark:hover:bg-error-500/10 text-error-500 border border-gray-200 dark:border-gray-700 hover:border-error-200 dark:hover:border-error-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
                            <Trash2 size={15} /> Eliminar
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white rounded-xl transition-all text-xs font-bold shadow-lg uppercase tracking-widest disabled:opacity-50">
                            {saving ? <Loader2 className="animate-spin" size={15} /> : success ? <CheckCircle size={15} /> : <Save size={15} />}
                            {success ? '¡Guardado!' : 'Guardar'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="w-9 h-9 bg-brand-50 dark:bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500 border border-brand-200 dark:border-brand-500/20">
                                    <ExternalLink size={18} />
                                </div>
                                <h2 className="text-base font-bold text-gray-800 dark:text-white/90">Información General</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Nombre Comercial</label>
                                    <input name="title" value={place.title} onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <input name="phone" value={place.phone || ''} onChange={handleChange} placeholder="Sin teléfono"
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sitio Web</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <input name="website" value={place.website || ''} onChange={handleChange} placeholder="Sin sitio web"
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600" />
                                        {place.website && (
                                            <a href={place.website} target="_blank" rel="noreferrer"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-gray-800 rounded-lg text-brand-500 hover:text-brand-600 border border-gray-200 dark:border-gray-700 transition-colors">
                                                <ExternalLink size={13} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <input name="street" value={place.street || ''} onChange={handleChange}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ciudad</label>
                                    <input name="city" value={place.city || ''} onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Estado / Región</label>
                                    <input name="state" value={place.state || ''} onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm h-64 relative group">
                            <img
                                src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop'}
                                alt={place.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                            <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider drop-shadow-lg">
                                <Star size={15} className="text-amber-400 fill-amber-400" />
                                {place.image_url ? 'Vista del establecimiento' : 'Imagen por defecto'}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block text-center">Estado del Prospecto</label>
                                <select name="status" value={place.status} onChange={handleChange}
                                    className={`w-full text-center text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl border outline-none cursor-pointer transition-all ${statusStyles[place.status] || 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                    <option value="por visita">Pendiente de Visita</option>
                                    <option value="cliente">Convertido en Cliente</option>
                                    <option value="visitado">Ya Visitado</option>
                                    <option value="descartado">Lead Descartado</option>
                                </select>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-700" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-4 rounded-xl text-center hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-100 dark:hover:border-amber-500/20 transition-all">
                                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Puntaje</p>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Star size={16} className="text-amber-400 fill-amber-400" />
                                        <span className="text-2xl font-bold text-gray-800 dark:text-white/90">{place.total_score || '0.0'}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 p-4 rounded-xl text-center hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-100 dark:hover:border-brand-500/20 transition-all">
                                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Reseñas</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white/90">{place.reviews_count || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-400 rounded-xl">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 block">Capturado el</span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">{new Date(place.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 dark:bg-gray-700" />
                            <a href={place.maps_url} target="_blank" rel="noreferrer"
                                className="flex items-center justify-between group px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-gray-200 dark:border-gray-600 hover:border-brand-200 dark:hover:border-brand-500/20 rounded-xl transition-all">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-0.5">Mapa</span>
                                    <span className="text-xs font-semibold text-gray-800 dark:text-white/90">Ver en Google Maps</span>
                                </div>
                                <MapPin size={18} className="text-gray-300 dark:text-gray-500 group-hover:text-brand-500 transition-colors group-hover:scale-110" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlaceDetail;

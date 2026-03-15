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

    const inputCls = "w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white/90 rounded-xl px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600";
    const labelCls = "block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5";

    return (
        <>
            <PageMeta title={`${place?.title} | Places Hub`} description="Detalle y edición de prospecto" />
            <div className="space-y-5 pb-10">

                {/* ── Compact header bar ── */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => navigate(-1)}
                            className="p-2.5 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-xl text-gray-400 hover:text-brand-500 transition-all border border-gray-200 dark:border-gray-700 group shrink-0">
                            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold text-gray-800 dark:text-white/90 tracking-tight truncate">{place.title}</h1>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-0.5 rounded-md border border-brand-200 dark:border-brand-500/20 uppercase tracking-widest mt-0.5">
                                <Tag size={9} /> {place.category_name || 'General'}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {success && (
                            <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 px-3 py-1.5 rounded-lg">
                                <CheckCircle size={12} /> Guardado
                            </span>
                        )}
                        <button onClick={handleDelete}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-error-50 dark:hover:bg-error-500/10 text-error-500 border border-gray-200 dark:border-gray-700 hover:border-error-200 dark:hover:border-error-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Eliminar</span>
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-all text-xs font-bold shadow-lg shadow-brand-600/20 uppercase tracking-widest disabled:opacity-50">
                            {saving ? <Loader2 className="animate-spin" size={13} /> : <Save size={13} />}
                            {saving ? 'Actualizando...' : 'Actualizar'}
                        </button>
                    </div>
                </div>

                {/* ── Hero image strip ── */}
                <div className="w-full h-52 rounded-2xl overflow-hidden relative group shadow-sm border border-gray-200 dark:border-gray-700">
                    <img
                        src={place.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop'}
                        alt={place.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                    {/* overlay info */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 gap-2">
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                            {place.image_url ? 'Foto del establecimiento' : 'Imagen de referencia'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 rounded-lg">
                                <Star size={13} className="text-amber-400 fill-amber-400" />
                                <span className="text-amber-300 font-bold text-sm tabular-nums">{place.total_score || '—'}</span>
                                <span className="text-amber-300/60 text-xs">({place.reviews_count || 0} reseñas)</span>
                            </div>
                            {place.maps_url && (
                                <a href={place.maps_url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all">
                                    <MapPin size={12} /> Ver en Maps
                                </a>
                            )}
                            {place.website && (
                                <a href={place.website} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all">
                                    <Globe size={12} /> Sitio web
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Main content: form + meta ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* ── Form columns (8/12) ── */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Contacto */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-500 border border-brand-100 dark:border-brand-500/20">
                                    <Phone size={14} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-white/90">Datos de Contacto</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Title spans full */}
                                <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
                                    <label className={labelCls}>Nombre Comercial</label>
                                    <input name="title" value={place.title || ''} onChange={handleChange} className={inputCls} />
                                </div>
                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Teléfono</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={13} />
                                        <input name="phone" value={place.phone || ''} onChange={handleChange} placeholder="—"
                                            className={`${inputCls} pl-9`} />
                                    </div>
                                </div>
                                {/* Website spans 2 */}
                                <div className="sm:col-span-1 lg:col-span-2 space-y-1.5">
                                    <label className={labelCls}>Sitio Web</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={13} />
                                        <input name="website" value={place.website || ''} onChange={handleChange} placeholder="—"
                                            className={`${inputCls} pl-9 ${place.website ? 'pr-10' : ''}`} />
                                        {place.website && (
                                            <a href={place.website} target="_blank" rel="noreferrer"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white dark:bg-gray-800 rounded-lg text-brand-500 hover:text-brand-600 border border-gray-200 dark:border-gray-700 transition-colors">
                                                <ExternalLink size={12} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-500 border border-purple-100 dark:border-purple-500/20">
                                    <MapPin size={14} />
                                </div>
                                <h2 className="text-sm font-bold text-gray-800 dark:text-white/90">Ubicación</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Street spans full */}
                                <div className="sm:col-span-3 space-y-1.5">
                                    <label className={labelCls}>Dirección</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={13} />
                                        <input name="street" value={place.street || ''} onChange={handleChange} className={`${inputCls} pl-9`} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Ciudad</label>
                                    <input name="city" value={place.city || ''} onChange={handleChange} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>Estado / Región</label>
                                    <input name="state" value={place.state || ''} onChange={handleChange} className={inputCls} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelCls}>País</label>
                                    <input name="country_code" value={place.country_code || ''} onChange={handleChange}
                                        placeholder="CO" className={inputCls} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Meta sidebar (4/12) ── */}
                    <div className="lg:col-span-4 space-y-4">

                        {/* Status */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                            <label className={`${labelCls} text-center`}>Estado del Prospecto</label>
                            <select name="status" value={place.status} onChange={handleChange}
                                className={`w-full text-center text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl border outline-none cursor-pointer transition-all mt-1.5 ${statusStyles[place.status] || 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                <option value="por visita">Pendiente de Visita</option>
                                <option value="cliente">Convertido en Cliente</option>
                                <option value="visitado">Ya Visitado</option>
                                <option value="descartado">Lead Descartado</option>
                            </select>
                        </div>

                        {/* Score + Reviews */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm text-center hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors">
                                <p className={labelCls}>Puntaje</p>
                                <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <Star size={15} className="text-amber-400 fill-amber-400" />
                                    <span className="text-2xl font-extrabold text-gray-800 dark:text-white/90 tabular-nums">{place.total_score || '—'}</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm text-center hover:border-brand-200 dark:hover:border-brand-500/30 transition-colors">
                                <p className={labelCls}>Reseñas</p>
                                <p className="text-2xl font-extrabold text-gray-800 dark:text-white/90 tabular-nums mt-2">{(place.reviews_count ?? 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Meta info */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm space-y-4">
                            {/* Captured date */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-400 border border-gray-200 dark:border-gray-600 shrink-0">
                                    <Calendar size={14} />
                                </div>
                                <div>
                                    <span className={labelCls}>Capturado el</span>
                                    <span className="text-xs font-semibold text-gray-800 dark:text-white/90">
                                        {new Date(place.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Google ID */}
                            {place.google_place_id && (
                                <>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700" />
                                    <div>
                                        <span className={labelCls}>Google Place ID</span>
                                        <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 break-all">{place.google_place_id}</span>
                                    </div>
                                </>
                            )}

                            {/* Maps link */}
                            {place.maps_url && (
                                <>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700" />
                                    <a href={place.maps_url} target="_blank" rel="noreferrer"
                                        className="flex items-center justify-between group px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-gray-200 dark:border-gray-600 hover:border-brand-200 dark:hover:border-brand-500/20 rounded-xl transition-all">
                                        <div>
                                            <span className={labelCls}>Ubicación</span>
                                            <span className="text-xs font-semibold text-gray-800 dark:text-white/90">Ver en Google Maps</span>
                                        </div>
                                        <MapPin size={16} className="text-gray-300 dark:text-gray-500 group-hover:text-brand-500 transition-colors shrink-0 ml-2" />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlaceDetail;

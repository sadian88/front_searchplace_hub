import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import {
    ArrowLeft, Save, Trash2, Globe, MapPin, Phone,
    Star, Tag, Calendar, ExternalLink, Loader2, CheckCircle
} from 'lucide-react';

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
                alert('No se pudo cargar el detalle del lugar');
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
        } catch (error) {
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
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-zinc-500" size={32} />
            </div>
        );
    }

    const statusStyles: any = {
        'cliente': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        'por visita': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        'visitado': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        'descartado': 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/leads')}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{place.title}</h1>
                        <p className="text-zinc-500 text-sm flex items-center gap-2">
                            <Tag size={12} /> {place.category_name} • ID Google: {place.google_place_id}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleDelete}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all text-sm font-bold"
                    >
                        <Trash2 size={16} /> Eliminar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl transition-all text-sm font-bold shadow-lg shadow-zinc-100/10 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {success ? '¡Guardado!' : 'Guardar Cambios'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Information Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-xl">
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <input
                                    name="title"
                                    value={place.title}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Teléfono</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                    <input
                                        name="phone"
                                        value={place.phone || ''}
                                        onChange={handleChange}
                                        placeholder="Sin teléfono"
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Sitio Web</label>
                                <div className="relative group">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                    <input
                                        name="website"
                                        value={place.website || ''}
                                        onChange={handleChange}
                                        placeholder="Sin sitio web"
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                    />
                                    {place.website && (
                                        <a href={place.website} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100">
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Dirección</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                    <input
                                        name="street"
                                        value={place.street || ''}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Ciudad</label>
                                <input
                                    name="city"
                                    value={place.city || ''}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Estado / Región</label>
                                <input
                                    name="state"
                                    value={place.state || ''}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Placeholder for results preview if any */}
                    {place.image_url && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-auto h-64">
                            <img
                                src={place.image_url}
                                alt={place.title}
                                className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700 cursor-zoom-in"
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar Stats & Settings */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="space-y-1.5 text-center">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Estado del Prospecto</label>
                            <select
                                name="status"
                                value={place.status}
                                onChange={handleChange}
                                className={`w-full text-center text-sm font-bold uppercase tracking-wider px-3 py-3 rounded-xl border outline-none bg-transparent cursor-pointer transition-all ${statusStyles[place.status]}`}
                            >
                                <option value="por visita" className="bg-zinc-950 text-white">Por Visita</option>
                                <option value="cliente" className="bg-zinc-950 text-white">Cliente</option>
                                <option value="visitado" className="bg-zinc-950 text-white">Visitado</option>
                                <option value="descartado" className="bg-zinc-950 text-white">Descartado</option>
                            </select>
                        </div>
                        <div className="h-px bg-zinc-800"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 text-center">
                                <p className="text-zinc-600 text-[10px] font-bold uppercase mb-1">Puntaje</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    <span className="text-xl font-bold text-zinc-100">{place.total_score}</span>
                                </div>
                            </div>
                            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 text-center">
                                <p className="text-zinc-600 text-[10px] font-bold uppercase mb-1">Reviews</p>
                                <p className="text-xl font-bold text-zinc-100 leading-none mt-1">{place.reviews_count}</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Calendar size={16} />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Recuperado el</span>
                                <span className="text-xs">{new Date(place.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="h-px bg-zinc-800"></div>
                        <a
                            href={place.maps_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between group px-4 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors"
                        >
                            <span className="text-xs font-semibold text-zinc-300">Abrir en Google Maps</span>
                            <MapPin size={16} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetail;

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
        'cliente': 'bg-[#4DCC9D]/10 text-[#4DCC9D] border-[#4DCC9D]/20 shadow-[#4DCC9D]/5',
        'por visita': 'bg-[#9B94FF]/10 text-[#9B94FF] border-[#9B94FF]/20 shadow-[#9B94FF]/5',
        'visitado': 'bg-[#EDF2F7] text-[#9295A3] border-zinc-200',
        'descartado': 'bg-[#FF7B48]/10 text-[#FF7B48] border-[#FF7B48]/20 shadow-[#FF7B48]/5'
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 font-medium">
            {/* Header / Actions */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/leads')}
                        className="p-5 bg-white hover:bg-[#4DCC9D]/10 rounded-[2rem] text-[#9295A3] hover:text-[#4DCC9D] transition-all border border-zinc-100 hover:border-[#4DCC9D]/30 shadow-xl shadow-zinc-200/20 active:scale-90"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black text-[#1B1E32] tracking-tighter leading-tight">{place.title}</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-[#4DCC9D] bg-[#4DCC9D]/10 px-4 py-1.5 rounded-full border border-[#4DCC9D]/20 uppercase tracking-[0.25em] flex items-center gap-2">
                                <Tag size={12} /> {place.category_name || 'GENERAL'}
                            </span>
                            <span className="text-[#9295A3] text-[10px] font-bold uppercase tracking-widest hidden md:inline opacity-70">ID: {place.google_place_id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <button
                        onClick={handleDelete}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-[#FF7B48]/5 text-[#FF7B48] border border-zinc-100 hover:border-[#FF7B48]/20 rounded-[1.75rem] transition-all text-[11px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200/20 active:scale-95"
                    >
                        <Trash2 size={16} /> Eliminar Registro
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-[#1B1E32] hover:bg-black text-white rounded-[1.75rem] transition-all text-sm font-black shadow-2xl shadow-zinc-900/20 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : success ? <CheckCircle size={18} /> : <Save size={18} />}
                        <span className="uppercase tracking-widest text-[11px]">{success ? '¡Guardado!' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Information Card */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white border border-zinc-100 rounded-[2.75rem] p-8 md:p-12 shadow-2xl shadow-zinc-200/40">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-[#4DCC9D]/10 rounded-2xl flex items-center justify-center text-[#4DCC9D] border border-[#4DCC9D]/20">
                                <ExternalLink size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-[#1B1E32] tracking-tighter">Información General</h2>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] ml-3">Nombre Comercial</label>
                                <input
                                    name="title"
                                    value={place.title}
                                    onChange={handleChange}
                                    className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-2xl px-6 py-4.5 text-sm focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all shadow-inner font-semibold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] ml-3">Teléfono de Contacto</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                    <input
                                        name="phone"
                                        value={place.phone || ''}
                                        onChange={handleChange}
                                        placeholder="Sin teléfono registrado"
                                        className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-2xl pl-14 pr-6 py-4.5 text-sm focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all shadow-inner font-semibold placeholder:text-zinc-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] ml-3">Sitio Web Oficial</label>
                                <div className="relative">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                    <input
                                        name="website"
                                        value={place.website || ''}
                                        onChange={handleChange}
                                        placeholder="Sin sitio web"
                                        className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-2xl pl-14 pr-12 py-4.5 text-sm focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all shadow-inner font-semibold placeholder:text-zinc-300"
                                    />
                                    {place.website && (
                                        <a href={place.website} target="_blank" rel="noreferrer" className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl text-[#4DCC9D] hover:text-[#3CB388] border border-zinc-100 transition-colors shadow-sm">
                                            <ExternalLink size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] ml-3">Ubicación / Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                    <input
                                        name="street"
                                        value={place.street || ''}
                                        onChange={handleChange}
                                        className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-2xl pl-14 pr-6 py-4.5 text-sm focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all shadow-inner font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] ml-3">Ciudad</label>
                                <input
                                    name="city"
                                    value={place.city || ''}
                                    onChange={handleChange}
                                    className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-2xl px-6 py-4.5 text-sm focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all shadow-inner font-semibold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] ml-3">Estado / Región</label>
                                <input
                                    name="state"
                                    value={place.state || ''}
                                    onChange={handleChange}
                                    className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-2xl px-6 py-4.5 text-sm focus:ring-4 focus:ring-[#4DCC9D]/5 focus:border-[#4DCC9D]/30 outline-none transition-all shadow-inner font-semibold"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Image Preview if available */}
                    {place.image_url && (
                        <div className="bg-white border border-zinc-100 rounded-[3rem] overflow-hidden shadow-2xl h-96 relative group">
                            <img
                                src={place.image_url}
                                alt={place.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1E32]/60 via-transparent to-transparent opacity-80"></div>
                            <div className="absolute bottom-8 left-10 flex items-center gap-3 text-white font-black text-[11px] uppercase tracking-[0.2em] drop-shadow-lg">
                                <Star size={18} className="text-amber-400 fill-amber-400" /> Vista previa del establecimiento
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Stats & Status */}
                <div className="space-y-8">
                    {/* Status Selection Card */}
                    <div className="bg-white border border-zinc-100 rounded-[3rem] p-10 shadow-2xl shadow-zinc-200/40 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.3em] block text-center">Estado del Prospecto</label>
                            <select
                                name="status"
                                value={place.status}
                                onChange={handleChange}
                                className={`w-full text-center text-[10px] font-black uppercase tracking-widest px-5 py-6 rounded-[2rem] border outline-none cursor-pointer transition-all shadow-xl shadow-zinc-200/10 ${statusStyles[place.status] || 'bg-zinc-50 border-zinc-100'}`}
                            >
                                <option value="por visita">Pendiente de Visita</option>
                                <option value="cliente">Convertido en Cliente</option>
                                <option value="visitado">Ya Visitado</option>
                                <option value="descartado">Lead Descartado</option>
                            </select>
                        </div>

                        <div className="h-px bg-[#EDF2F7] mx-4"></div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="bg-[#EDF2F7]/30 p-6 rounded-[1.75rem] border border-zinc-100 text-center group hover:bg-amber-50/50 hover:border-amber-100 transition-all">
                                <p className="text-[#9295A3] text-[10px] font-black uppercase tracking-widest mb-2.5">Puntaje</p>
                                <div className="flex items-center justify-center gap-2">
                                    <Star size={20} className="text-amber-400 fill-amber-400" />
                                    <span className="text-3xl font-black text-[#1B1E32] tracking-tighter">{place.total_score || '0.0'}</span>
                                </div>
                            </div>
                            <div className="bg-[#EDF2F7]/30 p-6 rounded-[1.75rem] border border-zinc-100 text-center group hover:bg-[#4DCC9D]/5 hover:border-[#4DCC9D]/20 transition-all">
                                <p className="text-[#9295A3] text-[10px] font-black uppercase tracking-widest mb-2.5">Reseñas</p>
                                <p className="text-3xl font-black text-[#1B1E32] tracking-tighter leading-none">{place.reviews_count || 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tech Details Card */}
                    <div className="bg-white border border-zinc-100 rounded-[3rem] p-10 shadow-2xl shadow-zinc-200/40 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-[#EDF2F7]/50 rounded-2xl border border-zinc-100 text-zinc-400 shadow-inner">
                                <Calendar size={24} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black tracking-widest text-[#9295A3] mb-1">Capturado el</span>
                                <span className="text-sm font-black text-[#1B1E32] tracking-tight">{new Date(place.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="h-px bg-[#EDF2F7]"></div>

                        <div className="space-y-5">
                            <a
                                href={place.maps_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between group px-8 py-5 bg-white hover:bg-[#EDF2F7]/20 border border-zinc-100 rounded-[2rem] transition-all group active:scale-95 shadow-sm"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.2em] mb-1">Mapa</span>
                                    <span className="text-xs font-black text-[#1B1E32]">Ver en Google Maps</span>
                                </div>
                                <MapPin size={24} className="text-zinc-300 group-hover:text-[#9B94FF] transition-all group-hover:scale-110" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetail;

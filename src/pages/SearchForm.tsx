import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Play, MapPin, Search, Filter, Loader2, Target, CheckCircle, Globe, Circle as CircleIcon, Hexagon, Users } from 'lucide-react';
import MapSelector from '../components/MapSelector';

const SearchForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        search_term: 'Restaurante',
        location: 'Bogotá, Colombia',
        language: 'es',
        country: 'Colombia',
        city: 'Bogotá',
        state: 'Bogotá D.C.',
        continent: 'América del Sur',
        postal_code: '',
        latitude: 4.6097 as any,
        longitude: -74.0817 as any,
        has_website: true,
        exact_name: '',
        search_type: 'circle' as 'circle' | 'polygon',
        radius: 1,
        polygon_points: [] as [number, number][],
        max_leads: 50
    });

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/executions/categories');
                const cats = response.data;
                setCategories(cats);

                // Ensure default search_term is valid from the list
                if (cats.length > 0) {
                    const defaultCat = cats.includes('Restaurante') ? 'Restaurante' : cats[0];
                    setFormData(prev => ({
                        ...prev,
                        search_term: defaultCat
                    }));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                category: formData.search_term, // Send search_term as category for backend compatibility
                postal_code: formData.postal_code || null,
                latitude: formData.latitude === '' ? null : formData.latitude,
                longitude: formData.longitude === '' ? null : formData.longitude
            };
            await api.post('/executions/launch', submissionData);
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            alert('Error al iniciar la búsqueda');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom-5 duration-700 pb-12 font-medium">
            <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-black text-[#1B1E32] tracking-tighter">Buscador de Lugares</h1>
                <p className="text-[#9295A3] text-sm mt-3 font-semibold indent-1 border-l-4 border-[#4DCC9D] pl-4 py-1">Configura el motor de búsqueda y delimita el área geográfica de interés</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Configuration Parameters */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 space-y-8 shadow-xl shadow-zinc-200/50 transition-all hover:shadow-2xl">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.25em] flex items-center gap-2">
                                <Search size={14} className="text-[#4DCC9D]" /> Parámetros Base
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-widest ml-1">Término de Búsqueda</label>
                                    <div className="relative group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#4DCC9D] transition-colors" size={16} />
                                        <select
                                            name="search_term"
                                            value={formData.search_term}
                                            onChange={handleChange}
                                            className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-[1.25rem] pl-12 pr-4 py-4 text-sm focus:border-[#4DCC9D] focus:ring-4 focus:ring-[#4DCC9D]/5 outline-none transition-all shadow-inner font-semibold appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled>Selecciona una categoría...</option>
                                            {categories.map((cat, idx) => (
                                                <option key={idx} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300">
                                            <Filter size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 opacity-80">
                                    <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-widest ml-1">Referencia Textual (Auto)</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            readOnly
                                            placeholder="Selecciona en el mapa..."
                                            className="w-full bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-[1.25rem] pl-12 pr-4 py-4 text-sm outline-none cursor-not-allowed shadow-inner font-semibold"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#9295A3] uppercase tracking-widest ml-1">Cantidad de Prospectos</label>
                                    <div className="relative group">
                                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#4DCC9D] transition-colors" size={16} />
                                        <input
                                            type="number"
                                            name="max_leads"
                                            value={formData.max_leads}
                                            onChange={handleChange}
                                            min="1"
                                            max="500"
                                            className="w-full bg-[#EDF2F7]/50 border border-zinc-100 text-[#1B1E32] rounded-[1.25rem] pl-12 pr-4 py-4 text-sm focus:border-[#4DCC9D] focus:ring-4 focus:ring-[#4DCC9D]/5 outline-none transition-all shadow-inner font-black"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-zinc-50 mx-2"></div>

                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.25em] flex items-center gap-2">
                                <Filter size={14} className="text-[#9B94FF]" /> Filtros Adicionales
                            </h3>

                            <div className="space-y-5">
                                <div className="flex items-center gap-4 p-5 bg-[#4DCC9D]/5 rounded-[1.5rem] border border-[#4DCC9D]/20 group cursor-pointer active:scale-95 transition-all">
                                    <input
                                        type="checkbox"
                                        name="has_website"
                                        checked={formData.has_website}
                                        onChange={handleChange}
                                        id="has_web"
                                        className="w-6 h-6 rounded-lg accent-[#4DCC9D] bg-white border-zinc-200 cursor-pointer"
                                    />
                                    <label htmlFor="has_web" className="text-[#1B1E32] text-[10px] font-black cursor-pointer flex items-center gap-2 uppercase tracking-widest">
                                        <Globe size={14} className="text-[#4DCC9D]" /> Exigir Sitio Web
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            {success ? (
                                <div className="bg-[#4DCC9D] text-white p-5 rounded-[1.75rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.25em] shadow-xl shadow-[#4DCC9D]/30 animate-bounce">
                                    <CheckCircle size={20} className="text-white" />
                                    ¡Iniciado!
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1B1E32] hover:bg-black text-white font-black py-5 rounded-[1.75rem] transition-all flex items-center justify-center gap-4 disabled:bg-zinc-100 disabled:text-zinc-300 text-[11px] uppercase tracking-[0.25em] shadow-2xl shadow-zinc-200 active:scale-[0.98] group"
                                >
                                    {loading ? <Loader2 className="animate-spin text-[#4DCC9D]" size={20} /> : <Play size={20} className="text-[#4DCC9D] group-hover:translate-x-1 transition-transform" />}
                                    Iniciar Búsqueda
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Map and Area Selection */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 lg:p-10 space-y-10 shadow-xl shadow-zinc-200/40 transition-all hover:shadow-2xl">

                        {/* Search Area Selection Section */}
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-[#1B1E32] tracking-tighter flex items-center gap-2 leading-none">
                                        <Target size={22} className="text-[#4DCC9D]" /> Delimitación Geográfica
                                    </h4>
                                    <p className="text-xs text-[#9295A3] font-bold ml-8">Define visualmente el alcance exacto de tu búsqueda.</p>
                                </div>

                                <div className="flex gap-1.5 p-1.5 bg-[#EDF2F7]/50 border border-zinc-100 rounded-[1.75rem]">
                                    {[
                                        { id: 'circle', label: 'Círculo', icon: <CircleIcon size={14} /> },
                                        { id: 'polygon', label: 'Polígono', icon: <Hexagon size={14} /> }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, search_type: type.id as any }))}
                                            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${formData.search_type === type.id
                                                ? 'bg-white text-[#4DCC9D] shadow-xl border border-[#4DCC9D]/20 scale-[1.05]'
                                                : 'text-[#9295A3] hover:text-[#1B1E32]'
                                                }`}
                                        >
                                            {type.icon} {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="animate-in fade-in zoom-in-95 duration-1000 overflow-hidden rounded-[2.5rem] border-8 border-[#EDF2F7] shadow-inner">
                                <MapSelector
                                    searchType={formData.search_type}
                                    latitude={formData.latitude}
                                    longitude={formData.longitude}
                                    radius={formData.radius}
                                    polygonPoints={formData.polygon_points}
                                    onLocationChange={(lat, lng, address) => setFormData(prev => ({
                                        ...prev,
                                        latitude: lat,
                                        longitude: lng,
                                        location: address || prev.location
                                    }))}
                                    onRadiusChange={(r) => setFormData(prev => ({ ...prev, radius: r }))}
                                    onPolygonChange={(points) => setFormData(prev => ({ ...prev, polygon_points: points }))}
                                />
                            </div>

                            {/* Coordinate readout */}
                            <div className="flex items-center justify-between pt-8 border-t border-zinc-50">
                                <div className="flex gap-12">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-[#9295A3] uppercase font-black tracking-[0.25em] mb-1.5">Latitud</span>
                                        <span className="text-sm font-mono font-black text-[#4DCC9D] tracking-tighter">{parseFloat(formData.latitude).toFixed(5) || '0.000'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-[#9295A3] uppercase font-black tracking-[0.25em] mb-1.5">Longitud</span>
                                        <span className="text-sm font-mono font-black text-[#4DCC9D] tracking-tighter">{parseFloat(formData.longitude).toFixed(5) || '0.000'}</span>
                                    </div>
                                </div>
                                {formData.search_type === 'polygon' && (
                                    <div className="px-6 py-2.5 bg-[#4DCC9D]/10 text-[#4DCC9D] border border-[#4DCC9D]/20 rounded-full shadow-sm">
                                        <span className="text-[11px] font-black uppercase tracking-widest">{formData.polygon_points.length} puntos seleccionados</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SearchForm;

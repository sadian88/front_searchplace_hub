import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import { Play, MapPin, Search, Filter, Loader2, Target, CheckCircle, Globe, Circle as CircleIcon, Hexagon, Users } from 'lucide-react';
import MapSelector from '../../components/map/MapSelector';
import PageMeta from "../../components/common/PageMeta";

const SearchForm = () => {
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

    useState(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/executions/categories');
                const cats = response.data;
                setCategories(cats);
                if (cats.length > 0) {
                    const defaultCat = cats.includes('Restaurante') ? 'Restaurante' : cats[0];
                    setFormData(prev => ({ ...prev, search_term: defaultCat }));
                }
            } catch (error) { console.error('Error fetching categories:', error); }
        };
        fetchCategories();
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/executions/launch', {
                ...formData,
                category: formData.search_term,
                postal_code: formData.postal_code || null,
                latitude: formData.latitude === '' ? null : formData.latitude,
                longitude: formData.longitude === '' ? null : formData.longitude
            });
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch {
            alert('Error al iniciar la búsqueda');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Buscador de Lugares | Places Hub" description="Configura el motor de búsqueda y delimita el área geográfica de interés" />
            <div className="max-w-6xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Buscador de Lugares</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 border-l-4 border-brand-500 pl-3">Configura el motor de búsqueda y delimita el área geográfica de interés</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Panel */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Search size={12} className="text-brand-500" /> Parámetros Base
                                </h3>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Término de Búsqueda</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <select name="search_term" value={formData.search_term} onChange={handleChange}
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all appearance-none cursor-pointer" required>
                                            <option value="" disabled>Selecciona una categoría...</option>
                                            {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                                            <Filter size={12} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 opacity-70">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Referencia Textual (Auto)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <input name="location" value={formData.location} readOnly placeholder="Selecciona en el mapa..."
                                            className="w-full bg-gray-100 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700 text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none cursor-not-allowed" required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cantidad de Prospectos</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <input type="number" name="max_leads" value={formData.max_leads} onChange={handleChange}
                                            min="1" max="500" required
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-gray-700" />

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Filter size={12} className="text-purple-500" /> Filtros Adicionales
                                </h3>
                                <label className="flex items-center gap-3 p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-200 dark:border-brand-500/20 cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-all">
                                    <input type="checkbox" name="has_website" checked={formData.has_website} onChange={handleChange}
                                        className="w-4 h-4 rounded accent-brand-500 cursor-pointer" />
                                    <span className="text-[10px] font-bold text-gray-700 dark:text-white/90 uppercase tracking-widest flex items-center gap-2">
                                        <Globe size={13} className="text-brand-500" /> Exigir Sitio Web
                                    </span>
                                </label>
                            </div>

                            <div className="pt-2">
                                {success ? (
                                    <div className="bg-success-500 text-white p-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-success-500/30 animate-bounce">
                                        <CheckCircle size={18} /> ¡Iniciado!
                                    </div>
                                ) : (
                                    <button type="submit" disabled={loading}
                                        className="w-full bg-gray-800 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] group">
                                        {loading ? <Loader2 className="animate-spin text-brand-400" size={18} /> : <Play size={18} className="text-brand-500 group-hover:translate-x-0.5 transition-transform" />}
                                        Iniciar Búsqueda
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Map */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white/90 tracking-tight flex items-center gap-2">
                                        <Target size={20} className="text-brand-500" /> Delimitación Geográfica
                                    </h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 ml-7">Define visualmente el alcance exacto de tu búsqueda.</p>
                                </div>
                                <div className="flex gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                                    {[
                                        { id: 'circle', label: 'Círculo', icon: <CircleIcon size={13} /> },
                                        { id: 'polygon', label: 'Polígono', icon: <Hexagon size={13} /> }
                                    ].map(type => (
                                        <button key={type.id} type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, search_type: type.id as any }))}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.search_type === type.id ? 'bg-white dark:bg-gray-800 text-brand-500 shadow-sm border border-brand-200 dark:border-brand-500/30' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                                            {type.icon} {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <MapSelector
                                searchType={formData.search_type}
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                radius={formData.radius}
                                polygonPoints={formData.polygon_points}
                                onLocationChange={(lat, lng, address) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, location: address || prev.location }))}
                                onRadiusChange={(r) => setFormData(prev => ({ ...prev, radius: r }))}
                                onPolygonChange={(points) => setFormData(prev => ({ ...prev, polygon_points: points }))}
                            />

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-1">Latitud</span>
                                        <span className="text-sm font-mono font-bold text-brand-500 dark:text-brand-400">{parseFloat(formData.latitude).toFixed(5)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-1">Longitud</span>
                                        <span className="text-sm font-mono font-bold text-brand-500 dark:text-brand-400">{parseFloat(formData.longitude).toFixed(5)}</span>
                                    </div>
                                </div>
                                {formData.search_type === 'polygon' && (
                                    <span className="px-4 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 rounded-full text-[11px] font-bold uppercase tracking-widest">
                                        {formData.polygon_points.length} puntos
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default SearchForm;

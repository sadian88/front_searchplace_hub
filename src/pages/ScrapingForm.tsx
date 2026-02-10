import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Play, MapPin, Search, Filter, Loader2, Target, CheckCircle, Globe } from 'lucide-react';

const ScrapingForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/executions/categories');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const [formData, setFormData] = useState({
        search_term: 'Restaurantes',
        location: 'Medellín, Colombia',
        language: 'es',
        country: 'Colombia',
        city: 'Medellín',
        state: 'Antioquia',
        continent: 'América del Sur',
        postal_code: '',
        latitude: '' as any,
        longitude: '' as any,
        category: 'Restaurante',
        has_website: true,
        exact_name: ''
    });

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
            // Clean optional fields: send null if string is empty
            const submissionData = {
                ...formData,
                postal_code: formData.postal_code || null,
                latitude: formData.latitude === '' ? null : formData.latitude,
                longitude: formData.longitude === '' ? null : formData.longitude
            };
            await api.post('/executions/launch', submissionData);
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            alert('Error al lanzar el scraping');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Nueva Ejecución</h1>
                <p className="text-zinc-500 text-sm">Configura los parámetros detallados para el motor de búsqueda</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Parameters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Término Principal</label>
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                <input
                                    name="search_term"
                                    value={formData.search_term}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Ubicación de Referencia</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                                <input
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:border-zinc-700 outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Geo-Data */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                            <Target size={14} /> Geo-Localización Detallada
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { name: 'city', label: 'Ciudad' },
                                { name: 'country', label: 'País' },
                                { name: 'state', label: 'Estado' },
                                { name: 'postal_code', label: 'Cód. Postal' }
                            ].map(field => (
                                <div key={field.name} className="space-y-1.5">
                                    <span className="text-[10px] text-zinc-600 uppercase font-bold ml-1">{field.label}</span>
                                    <input
                                        name={field.name}
                                        value={(formData as any)[field.name]}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-3 py-2 text-xs focus:border-zinc-700 outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-zinc-600 uppercase font-bold ml-1">Latitud</span>
                                <input
                                    type="number" step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-3 py-2 text-xs focus:border-zinc-700 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] text-zinc-600 uppercase font-bold ml-1">Longitud</span>
                                <input
                                    type="number" step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-3 py-2 text-xs focus:border-zinc-700 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-800 w-full"></div>

                    {/* Refinement Filters */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
                            <Filter size={14} /> Refinamiento de Datos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Categoría Técnica</label>
                                <input
                                    name="category"
                                    list="search-categories"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:border-zinc-700 outline-none"
                                    placeholder="Selecciona una categoría técnica..."
                                />
                                <datalist id="search-categories">
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="space-y-1.5 gap-2 flex items-center pt-5 pl-2">
                                <input
                                    type="checkbox"
                                    name="has_website"
                                    checked={formData.has_website}
                                    onChange={handleChange}
                                    id="has_web"
                                    className="w-4 h-4 rounded-md accent-white bg-zinc-950 border-zinc-800"
                                />
                                <label htmlFor="has_web" className="text-zinc-400 text-xs font-medium cursor-pointer flex items-center gap-1.5">
                                    <Globe size={12} /> Exigir Sitio Web
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        {success ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-center gap-3 text-sm font-bold animate-pulse">
                                <CheckCircle size={18} />
                                Procesamiento iniciado. Redirigiendo al panel...
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 text-sm uppercase tracking-widest shadow-md active:scale-[0.99]"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                                Ejecutar Scraping
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScrapingForm;

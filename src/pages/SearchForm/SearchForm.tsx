import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import {
    FiPlay, FiMapPin, FiSearch, FiCrosshair, FiCheckCircle,
    FiGlobe, FiCircle, FiOctagon, FiUsers, FiAlertTriangle,
    FiZap, FiLock, FiStar, FiX, FiSliders,
} from "react-icons/fi";
import MapSelector from '../../components/map/MapSelector';
import PageMeta from '../../components/common/PageMeta';

/* ── Nominatim reverse geocode ─────────────────────────────────────────── */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        const data = await res.json();
        if (data?.display_name) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || '';
            const road = addr.road || '';
            return road ? `${road}, ${city}` : data.display_name;
        }
    } catch { /* ignore */ }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

const SearchForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setCatInput(q);
            setFormData(prev => ({ ...prev, search_term: q }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<{ name: string; display_name: string }[]>([]);
    const [geoLoading, setGeoLoading] = useState(false);

    // Combobox
    const [catInput, setCatInput] = useState('Restaurante');
    const [catOpen, setCatOpen] = useState(false);
    const catRef = useRef<HTMLDivElement>(null);

    const filteredCats = catInput.trim()
        ? categories.filter(c =>
            c.display_name.toLowerCase().includes(catInput.toLowerCase()) ||
            c.name.toLowerCase().includes(catInput.toLowerCase())
          )
        : categories;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Plan limits
    const plan = user?.plan;
    const maxLeadsAllowed: number = plan?.max_leads_per_search ?? 500;
    const maxConcurrent: number | null = plan?.max_concurrent_searches ?? null;
    const isUnlimitedLeads = plan?.max_leads_per_search === null;
    const isUnlimitedConcurrent = plan?.max_concurrent_searches === null;

    const [runningCount, setRunningCount] = useState(0);
    const [monthlyUsage, setMonthlyUsage] = useState<{ used: number; limit: number | null; percent: number | null } | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const isAtConcurrentLimit = !isUnlimitedConcurrent && runningCount >= (maxConcurrent ?? 0);
    const isAtMonthlyLimit = monthlyUsage?.limit !== null && monthlyUsage !== null
        && monthlyUsage.limit !== null
        && monthlyUsage.used >= monthlyUsage.limit;
    const isBlocked = isAtConcurrentLimit || isAtMonthlyLimit;

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
        has_website: false,
        exact_name: '',
        search_type: 'circle' as 'circle' | 'polygon',
        radius: 1,
        polygon_points: [] as [number, number][],
        max_leads: isUnlimitedLeads ? 100 : maxLeadsAllowed,
        skip_closed: false,
        min_rating: 0,
        min_reviews: 0,
    });

    // GPS
    const handleGpsRequest = () => {
        if (!navigator.geolocation) return;
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const address = await reverseGeocode(latitude, longitude);
                setFormData(prev => ({ ...prev, latitude, longitude, location: address }));
                setGeoLoading(false);
            },
            () => setGeoLoading(false),
            { timeout: 8000 }
        );
    };

    useEffect(() => { handleGpsRequest(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        api.get('/executions/categories')
            .then(res => {
                const cats: { name: string; display_name: string }[] = res.data;
                setCategories(cats);
                if (cats.length > 0) {
                    const def = cats.find(c => c.name === 'Restaurante') ?? cats[0];
                    setFormData(prev => ({ ...prev, search_term: def.name }));
                    setCatInput(def.display_name);
                }
            })
            .catch(err => console.error('Error fetching categories:', err));
    }, []);

    useEffect(() => {
        setLoadingStats(true);
        Promise.all([
            api.get('/executions/running-count'),
            api.get('/executions/usage/monthly'),
        ])
            .then(([r, u]) => { setRunningCount(r.data.running ?? 0); setMonthlyUsage(u.data); })
            .catch(() => {})
            .finally(() => setLoadingStats(false));
    }, []);

    useEffect(() => {
        if (!isUnlimitedLeads) {
            setFormData(prev => ({ ...prev, max_leads: Math.min(prev.max_leads, maxLeadsAllowed) }));
        }
    }, [maxLeadsAllowed, isUnlimitedLeads]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        let parsed: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        if (name === 'max_leads') parsed = Math.max(1, Math.min(parseInt(parsed) || 1, maxLeadsAllowed));
        if (name === 'min_rating') parsed = parseFloat(value);
        if (name === 'min_reviews') parsed = Math.max(0, parseInt(value) || 0);
        setFormData(prev => ({ ...prev, [name]: parsed }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isBlocked) return;
        setLoading(true);
        setError('');
        try {
            const termToUse = catInput.trim() || formData.search_term;
            const matchedCat = categories.find(c => c.name === termToUse || c.display_name === termToUse);
            await api.post('/executions/launch', {
                ...formData,
                search_term: termToUse,
                category: matchedCat ? matchedCat.display_name : termToUse,
                postal_code: formData.postal_code || null,
                latitude: formData.latitude === '' ? null : formData.latitude,
                longitude: formData.longitude === '' ? null : formData.longitude,
            });
            setSuccess(true);
            setTimeout(() => navigate('/executions'), 2000);
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.code === 'CONCURRENT_LIMIT') {
                setError(data.message);
                setRunningCount(data.running ?? runningCount);
            } else if (data?.code === 'MONTHLY_LIMIT') {
                setError(data.message);
                setMonthlyUsage(prev => prev ? { ...prev, used: data.used, percent: 100 } : prev);
            } else {
                setError(data?.message || 'Error al iniciar la búsqueda. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageMeta title="Buscador de Lugares | Places Hub" description="Configura el motor de búsqueda y delimita el área geográfica de interés" />
            <form onSubmit={handleSubmit} className="space-y-3">

                {/* ── Banners de bloqueo ─────────────────────────────── */}
                {isAtConcurrentLimit && (
                    <div className="flex items-start gap-3 p-4 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-2xl">
                        <FiAlertTriangle size={16} className="text-error-500 mt-0.5 shrink-0" />
                        <p className="text-sm font-semibold text-error-700 dark:text-error-300">
                            Límite de búsquedas simultáneas alcanzado — tu plan permite {maxConcurrent} al mismo tiempo.
                        </p>
                    </div>
                )}
                {isAtMonthlyLimit && !isAtConcurrentLimit && (
                    <div className="flex items-start gap-3 p-4 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-2xl">
                        <FiAlertTriangle size={16} className="text-error-500 mt-0.5 shrink-0" />
                        <p className="text-sm font-semibold text-error-700 dark:text-error-300">
                            Límite mensual alcanzado — {monthlyUsage?.used}/{monthlyUsage?.limit} leads usados este período.
                        </p>
                    </div>
                )}

                {/* ── FILA 1: Búsqueda + leads + submit ─────────────── */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-end">

                        {/* Término de búsqueda — combobox (más compacto) */}
                        <div className="flex-1 min-w-0" ref={catRef}>
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <FiSearch size={10} className="text-brand-500" /> Término de búsqueda
                            </label>
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" size={13} />
                                <input
                                    type="text"
                                    value={catInput}
                                    onChange={e => { setCatInput(e.target.value); setCatOpen(true); }}
                                    onFocus={() => setCatOpen(true)}
                                    placeholder="Ej: Restaurante, Gimnasio..."
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white/80 rounded-xl pl-8 pr-7 py-2 text-xs focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                    required
                                />
                                {catInput && (
                                    <button type="button" onClick={() => { setCatInput(''); setCatOpen(true); setFormData(prev => ({ ...prev, search_term: '' })); }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                                        <FiX size={11} />
                                    </button>
                                )}
                                {catOpen && filteredCats.length > 0 && (
                                    <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                                        {filteredCats.map((cat, i) => (
                                            <li key={i}>
                                                <button type="button" onMouseDown={e => e.preventDefault()}
                                                    onClick={() => { setCatInput(cat.display_name); setFormData(prev => ({ ...prev, search_term: cat.name })); setCatOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 transition-colors ${formData.search_term === cat.name ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 font-semibold' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {cat.display_name}
                                                    {cat.display_name !== cat.name && <span className="ml-2 text-[10px] text-gray-400">{cat.name}</span>}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Cantidad de prospectos — destacado */}
                        <div className="lg:w-72 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-xl px-4 py-2.5">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <FiUsers size={10} /> Prospectos a buscar
                                </label>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${isUnlimitedLeads ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 border-orange-200 dark:border-orange-500/20' : 'bg-white dark:bg-gray-800 text-brand-500 border-brand-200 dark:border-brand-500/30'}`}>
                                    máx {isUnlimitedLeads ? '∞' : maxLeadsAllowed}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-brand-600 dark:text-brand-400 tabular-nums leading-none w-14 shrink-0">
                                    {formData.max_leads}
                                </span>
                                <input type="range" name="max_leads" min="1" max={maxLeadsAllowed} value={formData.max_leads}
                                    onChange={handleChange}
                                    className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-brand-500 bg-brand-200 dark:bg-brand-500/30" />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="lg:w-44 shrink-0">
                            {success ? (
                                <div className="h-[42px] bg-success-500 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-success-500/30">
                                    <FiCheckCircle size={15} /> ¡Iniciado!
                                </div>
                            ) : isBlocked ? (
                                <div className="h-[42px] w-full bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-not-allowed border border-gray-200 dark:border-gray-600">
                                    <FiLock size={14} /> Bloqueado
                                </div>
                            ) : (
                                <button type="submit" disabled={loading}
                                    className="relative overflow-hidden h-[42px] w-full bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-xs uppercase tracking-widest shadow-lg shadow-brand-600/25 active:scale-[0.98] group">
                                    {loading
                                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <FiPlay size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    }
                                    Iniciar búsqueda
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── FILA 2: Filtros horizontales + ubicación ──────── */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex flex-wrap gap-2 items-center">

                        {/* Label sección */}
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1 mr-1">
                            <FiSliders size={10} className="text-purple-400" /> Filtros
                        </span>

                        {/* has_website toggle */}
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-[11px] font-bold select-none ${
                            formData.has_website
                                ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-200 dark:border-brand-500/30 text-brand-600 dark:text-brand-400'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-brand-200 dark:hover:border-brand-500/30'
                        }`}>
                            <input type="checkbox" name="has_website" checked={formData.has_website} onChange={handleChange} className="sr-only" />
                            <FiGlobe size={12} />
                            Con sitio web
                            {formData.has_website && <FiCheckCircle size={11} className="ml-0.5" />}
                        </label>

                        {/* skip_closed toggle */}
                        <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-[11px] font-bold select-none ${
                            formData.skip_closed
                                ? 'bg-purple-50 dark:bg-purple-500/15 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400'
                                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-purple-200 dark:hover:border-purple-500/30'
                        }`}>
                            <input type="checkbox" name="skip_closed" checked={formData.skip_closed} onChange={handleChange} className="sr-only" />
                            <FiX size={12} />
                            Solo abiertos
                            {formData.skip_closed && <FiCheckCircle size={11} className="ml-0.5" />}
                        </label>

                        {/* Divider */}
                        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                        {/* min_rating */}
                        <div className="flex items-center gap-1.5">
                            <FiStar size={12} className="text-amber-400 shrink-0" />
                            <select name="min_rating" value={formData.min_rating} onChange={handleChange}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white/80 rounded-lg px-2.5 py-1.5 text-[11px] font-bold outline-none focus:border-brand-300 cursor-pointer transition-all">
                                <option value={0}>Calificación: todas</option>
                                <option value={1}>★ 1+ estrellas</option>
                                <option value={2}>★★ 2+ estrellas</option>
                                <option value={3}>★★★ 3+ estrellas</option>
                                <option value={4}>★★★★ 4+ estrellas</option>
                                <option value={4.5}>★★★★½ 4.5+</option>
                            </select>
                        </div>

                        {/* min_reviews */}
                        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 focus-within:border-brand-300 transition-all">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">Reseñas ≥</span>
                            <input type="number" name="min_reviews" value={formData.min_reviews || ''} onChange={handleChange}
                                min={0} step={5} placeholder="0"
                                className="w-12 bg-transparent text-[11px] font-bold text-gray-700 dark:text-white/80 outline-none tabular-nums" />
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Ubicación auto — readonly pill */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-lg">
                            <FiMapPin size={11} className="text-brand-400 shrink-0" />
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                                {formData.location || 'Selecciona en el mapa'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── FILA 3: Mapa a ancho completo ─────────────────── */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                    {/* Map header */}
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-white/90 flex items-center gap-2">
                            <FiCrosshair size={16} className="text-brand-500" /> Delimitación Geográfica
                        </h4>
                        <div className="flex items-center gap-2">
                            {/* Coords */}
                            <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono font-bold text-brand-500 dark:text-brand-400 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-lg">
                                <span>{parseFloat(formData.latitude).toFixed(4)}</span>
                                <span className="text-brand-300 dark:text-brand-600">/</span>
                                <span>{parseFloat(formData.longitude).toFixed(4)}</span>
                            </div>
                            {/* Polygon points badge */}
                            {formData.search_type === 'polygon' && formData.polygon_points.length > 0 && (
                                <span className="px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                    {formData.polygon_points.length} pts
                                </span>
                            )}
                            {/* Search type toggle */}
                            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                                {[
                                    { id: 'circle',  label: 'Círculo',  icon: <FiCircle size={11} /> },
                                    { id: 'polygon', label: 'Polígono', icon: <FiOctagon size={11} /> },
                                ].map(type => (
                                    <button key={type.id} type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, search_type: type.id as any }))}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                            formData.search_type === type.id
                                                ? 'bg-white dark:bg-gray-800 text-brand-500 shadow-sm border border-brand-200 dark:border-brand-500/30'
                                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}>
                                        {type.icon} {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <MapSelector
                        searchType={formData.search_type}
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        radius={formData.radius}
                        polygonPoints={formData.polygon_points}
                        onLocationChange={(lat, lng, address) =>
                            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, location: address || prev.location }))
                        }
                        onRadiusChange={r => setFormData(prev => ({ ...prev, radius: r }))}
                        onPolygonChange={points => setFormData(prev => ({ ...prev, polygon_points: points }))}
                        onGpsCenter={handleGpsRequest}
                        geoLoading={geoLoading}
                    />
                </div>

                {/* ── FILA 4: Estado del plan — barra compacta ──────── */}
                {!loadingStats && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 shadow-sm">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                            {/* Plan label */}
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                <FiZap size={10} className="text-brand-500" /> {plan?.display_name ?? 'Free'}
                            </span>

                            <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />

                            {/* Leads per search */}
                            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                <span className="font-extrabold text-gray-800 dark:text-white">{isUnlimitedLeads ? '∞' : maxLeadsAllowed}</span>
                                <span className="text-gray-400 ml-1">leads/búsqueda</span>
                            </span>

                            {/* Concurrent */}
                            <span className={`text-[11px] font-semibold ${isAtConcurrentLimit ? 'text-error-500' : runningCount > 0 ? 'text-amber-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                <span className="font-extrabold">{isUnlimitedConcurrent ? '∞' : `${runningCount}/${maxConcurrent}`}</span>
                                <span className="text-gray-400 dark:text-gray-500 ml-1">simultáneas</span>
                                {isAtConcurrentLimit && <FiLock size={11} className="inline ml-1" />}
                            </span>

                            {/* Monthly usage bar */}
                            {monthlyUsage && monthlyUsage.limit !== null && (
                                <>
                                    <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                                    <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                                        <span className={`text-[11px] font-semibold whitespace-nowrap ${
                                            (monthlyUsage.percent ?? 0) >= 90 ? 'text-error-500'
                                            : (monthlyUsage.percent ?? 0) >= 70 ? 'text-amber-500'
                                            : 'text-gray-600 dark:text-gray-300'
                                        }`}>
                                            <span className="font-extrabold">{monthlyUsage.used}</span>
                                            <span className="text-gray-400 dark:text-gray-500">/{monthlyUsage.limit} este mes</span>
                                        </span>
                                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                                            <div className={`h-full rounded-full transition-all ${
                                                (monthlyUsage.percent ?? 0) >= 90 ? 'bg-error-500'
                                                : (monthlyUsage.percent ?? 0) >= 70 ? 'bg-amber-400'
                                                : 'bg-brand-500'
                                            }`} style={{ width: `${monthlyUsage.percent ?? 0}%` }} />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Error inline */}
                            {error && (
                                <>
                                    <div className="h-3 w-px bg-gray-200 dark:bg-gray-700" />
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-error-600 dark:text-error-400">
                                        <FiAlertTriangle size={11} /> {error}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Error standalone (while stats loading) */}
                {error && loadingStats && (
                    <div className="flex items-start gap-2.5 px-4 py-3 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-xl">
                        <FiAlertTriangle size={14} className="text-error-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-error-700 dark:text-error-300 font-medium">{error}</p>
                    </div>
                )}

            </form>
        </>
    );
};

export default SearchForm;

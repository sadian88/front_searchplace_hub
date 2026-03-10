import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlay, FiMapPin, FiSearch, FiFilter, FiCrosshair, FiCheckCircle, FiGlobe, FiCircle, FiOctagon, FiUsers, FiAlertTriangle, FiZap, FiLock } from "react-icons/fi";
import MapSelector from '../../components/map/MapSelector';
import PageMeta from '../../components/common/PageMeta';

const SearchForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Pre-fill from global search bar (?q=term)
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

    // Combobox state
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

    // Plan limits from authenticated user
    const plan = user?.plan;
    const maxLeadsAllowed: number = plan?.max_leads_per_search ?? 500;   // null = unlimited → 500 UI cap
    const maxConcurrent: number | null = plan?.max_concurrent_searches ?? null;
    const isUnlimitedLeads = plan?.max_leads_per_search === null;
    const isUnlimitedConcurrent = plan?.max_concurrent_searches === null;

    // Running searches + monthly usage state
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
        has_website: true,
        exact_name: '',
        search_type: 'circle' as 'circle' | 'polygon',
        radius: 1,
        polygon_points: [] as [number, number][],
        max_leads: isUnlimitedLeads ? 100 : maxLeadsAllowed,
    });

    // Fetch categories
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

    // Fetch running count + monthly usage together
    useEffect(() => {
        setLoadingStats(true);
        Promise.all([
            api.get('/executions/running-count'),
            api.get('/executions/usage/monthly'),
        ])
            .then(([runningRes, usageRes]) => {
                setRunningCount(runningRes.data.running ?? 0);
                setMonthlyUsage(usageRes.data);
            })
            .catch(() => {})
            .finally(() => setLoadingStats(false));
    }, []);

    // Keep max_leads within plan limit if plan loads after initial render
    useEffect(() => {
        if (!isUnlimitedLeads) {
            setFormData(prev => ({
                ...prev,
                max_leads: Math.min(prev.max_leads, maxLeadsAllowed),
            }));
        }
    }, [maxLeadsAllowed, isUnlimitedLeads]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        let parsed: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'max_leads') {
            const num = Math.max(1, Math.min(parseInt(parsed) || 1, maxLeadsAllowed));
            parsed = num;
        }

        setFormData(prev => ({ ...prev, [name]: parsed }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isBlocked) return;

        setLoading(true);
        setError('');
        try {
            // Use the combobox input as search_term (free text or predefined)
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

    /* ── derived UI values ──────────────────────────────────────────────── */

    const concurrentText = isUnlimitedConcurrent
        ? '∞ simultáneas'
        : `${runningCount}/${maxConcurrent} activas`;

    const concurrentStatus = isAtConcurrentLimit
        ? 'limit'
        : runningCount > 0
            ? 'busy'
            : 'free';

    const concurrentColors = {
        free:  'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 border-success-200 dark:border-success-500/20',
        busy:  'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
        limit: 'bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 border-error-200 dark:border-error-500/20',
    };

    return (
        <>
            <PageMeta title="Buscador de Lugares | Places Hub" description="Configura el motor de búsqueda y delimita el área geográfica de interés" />
            <div className="max-w-6xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">Buscador de Lugares</h1>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 border-l-4 border-brand-500 pl-3">
                        Configura el motor de búsqueda y delimita el área geográfica de interés
                    </p>
                </div>

                {/* Blocked banners */}
                {isAtConcurrentLimit && (
                    <div className="mb-6 flex items-start gap-3 p-4 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-2xl">
                        <FiAlertTriangle size={18} className="text-error-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-error-700 dark:text-error-300">Límite de búsquedas simultáneas alcanzado</p>
                            <p className="text-xs text-error-600 dark:text-error-400 mt-0.5">
                                Tu plan permite {maxConcurrent} búsqueda(s) al mismo tiempo. Espera a que termine la actual o actualiza tu plan.
                            </p>
                        </div>
                    </div>
                )}
                {isAtMonthlyLimit && !isAtConcurrentLimit && (
                    <div className="mb-6 flex items-start gap-3 p-4 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-2xl">
                        <FiAlertTriangle size={18} className="text-error-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-error-700 dark:text-error-300">Límite mensual de leads alcanzado</p>
                            <p className="text-xs text-error-600 dark:text-error-400 mt-0.5">
                                Has usado {monthlyUsage?.used} de {monthlyUsage?.limit} leads este mes. Vuelve el próximo mes o actualiza tu plan.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Panel */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
                            <div className="space-y-5">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <FiSearch size={12} className="text-brand-500" /> Parámetros Base
                                </h3>

                                {/* Category combobox */}
                                <div className="space-y-1.5" ref={catRef}>
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        Término de Búsqueda
                                    </label>
                                    <div className="relative">
                                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none" size={14} />
                                        <input
                                            type="text"
                                            value={catInput}
                                            onChange={e => { setCatInput(e.target.value); setCatOpen(true); }}
                                            onFocus={() => setCatOpen(true)}
                                            placeholder="Ej: Restaurante, Gimnasio..."
                                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white/90 rounded-xl pl-10 pr-9 py-2.5 text-sm focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                            required
                                        />
                                        {catInput && (
                                            <button
                                                type="button"
                                                onClick={() => { setCatInput(''); setCatOpen(true); setFormData(prev => ({ ...prev, search_term: '' })); }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <FiFilter size={12} />
                                            </button>
                                        )}
                                        {/* Dropdown */}
                                        {catOpen && filteredCats.length > 0 && (
                                            <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-theme-lg overflow-hidden max-h-52 overflow-y-auto">
                                                {filteredCats.map((cat, i) => (
                                                    <li key={i}>
                                                        <button
                                                            type="button"
                                                            onMouseDown={e => e.preventDefault()}
                                                            onClick={() => {
                                                                setCatInput(cat.display_name);
                                                                setFormData(prev => ({ ...prev, search_term: cat.name }));
                                                                setCatOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
                                                                formData.search_term === cat.name ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold' : 'text-gray-700 dark:text-gray-200'
                                                            }`}
                                                        >
                                                            {cat.display_name}
                                                            {cat.display_name !== cat.name && (
                                                                <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500">{cat.name}</span>
                                                            )}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                        Escribe libremente o selecciona una sugerencia
                                    </p>
                                </div>

                                {/* Location (read-only) */}
                                <div className="space-y-1.5 opacity-70">
                                    <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                        Referencia Textual (Auto)
                                    </label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" size={14} />
                                        <input
                                            name="location"
                                            value={formData.location}
                                            readOnly
                                            placeholder="Selecciona en el mapa..."
                                            className="w-full bg-gray-100 dark:bg-gray-700/60 border border-gray-100 dark:border-gray-700 text-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Max leads — slider bounded by plan */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                            Cantidad de Prospectos
                                        </label>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                            isUnlimitedLeads
                                                ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20'
                                                : 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/20'
                                        }`}>
                                            {isUnlimitedLeads ? '∞ Sin límite' : `Máx. ${maxLeadsAllowed}`}
                                        </span>
                                    </div>

                                    {/* Value badge */}
                                    <div className="flex items-center justify-center py-2">
                                        <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl">
                                            <FiUsers size={15} className="text-brand-500" />
                                            <span className="text-2xl font-extrabold text-gray-800 dark:text-white tabular-nums leading-none">
                                                {formData.max_leads}
                                            </span>
                                            <span className="text-xs text-gray-400 font-semibold">leads</span>
                                        </div>
                                    </div>

                                    {/* Slider */}
                                    <input
                                        type="range"
                                        name="max_leads"
                                        min="1"
                                        max={maxLeadsAllowed}
                                        value={formData.max_leads}
                                        onChange={handleChange}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-500 bg-gray-200 dark:bg-gray-700"
                                    />
                                    <div className="flex justify-between text-[10px] font-semibold text-gray-400 dark:text-gray-500 -mt-1">
                                        <span>1</span>
                                        <span>{isUnlimitedLeads ? '500' : maxLeadsAllowed}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-gray-700" />

                            {/* Filters */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <FiFilter size={12} className="text-purple-500" /> Filtros Adicionales
                                </h3>
                                <label className="flex items-center gap-3 p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-200 dark:border-brand-500/20 cursor-pointer hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-all">
                                    <input
                                        type="checkbox"
                                        name="has_website"
                                        checked={formData.has_website}
                                        onChange={handleChange}
                                        className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                                    />
                                    <span className="text-[10px] font-bold text-gray-700 dark:text-white/90 uppercase tracking-widest flex items-center gap-2">
                                        <FiGlobe size={13} className="text-brand-500" /> Exigir Sitio Web
                                    </span>
                                </label>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-gray-700" />

                            {/* Plan status bar */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <FiZap size={12} className="text-brand-500" /> Estado del Plan
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Leads chip */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl">
                                        <FiUsers size={12} className="text-brand-500 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Leads / búsq.</p>
                                            <p className="text-xs font-extrabold text-gray-700 dark:text-white/80 truncate">
                                                {isUnlimitedLeads ? '∞' : maxLeadsAllowed}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Concurrent chip */}
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${concurrentColors[concurrentStatus]}`}>
                                        {concurrentStatus === 'limit'
                                            ? <FiLock size={12} className="shrink-0" />
                                            : <FiZap size={12} className="shrink-0" />
                                        }
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">Simultáneas</p>
                                            <p className="text-xs font-extrabold truncate">
                                                {loadingStats ? '...' : concurrentText}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly usage bar */}
                                {!loadingStats && monthlyUsage && monthlyUsage.limit !== null && (
                                    <div className="mt-2 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Leads este mes</p>
                                            <span className={`text-[10px] font-extrabold tabular-nums ${
                                                (monthlyUsage.percent ?? 0) >= 90 ? 'text-error-500'
                                                : (monthlyUsage.percent ?? 0) >= 70 ? 'text-amber-500'
                                                : 'text-gray-500 dark:text-gray-400'
                                            }`}>
                                                {monthlyUsage.used} / {monthlyUsage.limit}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    (monthlyUsage.percent ?? 0) >= 90 ? 'bg-error-500'
                                                    : (monthlyUsage.percent ?? 0) >= 70 ? 'bg-amber-400'
                                                    : 'bg-brand-500'
                                                }`}
                                                style={{ width: `${monthlyUsage.percent ?? 0}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2.5 px-4 py-3 bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/20 rounded-xl">
                                    <FiAlertTriangle size={14} className="text-error-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-error-700 dark:text-error-300 font-medium">{error}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="pt-1">
                                {success ? (
                                    <div className="bg-success-500 text-white p-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shadow-success-500/30 animate-bounce">
                                        <FiCheckCircle size={18} /> ¡Iniciado!
                                    </div>
                                ) : isBlocked ? (
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 text-xs uppercase tracking-widest cursor-not-allowed border border-gray-200 dark:border-gray-600">
                                        <FiLock size={16} /> Búsqueda bloqueada
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative overflow-hidden w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed text-xs uppercase tracking-widest shadow-lg shadow-brand-600/25 active:scale-[0.98] group"
                                    >
                                        {loading
                                            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <FiPlay size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                        }
                                        Iniciar Búsqueda
                                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
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
                                        <FiCrosshair size={20} className="text-brand-500" /> Delimitación Geográfica
                                    </h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 ml-7">
                                        Define visualmente el alcance exacto de tu búsqueda.
                                    </p>
                                </div>
                                <div className="flex gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl">
                                    {[
                                        { id: 'circle',  label: 'Círculo',  icon: <FiCircle size={13} /> },
                                        { id: 'polygon', label: 'Polígono', icon: <FiOctagon size={13} /> },
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, search_type: type.id as any }))}
                                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.search_type === type.id
                                                ? 'bg-white dark:bg-gray-800 text-brand-500 shadow-sm border border-brand-200 dark:border-brand-500/30'
                                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                        >
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
                                onLocationChange={(lat, lng, address) =>
                                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng, location: address || prev.location }))
                                }
                                onRadiusChange={r => setFormData(prev => ({ ...prev, radius: r }))}
                                onPolygonChange={points => setFormData(prev => ({ ...prev, polygon_points: points }))}
                            />

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex gap-8">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-1">Latitud</span>
                                        <span className="text-sm font-mono font-bold text-brand-500 dark:text-brand-400">
                                            {parseFloat(formData.latitude).toFixed(5)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-1">Longitud</span>
                                        <span className="text-sm font-mono font-bold text-brand-500 dark:text-brand-400">
                                            {parseFloat(formData.longitude).toFixed(5)}
                                        </span>
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

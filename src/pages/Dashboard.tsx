import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Users, Activity, Target } from 'lucide-react';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalLeads: 0,
        totalExecutions: 0,
        activeProcesses: 0
    });

    const fetchStats = async () => {
        try {
            const [placesRes, execsRes] = await Promise.all([
                api.get('/places', { params: { limit: 1 } }),
                api.get('/executions', { params: { limit: 1 } })
            ]);

            setStats({
                totalLeads: placesRes.data.pagination.total || 0,
                totalExecutions: execsRes.data.pagination.total || 0,
                activeProcesses: execsRes.data.data.filter((e: any) => e.status === 'running').length
            });
        } catch (error) {
            console.error("Error fetching dashboard stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Leads Totales', value: stats.totalLeads, icon: <Users size={20} />, color: 'text-[#4DCC9D]', bg: 'bg-[#4DCC9D]/10', border: 'border-[#4DCC9D]/20' },
        { label: 'Búsquedas', value: stats.totalExecutions, icon: <Activity size={20} />, color: 'text-[#9B94FF]', bg: 'bg-[#9B94FF]/10', border: 'border-[#9B94FF]/20' },
        { label: 'En Proceso', value: stats.activeProcesses, icon: <Target size={20} />, color: 'text-[#FF7B48]', bg: 'bg-[#FF7B48]/10', border: 'border-[#FF7B48]/20' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-medium">
            {/* Emerald Hero Banner (Primary Color: #4DCC9D) */}
            <header className="relative overflow-hidden bg-[#4DCC9D] bg-gradient-to-br from-[#4DCC9D] to-[#3CB388] rounded-[2.5rem] p-10 lg:p-14 shadow-2xl shadow-[#4DCC9D]/30 border border-white/20 group">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4 max-w-xl text-center md:text-left">
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight animate-in slide-in-from-left-4 duration-500">
                            ¡Hola buscador! 🚀
                        </h1>
                        <p className="text-emerald-50/90 font-bold text-base lg:text-lg leading-relaxed animate-in slide-in-from-left-6 duration-700">
                            Has generado <span className="text-white font-black underline decoration-white/30 underline-offset-4">{stats.totalLeads}</span> prospectos en tus últimas búsquedas. <br className="hidden lg:block" />
                            Sigue encontrando nuevas oportunidades hoy mismo.
                        </p>
                    </div>
                    <div className="hidden lg:block animate-in zoom-in-75 duration-700 delay-300">
                        <div className="w-48 h-48 bg-white/15 backdrop-blur-2xl rounded-[3rem] border border-white/20 flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                            <Target size={80} className="text-white opacity-90 drop-shadow-xl" />
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl" />
            </header>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <div
                        key={i}
                        className={`p-8 bg-white border border-zinc-100/80 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-zinc-200/40 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1`}
                    >
                        <div className={`p-5 ${card.bg} ${card.color} rounded-2xl shadow-sm border ${card.border} group-hover:scale-110 transition-transform duration-300`}>
                            {card.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#9295A3] uppercase tracking-[0.2em] mb-1.5">{card.label}</span>
                            <span className="text-3xl font-black text-[#1B1E32] tracking-tighter">
                                {card.value.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Activity & Tip Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 bg-white border border-zinc-100 rounded-[2.5rem] shadow-xl shadow-zinc-200/40">
                    <h3 className="text-xl font-black text-[#1B1E32] tracking-tighter mb-8 flex items-center gap-3">
                        <div className="w-2.5 h-8 bg-[#4DCC9D] rounded-full" /> Búsquedas Recientes
                    </h3>
                    <div className="space-y-5">
                        <div className="h-20 bg-[#EDF2F7]/50 rounded-[1.5rem] animate-pulse border border-zinc-50" />
                        <div className="h-20 bg-[#EDF2F7]/50 rounded-[1.5rem] animate-pulse delay-75 border border-zinc-50" />
                        <div className="h-20 bg-[#EDF2F7]/50 rounded-[1.5rem] animate-pulse delay-150 border border-zinc-50" />
                    </div>
                </div>
                <div className="p-10 bg-[#4DCC9D]/5 border border-[#4DCC9D]/20 rounded-[2.5rem] shadow-sm relative overflow-hidden flex flex-col justify-center border-dashed border-2">
                    <h3 className="text-2xl font-black text-[#1B1E32] tracking-tighter mb-4">Tip del Experto 💡</h3>
                    <p className="text-base text-[#1B1E32]/70 font-semibold leading-relaxed mb-6">
                        Usa el mapa interactivo para delimitar polígonos exactos. Esto incrementa la calidad de tus prospectos en un 40%.
                    </p>
                    <div className="w-24 h-24 bg-[#4DCC9D]/20 rounded-full blur-2xl animate-pulse ml-auto" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

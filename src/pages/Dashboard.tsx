import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { LayoutDashboard, Users, Activity, Target } from 'lucide-react';

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
        { label: 'Leads Totales', value: stats.totalLeads, icon: <Users size={20} />, color: 'text-zinc-100', bg: 'bg-zinc-100/10' },
        { label: 'Búsquedas', value: stats.totalExecutions, icon: <Activity size={20} />, color: 'text-zinc-400', bg: 'bg-zinc-800/30' },
        { label: 'En Proceso', value: stats.activeProcesses, icon: <Target size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
                    <LayoutDashboard className="text-zinc-500" /> Panel de Control
                </h1>
                <p className="text-zinc-500 mt-1">Resumen general de tu actividad en PlacesHub</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <div key={i} className={`p-6 rounded-2xl border border-zinc-800/50 ${card.bg} transition-all hover:border-zinc-700 group`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-zinc-950/50 rounded-xl border border-zinc-800 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                {card.icon}
                            </div>
                        </div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{card.label}</p>
                        <p className={`text-4xl font-black mt-2 ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                    <h3 className="text-lg font-bold text-zinc-100 mb-2">Bienvenido de nuevo</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        Desde aquí puedes monitorear el rendimiento de tus búsquedas y el crecimiento de tu base de datos de prospectos.
                        Utiliza el menú lateral para gestionar tus leads o lanzar nuevas tareas de scraping.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <button className="px-6 py-2 bg-zinc-100 text-zinc-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-white transition-colors">
                            Guía de Inicio
                        </button>
                    </div>
                </div>

                <div className="bg-zinc-900/10 border border-zinc-800/50 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-600 mb-4">
                        <Activity size={24} />
                    </div>
                    <p className="text-zinc-600 font-medium text-sm">Más estadísticas próximamente...</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

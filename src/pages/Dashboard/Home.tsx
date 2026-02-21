import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import { Users, Activity, Target, ChevronRight, TrendingUp } from 'lucide-react';
import PageMeta from "../../components/common/PageMeta";
import Chart from 'react-apexcharts';

export default function Home() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalExecutions: 0,
    activeProcesses: 0
  });
  const [recentExecutions, setRecentExecutions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<{ successRate: number, timeline: any[] } | null>(null);
  const [loadingExecs, setLoadingExecs] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const [placesRes, execsRes, recentRes, statsRes] = await Promise.all([
        api.get('/places', { params: { limit: 1 } }),
        api.get('/executions', { params: { limit: 1 } }),
        api.get('/executions', { params: { limit: 3 } }),
        api.get('/executions/stats/dashboard')
      ]);
      setStats({
        totalLeads: placesRes.data.pagination.total || 0,
        totalExecutions: execsRes.data.pagination.total || 0,
        activeProcesses: execsRes.data.data.filter((e: any) => e.status === 'running').length
      });
      setRecentExecutions(recentRes.data.data || []);
      setChartData(statsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    } finally {
      setLoadingExecs(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Leads Totales', value: stats.totalLeads, icon: <Users size={20} />, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-500/10', border: 'border-brand-200 dark:border-brand-500/20' },
    { label: 'Búsquedas', value: stats.totalExecutions, icon: <Activity size={20} />, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-200 dark:border-purple-500/20' },
    { label: 'En Proceso', value: stats.activeProcesses, icon: <Target size={20} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' },
  ];

  // Configuración del Gráfico de Área (Cronología)
  const areaChartOptions: any = {
    chart: {
      type: 'area',
      height: 310,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Outfit, sans-serif'
    },
    colors: ['#059669'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100]
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } }
    },
    xaxis: {
      categories: chartData?.timeline.map(t => new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })) || [],
      labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { style: { colors: '#94a3b8', fontSize: '10px', fontWeight: 600 } }
    },
    tooltip: {
      x: { format: 'dd MMM' },
      theme: 'light'
    }
  };

  const areaSeries = [{
    name: 'Búsquedas',
    data: chartData?.timeline.map(t => t.count) || []
  }];

  // Configuración del Gráfico Radial (Tasa de Éxito)
  const radialChartOptions: any = {
    chart: {
      type: 'radialBar',
      offsetY: -20,
      sparkline: { enabled: true },
      fontFamily: 'Outfit, sans-serif'
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e2e8f0",
          strokeWidth: '97%',
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: -2,
            fontSize: '22px',
            fontWeight: 700,
            color: '#1e293b',
            formatter: (val: number) => val + '%'
          }
        }
      }
    },
    grid: { padding: { top: -10 } },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 53, 91]
      },
    },
    colors: ['#059669'],
    labels: ['Éxito'],
  };

  const radialSeries = [chartData?.successRate || 0];

  return (
    <>
      <PageMeta
        title="Dashboard | Places Hub"
        description="Panel principal de Places Hub - Motor de búsqueda de lugares"
      />
      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="relative overflow-hidden bg-brand-600 rounded-2xl p-8 lg:p-10 shadow-lg border border-white/20">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                ¡Hola buscador! 🚀
              </h1>
              <p className="text-brand-100 text-base leading-relaxed">
                Has generado <span className="text-white font-bold">{stats.totalLeads}</span> prospectos en tus últimas búsquedas.{' '}
                Sigue encontrando nuevas oportunidades hoy mismo.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center w-36 h-36 bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20">
              <Target size={64} className="text-white opacity-90" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full -ml-10 -mb-10 blur-2xl" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map((card, i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
              <div className={`p-4 ${card.bg} ${card.color} rounded-xl border ${card.border} group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{card.label}</span>
                <span className="text-3xl font-bold text-gray-800 dark:text-white/90 tracking-tight">
                  {card.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-3">
                <div className="w-2 h-6 bg-brand-600 rounded-full" />
                Cronología de Ejecuciones
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 rounded-lg">Últimos 14 días</span>
            </div>
            <div className="min-h-[310px]">
              {chartData ? (
                <Chart options={areaChartOptions} series={areaSeries} type="area" height={310} />
              ) : (
                <div className="h-[310px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col items-center">
            <div className="w-full text-left mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 flex items-center gap-3">
                <div className="w-2 h-6 bg-purple-600 rounded-full" />
                Tasa de Éxito Jobs de Busqueda
              </h3>
              <p className="text-xs text-gray-400 mt-1 ml-5">Porcentaje de búsquedas con resultados.</p>
            </div>

            <div className="relative mt-8">
              {chartData ? (
                <>
                  <Chart options={radialChartOptions} series={radialSeries} type="radialBar" height={260} />
                  <div className="text-center mt-[-30px]">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-50 dark:bg-success-500/10 text-success-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-success-200 dark:border-success-500/20">
                      <TrendingUp size={12} /> +10%
                    </div>
                    <p className="text-xs text-gray-500 mt-6 px-4">
                      Tasa de éxito basada en tus históricos de búsqueda. ¡Sigue así!
                    </p>
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-6 flex items-center gap-3">
              <div className="w-2 h-6 bg-brand-600 rounded-full" />
              Búsquedas Recientes
            </h3>
            <div className="space-y-3">
              {loadingExecs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))
              ) : recentExecutions.length > 0 ? (
                recentExecutions.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => exec.status === 'terminado' && navigate(`/executions/${exec.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 hover:bg-brand-50 dark:hover:bg-brand-500/10 border border-gray-200 dark:border-gray-700 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 group-hover:text-brand-600 transition-colors">
                        <Activity size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800 dark:text-white/90 truncate max-w-[150px] md:max-w-xs">{exec.search_term}</p>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{exec.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border
                        ${exec.status === 'terminado' ? 'bg-success-50 text-success-600 border-success-200 dark:bg-success-500/10 dark:text-success-400' :
                          exec.status === 'running' ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400' :
                            'bg-error-50 text-error-600 border-error-200 dark:bg-error-500/10 dark:text-error-400'}`}>
                        {exec.status === 'running' ? 'En proceso' : exec.status === 'fallido' ? 'Error' : 'Listo'}
                      </span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                  <p className="text-sm text-gray-400">No hay búsquedas recientes</p>
                </div>
              )}
            </div>
          </div>
          <div className="p-8 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-2xl relative overflow-hidden flex flex-col justify-center border-dashed border-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-3">Tip del Experto 💡</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Usa el mapa interactivo para delimitar polígonos exactos. Esto incrementa la calidad de tus prospectos en un 40%.
            </p>
            <div className="w-20 h-20 bg-brand-600/20 rounded-full blur-2xl animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    </>
  );
}

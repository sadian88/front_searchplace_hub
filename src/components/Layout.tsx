import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Play, LogOut, Search, Clock, Users } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'Leads Hub', path: '/leads', icon: <Users size={18} /> },
        { name: 'Launch Scraping', path: '/scraping', icon: <Play size={18} /> },
        { name: 'Historial', path: '/executions', icon: <Clock size={18} /> },
    ];

    if (!user) return <>{children}</>;

    return (
        <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
            {/* Slim Professional Sidebar */}
            <aside className="w-60 bg-zinc-900/50 border-r border-zinc-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-3">
                    <div className="bg-zinc-100 p-1.5 rounded-md">
                        <Search size={16} className="text-zinc-900" />
                    </div>
                    <span className="text-sm font-bold tracking-tight uppercase">PlacesHub</span>
                </div>

                <nav className="flex-1 mt-4 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 ${location.pathname === item.path
                                ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                                : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50'
                                }`}
                        >
                            <span className={location.pathname === item.path ? 'text-zinc-100' : 'text-zinc-600 group-hover:text-zinc-400'}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <div className="px-3 py-3 mb-4 bg-zinc-800/20 border border-zinc-800 rounded-lg">
                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Authenticated as</p>
                        <p className="text-xs font-semibold text-zinc-300 truncate">{user.username}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors uppercase font-bold tracking-wider"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Modern Main View */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-zinc-800 flex items-center px-8 justify-between bg-zinc-950/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span>Plataforma</span>
                        <span>/</span>
                        <span className="text-zinc-200 capitalize">{location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-8 bg-[#09090b]">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;

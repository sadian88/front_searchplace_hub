import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    LogOut,
    Search,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    Menu
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, color: 'bg-[#4DCC9D]/10 text-[#4DCC9D]' },
        { name: 'Mis Leads', path: '/leads', icon: <Users size={18} />, color: 'bg-[#FF7B48]/10 text-[#FF7B48]' },
        { name: 'Buscador', path: '/buscador', icon: <Search size={18} />, color: 'bg-[#9B94FF]/10 text-[#9B94FF]' },
        { name: 'Historial', path: '/executions', icon: <Clock size={18} />, color: 'bg-zinc-100 text-zinc-600' },
    ];

    if (!user) return <>{children}</>;

    return (
        <div className="flex h-screen bg-[#F8FBFF] text-zinc-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-zinc-900/10 backdrop-blur-sm z-[100] lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Premium Pastel Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-[101] bg-white border-r border-zinc-100 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative shadow-2xl lg:shadow-none
                    ${isCollapsed ? 'w-20' : 'w-[280px]'} 
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-zinc-100 gap-3 overflow-hidden whitespace-nowrap">
                    <div className="bg-zinc-900 p-2 rounded-xl flex-shrink-0">
                        <Search size={18} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-sm font-black tracking-tight uppercase text-zinc-900">PlacesHub</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-6 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                                    ${isActive
                                        ? 'bg-zinc-50/50 border border-zinc-100/50 shadow-sm'
                                        : 'hover:bg-zinc-50'}`}
                            >
                                <div className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm
                                    ${isActive ? (item as any).color : 'bg-white text-zinc-400 group-hover:scale-110 shadow-zinc-200/50 border border-zinc-100'}`}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && (
                                    <span className={`text-sm font-bold tracking-tight transition-colors duration-300
                                        ${isActive ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-800'}`}>
                                        {item.name}
                                    </span>
                                )}

                                {/* Collapsed Tooltip */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 text-zinc-100 text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}

                                {isActive && !isCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-[#49C08D] rounded-full shadow-sm shadow-emerald-400 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Upgrade Promo Card */}
                {!isCollapsed && (
                    <div className="mx-4 mb-6 p-6 bg-emerald-50 border border-emerald-100/50 rounded-3xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-2">Upgrade to PRO</h4>
                            <p className="text-[10px] text-emerald-700/60 font-bold mb-4 leading-relaxed">Boost your search engine with advanced filters.</p>
                            <button className="w-full bg-[#49C08D] hover:bg-[#3aa578] text-white text-[10px] font-black py-2.5 rounded-xl transition-all shadow-md shadow-emerald-200 active:scale-95">
                                Upgrade Now
                            </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl group-hover:bg-emerald-400/20 transition-all duration-500" />
                    </div>
                )}

                {/* User & Collapse Control */}
                <div className="p-4 border-t border-zinc-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full px-4 py-3.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 group"
                    >
                        <div className="p-2.5 bg-white rounded-xl shadow-sm text-zinc-400 group-hover:text-rose-500 group-hover:shadow-rose-100 transition-all border border-zinc-100">
                            <LogOut size={18} />
                        </div>
                        {!isCollapsed && <span className="text-sm font-bold">Cerrar Sesión</span>}
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center gap-4 w-full px-4 py-3 text-zinc-300 hover:text-zinc-500 transition-all group mt-2"
                    >
                        <div className="p-1 group-hover:scale-125 transition-transform">
                            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </div>
                        {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-widest">Colapsar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FBFF]">
                {/* Mobile Header */}
                <header className="h-16 border-b border-zinc-100 flex items-center px-4 lg:px-8 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#49C08D] rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
                                <Search size={16} className="text-white" />
                            </div>
                            <span className="font-black text-zinc-900 tracking-tighter">PlacesHub</span>
                        </div>
                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-zinc-500 hover:bg-zinc-50 rounded-xl"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-widest hidden sm:flex">
                            <span>Plataforma</span>
                            <span className="text-zinc-200">/</span>
                            <span className="text-zinc-900">{location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1].replace(/-/g, ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-4 w-px bg-zinc-200 mx-2" />
                        <span className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">v1.2.0 stable</span>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-auto p-4 lg:p-10 bg-zinc-50/30">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;

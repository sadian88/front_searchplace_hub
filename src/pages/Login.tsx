import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, { username, password });

            if (isLogin) {
                login(response.data.token, response.data.user);
                navigate('/');
            } else {
                setIsLogin(true);
                setError('Registro exitoso. Por favor inicia sesión.');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F7FA] px-4 py-12 font-medium relative overflow-hidden">
            {/* Background Decorative Graphics */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4DCC9D]/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9B94FF]/5 rounded-full blur-[150px] animate-pulse duration-[4000ms]"></div>

            <div className="absolute top-[20%] right-[15%] w-32 h-32 bg-[#FF7B48]/5 rounded-full blur-[80px]"></div>

            {/* Floating Shapes */}
            <div className="absolute hidden lg:block top-40 left-20 text-[#4DCC9D]/10 animate-bounce duration-[3000ms]">
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="10 20" />
                </svg>
            </div>
            <div className="absolute hidden lg:block bottom-40 right-20 text-[#9B94FF]/10 animate-bounce duration-[5000ms]">
                <svg width="150" height="150" viewBox="0 0 100 100">
                    <rect x="20" y="20" width="60" height="60" rx="15" stroke="currentColor" strokeWidth="8" fill="none" transform="rotate(15 50 50)" />
                </svg>
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 relative z-10">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 overflow-hidden relative">
                    <div className="p-10 pb-4">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-black text-[#1B1E32] tracking-tighter mb-2">
                                {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
                            </h1>
                            <p className="text-[#9295A3] text-[11px] font-black uppercase tracking-[0.2em] opacity-50">
                                {isLogin ? 'Paso 1 de 1' : 'Registro de acceso'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="relative group">
                                <label className="absolute -top-6 left-0 text-[10px] font-black text-[#9295A3] uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-all">Usuario o Email</label>
                                <div className="flex items-center gap-4 py-3 border-b border-zinc-100 group-focus-within:border-[#4DCC9D] transition-all">
                                    <User size={18} className="text-[#9295A3] group-focus-within:text-[#4DCC9D] transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-transparent text-[#1B1E32] placeholder:text-zinc-300 outline-none text-sm font-semibold"
                                        placeholder="usuario@ejemplo.com"
                                        required
                                    />
                                    <div className="w-4 h-4 rounded-full border border-zinc-100 flex items-center justify-center">
                                        {username && <div className="w-1.5 h-1.5 bg-[#4DCC9D] rounded-full" />}
                                    </div>
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="absolute -top-6 left-0 text-[10px] font-black text-[#9295A3] uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-all">Contraseña</label>
                                <div className="flex items-center gap-4 py-3 border-b border-zinc-100 group-focus-within:border-[#4DCC9D] transition-all">
                                    <Lock size={18} className="text-[#9295A3] group-focus-within:text-[#4DCC9D] transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent text-[#1B1E32] placeholder:text-zinc-300 outline-none text-sm font-semibold"
                                        placeholder="Tu contraseña"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-zinc-300 hover:text-[#9295A3] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-[#FF7B48]/10 text-[#FF7B48] px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-center border border-[#FF7B48]/20 animate-in shake duration-500">
                                    {error}
                                </div>
                            )}

                            <div className="relative">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#4DCC9D] hover:bg-[#3CB388] text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 disabled:bg-zinc-100 disabled:text-zinc-300 text-sm shadow-xl shadow-[#4DCC9D]/30 active:scale-[0.98] transform relative z-10"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                                    <span className="uppercase tracking-widest text-[11px] font-black">{isLogin ? 'Entrar al Hub' : 'Crear Cuenta'}</span>
                                </button>
                                <div className="absolute inset-0 bg-[#4DCC9D] blur-2xl opacity-20 scale-90 translate-y-4 rounded-full -z-0"></div>
                            </div>
                        </form>

                        <div className="mt-8 text-center pb-20">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[#9295A3] hover:text-[#1B1E32] transition-colors text-[10px] font-black uppercase tracking-[0.15em] hover:underline underline-offset-4"
                            >
                                {isLogin ? '¿No tienes cuenta? Registrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                            </button>
                        </div>
                    </div>

                    {/* Bottom Illustration inspired by the image but using brand colors */}
                    <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none overflow-hidden translate-y-1">
                        <svg viewBox="0 0 400 120" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                            {/* Hills */}
                            <path d="M-50 120 L450 120 L450 80 Q350 40 250 70 Q150 100 50 60 L-50 90 Z" fill="#B7EBC9" opacity="0.4" />
                            <path d="M-50 120 L450 120 L450 90 Q300 60 180 90 Q80 110 -50 80 Z" fill="#4DCC9D" opacity="0.3" />
                            <path d="M-50 120 L450 120 L450 100 Q320 80 220 105 Q120 120 -50 95 Z" fill="#4DCC9D" opacity="0.6" />

                            {/* Trees (Simplified) */}
                            <g transform="translate(60, 95) scale(0.6)">
                                <rect x="-2" y="0" width="4" height="15" fill="#3CB388" />
                                <path d="M-12 0 L12 0 L0 -25 Z" fill="#4DCC9D" />
                                <path d="M-10 -15 L10 -15 L0 -35 Z" fill="#4DCC9D" />
                            </g>
                            <g transform="translate(280, 105) scale(0.8)">
                                <rect x="-2" y="0" width="4" height="15" fill="#3CB388" />
                                <circle cx="0" cy="-20" r="15" fill="#4DCC9D" />
                            </g>
                            <g transform="translate(340, 110) scale(0.5)">
                                <rect x="-2" y="0" width="4" height="15" fill="#3CB388" />
                                <path d="M-12 0 L12 0 L0 -25 Z" fill="#3CB388" />
                                <path d="M-10 -15 L10 -15 L0 -35 Z" fill="#3CB388" />
                            </g>
                        </svg>
                    </div>
                </div>

                <p className="text-center text-[#9295A3] text-[9px] uppercase font-black tracking-[0.3em] mt-10 opacity-30">
                    &copy; 2026 PlacesHub Engine &bull; Versión 1.0.4
                </p>
            </div>
        </div>
    );
};

export default Login;

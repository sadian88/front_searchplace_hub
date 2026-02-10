import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Loader2, ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 font-sans selection:bg-zinc-800">
            <div className="w-full max-w-sm">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 border border-zinc-700">
                            <ShieldCheck size={20} className="text-zinc-100" />
                        </div>
                        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                            {isLogin ? 'Acceso al Hub' : 'Registro de Usuario'}
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">
                            {isLogin ? 'Ingresa tus credenciales seguras' : 'Crea una nueva cuenta de acceso'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Usuario</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600 transition-colors group-focus-within:text-zinc-200">
                                    <User size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-zinc-700 outline-none transition-all text-sm placeholder:text-zinc-700"
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest ml-0.5">Contraseña</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600 transition-colors group-focus-within:text-zinc-200">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-zinc-700 outline-none transition-all text-sm placeholder:text-zinc-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-2 rounded-lg text-xs font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-600 text-sm shadow-sm active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                            <span>{isLogin ? 'Ingresar Sistema' : 'Confirmar Registro'}</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-medium"
                        >
                            {isLogin ? '¿No tienes cuenta? Registrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                        </button>
                    </div>
                </div>
                <p className="text-center text-zinc-700 text-[10px] uppercase font-bold tracking-tighter mt-8">
                    &copy; 2026 PlacesHub Engine &bull; Versión 1.0.4
                </p>
            </div>
        </div>
    );
};

export default Login;

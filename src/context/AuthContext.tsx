import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/* ── tipos ────────────────────────────────────────────────────────────────── */

export interface UserPlan {
    id: number;
    name: string;
    display_name: string;
    price_monthly: number;
    max_leads_per_search: number | null;    // null = unlimited
    max_concurrent_searches: number | null; // null = unlimited
    max_leads_monthly: number | null;       // null = unlimited
    can_export_csv: boolean;
    can_export_api: boolean;
    support_level: string;
    expires_at: string | null; // ISO date — null si es plan free/sin pago
}

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    plan: UserPlan;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

/* ── contexto ─────────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * Consulta /api/auth/me usando el JWT almacenado.
     * El usuario en memoria siempre viene del servidor — nunca de localStorage.
     */
    const fetchMe = useCallback(async (): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const { data } = await api.get<AuthUser>('/auth/me');
            setUser(data);
            return true;
        } catch {
            // Token inválido o expirado — limpiar
            localStorage.removeItem('token');
            return false;
        }
    }, []);

    // Hidratar al montar
    useEffect(() => {
        fetchMe().finally(() => setLoading(false));
    }, [fetchMe]);

    /**
     * login: recibe el token del servidor, lo persiste y obtiene los datos
     * del usuario directamente desde la API. Nunca almacena el objeto user.
     */
    const login = useCallback(async (token: string) => {
        localStorage.setItem('token', token);
        await fetchMe();
    }, [fetchMe]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchMe();
    }, [fetchMe]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

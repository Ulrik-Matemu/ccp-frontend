import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

type User = {
    id?: number | string;
    name?: string;
    email?: string;
    role?: string;
    isLeader?: boolean;
    roles?: string[];
    [key: string]: any;
};

type Credentials = {
    token: string;
    userId: number;
    isLeader?: boolean;
};

type AuthState = {
    userId: number | null;
    token: string | null;
    isLeader?: boolean;
};

type AuthContextType = {
    userId: number | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    isLeader: boolean;
    login: (credentials: Credentials) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "app_auth";

function readFromStorage(): AuthState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { userId: null, token: null, isLeader: false };
        return JSON.parse(raw) as AuthState;
    } catch {
        return { userId: null, token: null, isLeader: false };
    }
}

function writeToStorage(state: AuthState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // ignore write errors
    }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>(() => readFromStorage());
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        writeToStorage(auth);
    }, [auth]);

    const login = async ({ token, userId, isLeader }: Credentials) => {
        setLoading(true);
        try {
            setAuth({ token, userId, isLeader: !!isLeader });
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setAuth({ token: null, userId: null, isLeader: false });
        // optionally notify server about logout
    };

    const setUser = (user: User | null) => {
        const id = user && user.id != null ? Number(user.id) : null;
        const inferredIsLeader =
            !!(
                user &&
                (user.isLeader === true ||
                    user.role === "leader" ||
                    (Array.isArray(user.roles) && user.roles.includes("leader")))
            );
        setAuth((prev) => ({ ...prev, userId: id, isLeader: inferredIsLeader }));
    };

    const contextValue: AuthContextType = {
        userId: auth.userId,
        token: auth.token,
        loading,
        isAuthenticated: !!auth.token,
        isLeader: !!auth.isLeader,
        login,
        logout,
        setUser,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}
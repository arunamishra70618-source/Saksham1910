import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface AuthUser {
  name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check server session (httpOnly cookie)
  useEffect(() => {
    fetch(`${BASE}/api/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function login(u: AuthUser) {
    setUser(u);
    // Session cookie is already set by the server on verify-otp
    // Also keep a non-sensitive display copy in localStorage for instant load
    try {
      localStorage.setItem("dg_user_display", JSON.stringify({ name: u.name }));
    } catch {}
  }

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem("dg_user_display");
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

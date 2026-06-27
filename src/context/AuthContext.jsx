import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const me = await authApi.getMe();
    setUser(me);
    return me;
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("garo2_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        localStorage.removeItem("garo2_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credential) => {
    const data = await authApi.googleLogin(credential);
    localStorage.setItem("garo2_token", data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("garo2_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

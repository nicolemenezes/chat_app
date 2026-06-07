import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async ({ username, email, password }) => {
    const payload = { username, email, password };
    console.log("register payload:", payload);
    const { data } = await axios.post(`${API_BASE}/api/auth/register`, payload);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

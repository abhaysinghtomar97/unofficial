import React, { createContext, useContext, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("psit_user")) || null;
    } catch {
      return null;
    }
  });

  // App is immediately ready because we're restoring from localStorage
  const [bootstrapped] = useState(true);

  const login = async (username, password, college) => {
    try {
      const { data } = await api.post("/auth/login", {
        username,
        password,
        college,
      });

      if (!data.success) {
        return {
          ok: false,
          message: data.message || "Login failed",
        };
      }

      localStorage.setItem("psit_token", data.token);
      localStorage.setItem("psit_user", JSON.stringify(data.user));

      setUser(data.user);
      console.log(data.user)

      return {
        ok: true,
        user: data.user,
      };
    } catch (err) {
      return {
        ok: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("psit_user", JSON.stringify(updatedUser));
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    localStorage.removeItem("psit_token");
    localStorage.removeItem("psit_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        login,
        logout,
        bootstrapped,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import { createContext, useContext, useMemo, useState } from 'react';

import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      loading,
      error,
      async login(emailOrPhone, password) {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_or_phone: emailOrPhone, password }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data?.detail || 'Giriş başarısız');

          setAccessToken(data.access_token);
          setRefreshToken(data.refresh_token);

          const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          });
          const me = await meResponse.json();
          if (meResponse.ok) setUser(me);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Giriş sırasında hata oluştu');
          throw err;
        } finally {
          setLoading(false);
        }
      },
      logout() {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
      },
    }),
    [accessToken, refreshToken, user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth yalnızca AuthProvider içinde kullanılabilir');
  }
  return context;
}

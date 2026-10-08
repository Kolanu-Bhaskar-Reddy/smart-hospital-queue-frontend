import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const homeFor = (role) =>
  role === 'ADMIN' ? '/admin' : role === 'DOCTOR' ? '/doctor' : '/patient/doctors';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const store = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const login = async (email, password) => store((await api.post('/auth/login', { email, password })).data);
  const register = async (form) => store((await api.post('/auth/register', form)).data);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

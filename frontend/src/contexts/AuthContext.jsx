import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { user, token } = await authService.login(email, password);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      await authService.register(name, email, password);
      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao criar conta' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!authService.getToken();
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const isColaborador = () => {
    return user && user.role === 'colaborador';
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Colaborador só tem certas permissões
    if (user.role === 'colaborador') {
      const colaboradorPermissions = ['create_post', 'edit_own_post', 'delete_own_post', 'view_dashboard'];
      return colaboradorPermissions.includes(permission);
    }
    
    return false;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    isAdmin,
    isColaborador,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
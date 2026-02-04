import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario, RolUsuario } from '../types';
import { authService } from '../services/api';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Modo desarrollo: login sin backend
        if (email === 'demo@empresa.com' || email === 'admin@empresa.com') {
          const mockToken = 'dev-token-' + Date.now();
          localStorage.setItem('token', mockToken);
          const mockUser: Usuario = {
            id: 1,
            email: email,
            nombre: email === 'admin@empresa.com' ? 'Administrador' : 'Usuario',
            apellido: email === 'admin@empresa.com' ? 'Sistema' : 'Demo',
            rol: email === 'admin@empresa.com' ? RolUsuario.ADMINISTRADOR : RolUsuario.JEFE_TD,
            activo: true,
            created_at: new Date().toISOString(),
          };
          set({
            token: mockToken,
            isAuthenticated: true,
            user: mockUser,
            isLoading: false
          });
          return;
        }

        try {
          const data = await authService.login(email, password);
          localStorage.setItem('token', data.access_token);
          set({ token: data.access_token, isAuthenticated: true });
          await get().fetchUser();
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Error al iniciar sesión',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchUser: async () => {
        const token = get().token;
        // Modo desarrollo: no hacer fetch si es token de desarrollo
        if (token?.startsWith('dev-token-')) {
          set({ isLoading: false });
          return;
        }

        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Helper para verificar roles
export const hasRole = (user: Usuario | null, roles: RolUsuario[]): boolean => {
  if (!user) return false;
  return roles.includes(user.rol);
};

export const isAdmin = (user: Usuario | null): boolean => {
  return hasRole(user, [RolUsuario.ADMINISTRADOR]);
};

export const isJefeTD = (user: Usuario | null): boolean => {
  return hasRole(user, [RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR]);
};

export const isComite = (user: Usuario | null): boolean => {
  return hasRole(user, [RolUsuario.COMITE_EXPERTOS, RolUsuario.JEFE_TD, RolUsuario.ADMINISTRADOR]);
};

export const isCGEDx = (user: Usuario | null): boolean => {
  return hasRole(user, [RolUsuario.CGEDX, RolUsuario.ADMINISTRADOR]);
};

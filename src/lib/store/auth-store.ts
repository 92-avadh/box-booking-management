// Zustand Authentication Store
import { create } from 'zustand';
import { UserRole } from '../db/types';

interface AuthState {
  user: { email: string; role: UserRole } | null;
  isLoading: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: (email, role) => {
    const session = { email, role };
    if (typeof window !== 'undefined') {
      localStorage.setItem('turf_session', JSON.stringify(session));
    }
    set({ user: session });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('turf_session');
    }
    set({ user: null });
  },
  initialize: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('turf_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          set({ user: parsed, isLoading: false });
          return;
        } catch (e) {
          console.error('Error parsing stored session:', e);
        }
      }
    }
    set({ user: null, isLoading: false });
  }
}));

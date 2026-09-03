import { create } from 'zustand';

export interface AuthModalOptions {
  mode?: 'checkout' | 'general';
  view?: 'login' | 'signup';
  title?: string;
  subtitle?: string;
  redirectUrl?: string;
  onSuccess?: () => void;
}

interface AuthModalState {
  isOpen: boolean;
  mode: 'checkout' | 'general';
  view: 'login' | 'signup';
  title?: string;
  subtitle?: string;
  redirectUrl?: string;
  onSuccess?: () => void;
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  setView: (view: 'login' | 'signup') => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  mode: 'general',
  view: 'login',
  title: undefined,
  subtitle: undefined,
  redirectUrl: undefined,
  onSuccess: undefined,
  openAuthModal: (options) =>
    set({
      isOpen: true,
      mode: options?.mode || 'general',
      view: options?.view || 'login',
      title: options?.title,
      subtitle: options?.subtitle,
      redirectUrl: options?.redirectUrl,
      onSuccess: options?.onSuccess,
    }),
  closeAuthModal: () =>
    set({
      isOpen: false,
      mode: 'general',
      title: undefined,
      subtitle: undefined,
      redirectUrl: undefined,
      onSuccess: undefined,
    }),
  setView: (view) => set({ view }),
}));

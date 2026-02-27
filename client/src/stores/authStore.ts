import { create } from "zustand";
import { authAPI } from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  currentLevel: string;
  totalLearnedWords: number;
  chosenDomains: string[];
  speechEnginePreference?: "web" | "assemblyai";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    // Response from server: { session: { access_token, ... }, user: AuthUser, profile: TableUser }
    const { session, profile } = res.data;
    const token = session?.access_token;

    if (!token) throw new Error("No token received");

    const mappedUser: User = {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      currentLevel: profile.current_level || "A1",
      totalLearnedWords: profile.total_learned_words || 0,
      chosenDomains: profile.chosen_domains || [],
      speechEnginePreference: profile.speech_engine_preference || "web",
    };

    localStorage.setItem("token", token);
    set({ user: mappedUser, token, isAuthenticated: true, isLoading: false });
  },

  register: async (email: string, name: string, password: string) => {
    const res = await authAPI.register({ email, name, password });
    // Response: { user: AuthUser, session: Session }
    const { user: authUser, session } = res.data;
    const token = session?.access_token;

    if (!token) throw new Error("No token received");

    const mappedUser: User = {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.name || name,
      currentLevel: "A1", // Default
      totalLearnedWords: 0,
      chosenDomains: [],
      speechEnginePreference: "web",
    };

    localStorage.setItem("token", token);
    set({ user: mappedUser, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await authAPI.getProfile();
      // res.data is profile (snake_case)
      const data = res.data;
      const mappedUser: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        currentLevel: data.current_level || "A1",
        totalLearnedWords: data.total_learned_words || 0,
        chosenDomains: data.chosen_domains || [],
        speechEnginePreference: data.speech_engine_preference || "web",
      };
      set({ user: mappedUser, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (data: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },

  updateProfile: async (data: Partial<User>) => {
    await authAPI.updateProfile({
      name: data.name,
      chosenDomains: data.chosenDomains,
      currentLevel: data.currentLevel,
      speechEnginePreference: data.speechEnginePreference,
    });
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }));
  },
}));

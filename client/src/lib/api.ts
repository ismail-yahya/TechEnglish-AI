import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ===== Auth API =====
export const authAPI = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: {
    name?: string;
    chosenDomains?: string[];
    currentLevel?: string;
    speechEnginePreference?: "web" | "assemblyai";
  }) => api.put("/auth/profile", data),
};

// ===== Stories API =====
export const storiesAPI = {
  getAll: () => api.get("/stories"),
  getById: (id: string) => api.get(`/stories/${id}`),
  generate: (domain: string) => api.post("/stories/generate", { domain }),
  translate: (text: string) => api.post("/stories/translate", { text }),

  submitQuiz: (
    storyId: string,
    answers: {
      question_index: number;
      question: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[],
  ) => api.post(`/stories/${storyId}/quiz`, { answers }),
  sendChat: (storyId: string, message: string) =>
    api.post(`/stories/${storyId}/chat`, { message }),
};

// ===== Vocabulary API =====
export const vocabularyAPI = {
  getLearning: () => api.get("/vocabulary/learning"),
  getKnown: () => api.get("/vocabulary/known"),
  getStats: () => api.get("/vocabulary/stats"),
  addWord: (data: {
    word: string;
    translation: string;
    level?: string;
    domain?: string;
    masteryStatus?: "learning" | "known";
  }) => api.post("/vocabulary/add", data),
  addBulk: (
    words: { word: string; translation: string }[],
    level?: string,
    domain?: string,
  ) => api.post("/vocabulary/add-bulk", { words, level, domain }),
  getPracticeSession: () => api.get("/vocabulary/practice"),
  generateExercise: (wordId: string, skill: string) =>
    api.post(`/vocabulary/${wordId}/exercise`, { skill }),
  recordResult: (wordId: string, skill: string, isCorrect: boolean) =>
    api.post(`/vocabulary/${wordId}/result`, { skill, isCorrect }),
  generateNewWords: (count?: number) =>
    api.post(`/vocabulary/generate-words?count=${count || 10}`),
};

export const speechAPI = {
  transcribe: (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    return api.post("/speech/transcribe", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default api;

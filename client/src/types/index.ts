export interface User {
  id: string;
  email: string;
  name: string;
  currentLevel: string;
  totalLearnedWords: number;
  chosenDomains: string[];
  speechEnginePreference?: "web" | "assemblyai";
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  content: string; // Constructed from sentences
  summary?: string;
  sentences?: Array<{ text: string; translation: string }>;
  level: string;
  domain: string;
  completed: boolean;
  dateCreated: string;
  chatMessages: ChatMessage[];
  quizAnswers?: QuizAnswer[];
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface QuizAnswer {
  id: string;
  storyId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ChatMessage {
  id?: string;
  message: string;
  sender: "user" | "ai";
  createdAt?: string;
}

export interface Vocabulary {
  id: string;
  userId: string;
  word: string;
  translation: string;
  level: string;
  domain: string;
  dateAdded: string;
  skill_reading?: number;
  skill_listening?: number;
  skill_writing?: number;
  skill_speaking?: number;
  skill_grammar?: number;
  skill_vocabulary?: number;
  attempts: number;
  correct: number;
  lastPracticed?: string;
  masteryStatus: "learning" | "known";
  mastery_level?: number;
}

export interface VocabularyStats {
  learning: number;
  known: number;
  total: number;
  currentLevel: string;
  totalLearnedWords: number;
  wordsToNextLevel: number;
}

export interface Exercise {
  word: string;
  context?: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

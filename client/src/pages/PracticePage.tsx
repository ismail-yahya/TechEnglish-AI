import { useEffect, useState, useMemo } from "react";
import { vocabularyAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Volume2,
  CheckCircle,
  XCircle,
  Trophy,
  Mic,
  MicOff,
  RotateCcw,
  Loader2,
} from "lucide-react";
import type { Vocabulary } from "../types";
import { levenshteinDistance, cleanText } from "../lib/stringUtils";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useAuthStore } from "../stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SKILLS = ["listening", "reading", "writing", "pronunciation"] as const;
type Skill = (typeof SKILLS)[number];

const SKILL_LABELS: Record<Skill, string> = {
  listening: "🎧 Listening",
  reading: "📖 Reading",
  writing: "✍️ Writing",
  pronunciation: "🗣️ Pronunciation",
};

export default function PracticePage() {
  const navigate = useNavigate();
  const [words, setWords] = useState<Vocabulary[]>([]);

  // Queue now holds { word, skill } pairs
  const [queue, setQueue] = useState<{ word: Vocabulary; skill: Skill }[]>([]);
  const [loading, setLoading] = useState(true);

  // Current State
  const [currentIndex, setCurrentIndex] = useState(0);

  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [attempts, setAttempts] = useState(0);
  const [lastSpoken, setLastSpoken] = useState("");
  const { user } = useAuthStore();

  // Speech Recognition
  const {
    isListening,
    isTranscribing,
    transcript,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition(user?.speechEnginePreference || "web");

  // Load words
  useEffect(() => {
    loadPracticeSession();
  }, []);

  // Update input text when transcript changes (for pronunciation matches)
  useEffect(() => {
    if (transcript) {
      checkPronunciation(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const loadPracticeSession = async () => {
    try {
      const res = await vocabularyAPI.getPracticeSession();
      const practiceWords = res.data;
      setWords(practiceWords);

      // Shuffle words and assign a random skill to each
      const newQueue = [...practiceWords]
        .sort(() => Math.random() - 0.5)
        .map((word) => ({
          word,
          skill: SKILLS[Math.floor(Math.random() * SKILLS.length)],
        }));

      setQueue(newQueue);
    } catch (err) {
      console.error("Failed to load practice session:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentItem = queue[currentIndex];
  const currentWord = currentItem?.word;
  const currentSkill = currentItem?.skill;

  // Options generation for Multiple Choice (Listening / Reading)
  const options = useMemo(() => {
    if (!currentWord || words.length === 0) return [];

    // Pick 3 distractors
    const otherWords = words.filter((w) => w.id !== currentWord.id);
    const shuffledOthers = [...otherWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine with correct answer
    const choices = [currentWord, ...shuffledOthers];

    // Shuffle again
    return choices.sort(() => Math.random() - 0.5);
  }, [currentWord, words]); // Re-generate when word changes

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  // Auto-play audio when navigating to a new listening or writing word
  useEffect(() => {
    if (
      currentWord &&
      (currentSkill === "listening" || currentSkill === "writing")
    ) {
      const delay = setTimeout(() => {
        speak(currentWord.word);
      }, 300);

      return () => {
        clearTimeout(delay);
        window.speechSynthesis.cancel();
      };
    }

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWord?.word, currentSkill]);

  const handleNext = () => {
    setFeedback(null);
    setSelectedOption(null);
    setInputText("");
    setAttempts(0);
    setLastSpoken("");

    // Move to next item in queue (next word + skill)
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionComplete(true);
    }
  };

  const recordResult = async (isCorrect: boolean) => {
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    try {
      // Map 'pronunciation' to 'speaking' for backend compatibility
      const apiSkill =
        currentSkill === "pronunciation" ? "speaking" : currentSkill;
      await vocabularyAPI.recordResult(currentWord.id, apiSkill, isCorrect);
    } catch (err) {
      console.error("Failed to record result:", err);
    }
  };

  // --- Handlers for each skill ---

  const checkListening = (selectedWordId: string) => {
    if (feedback) return;
    const isCorrect = selectedWordId === currentWord.id;
    setSelectedOption(selectedWordId);
    setFeedback(isCorrect ? "correct" : "incorrect");
    recordResult(isCorrect);
  };

  const checkReading = (selectedWordId: string) => {
    if (feedback) return;
    const isCorrect = selectedWordId === currentWord.id;
    setSelectedOption(selectedWordId);
    setFeedback(isCorrect ? "correct" : "incorrect");
    recordResult(isCorrect);
  };

  const checkWriting = () => {
    if (feedback) return;
    const cleanInput = cleanText(inputText);
    const cleanTarget = cleanText(currentWord.word);
    const isCorrect = cleanInput === cleanTarget;
    setFeedback(isCorrect ? "correct" : "incorrect");
    recordResult(isCorrect);
  };

  const checkPronunciation = (spokenText: string) => {
    if (feedback) return;
    if (!spokenText) return;

    setLastSpoken(spokenText);

    const dist = levenshteinDistance(
      cleanText(spokenText),
      cleanText(currentWord.word),
    );
    // User requested strictness: Allow only 1 letter mismatch
    const isCorrect = dist <= 1;

    if (isCorrect) {
      setFeedback("correct");
      recordResult(true);
    } else {
      if (attempts === 0) {
        setAttempts(1);
      } else {
        setFeedback("incorrect");
        recordResult(false);
      }
    }
  };

  // --- Render Helpers ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <Card className="max-w-md mx-auto mt-10 p-8 glass-card border-border/50 text-center animate-in zoom-in-95 duration-300">
        <h3 className="text-xl font-bold mb-2">No words to practice</h3>
        <p className="text-muted-foreground mb-6">
          Add words to your vocabulary list first.
        </p>
        <Button
          onClick={() => navigate("/vocabulary")}
          className="rounded-full font-bold neon-glow"
        >
          Go to Vocabulary
        </Button>
      </Card>
    );
  }

  if (sessionComplete) {
    return (
      <Card className="max-w-md mx-auto mt-10 p-8 glass-panel border-accent/20 text-center animate-in zoom-in-95 duration-300 bg-accent/5 overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[80px]" />
        <CardContent className="pt-6 relative z-10">
          <Trophy size={64} className="mx-auto text-accent mb-6" />
          <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            You scored{" "}
            <span className="text-foreground font-bold">{stats.correct}</span>{" "}
            out of{" "}
            <span className="text-foreground font-bold">{stats.total}</span>
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => {
                setSessionComplete(false);
                setStats({ correct: 0, total: 0 });
                setCurrentIndex(0);

                // Re-shuffle with new random skills
                const newQueue = [...words]
                  .sort(() => Math.random() - 0.5)
                  .map((word) => ({
                    word,
                    skill: SKILLS[Math.floor(Math.random() * SKILLS.length)],
                  }));
                setQueue(newQueue);
              }}
              className="rounded-full font-bold flex items-center gap-2 neon-glow bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <RotateCcw size={16} /> Practice Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/vocabulary")}
              className="rounded-full font-bold border-border/50 hover:bg-muted"
            >
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] flex flex-col justify-center items-center max-w-4xl mx-auto px-4 py-6 slide-up">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8 glass p-3 rounded-2xl border border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/vocabulary")}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={24} />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-accent uppercase tracking-wider">
              {SKILL_LABELS[currentSkill]}
            </span>
            <div className="mt-1 flex items-center gap-3">
              <div className="text-xs text-muted-foreground">
                Word {currentIndex + 1} of {queue.length}
              </div>
            </div>
          </div>

          <div className="text-sm font-bold text-muted-foreground px-2">
            {Math.round((currentIndex / queue.length) * 100)}%
          </div>
        </div>

        {/* Main Card */}
        <Card className="glass-card border-border/50 min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-2xl">
          <CardContent className="p-4 md:p-8 w-full flex-grow flex flex-col justify-center">
            {/* --- LISTENING --- */}
            {currentSkill === "listening" && (
              <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-300">
                <button
                  onClick={() => speak(currentWord.word)}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/10 border-2 border-primary/50 flex items-center justify-center mb-6 md:mb-10 hover:bg-primary/20 hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all cursor-pointer group neon-glow"
                >
                  <Volume2
                    size={40}
                    className="text-primary group-hover:text-primary-foreground md:w-12 md:h-12"
                  />
                </button>
                <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                  Tap to listen, then select the correct word
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
                  {options.map((opt) => (
                    <Button
                      key={opt.id}
                      onClick={() => checkListening(opt.id)}
                      disabled={!!feedback}
                      variant={
                        feedback && opt.id === currentWord.id
                          ? "default"
                          : feedback &&
                              selectedOption === opt.id &&
                              opt.id !== currentWord.id
                            ? "destructive"
                            : selectedOption === opt.id
                              ? "default"
                              : "outline"
                      }
                      className={`h-auto py-4 rounded-xl font-bold text-base md:text-lg border-2 transition-all ${
                        feedback && opt.id === currentWord.id
                          ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400"
                          : feedback &&
                              selectedOption === opt.id &&
                              opt.id !== currentWord.id
                            ? "border-destructive text-destructive"
                            : "bg-background/40 hover:bg-muted"
                      }`}
                    >
                      {opt.word}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* --- READING --- */}
            {currentSkill === "reading" && (
              <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-300">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-10 text-foreground tracking-wide">
                  {currentWord.word}
                </h2>
                <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
                  Select the correct translation
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
                  {options.map((opt) => (
                    <Button
                      key={opt.id}
                      onClick={() => checkReading(opt.id)}
                      disabled={!!feedback}
                      variant="outline"
                      className={`h-auto py-4 rounded-xl font-bold text-base md:text-lg border-2 transition-all font-serif ${
                        feedback && opt.id === currentWord.id
                          ? "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400"
                          : feedback &&
                              selectedOption === opt.id &&
                              opt.id !== currentWord.id
                            ? "bg-destructive/10 border-destructive text-destructive"
                            : "bg-background/40 hover:bg-muted"
                      }`}
                    >
                      {opt.translation}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* --- WRITING --- */}
            {currentSkill === "writing" && (
              <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-300">
                <button
                  onClick={() => speak(currentWord.word)}
                  className="mb-6 md:mb-8 p-4 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20 text-primary"
                >
                  <Volume2 size={24} />
                </button>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  Type the word you hear
                </p>

                <div className="relative w-full max-w-sm">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && checkWriting()}
                    disabled={!!feedback}
                    placeholder="Type here..."
                    className={`w-full bg-background/50 border-2 rounded-2xl h-16 text-center text-xl md:text-2xl font-bold outline-none transition-all ${
                      feedback === "correct"
                        ? "border-green-500 text-green-600 dark:text-green-400"
                        : feedback === "incorrect"
                          ? "border-destructive text-destructive"
                          : "border-border/50 focus-visible:ring-primary focus-visible:border-primary"
                    }`}
                    autoFocus
                  />
                </div>

                {!feedback && (
                  <Button
                    onClick={checkWriting}
                    className="mt-6 md:mt-8 rounded-full font-bold transition-all w-full md:w-auto px-8 h-12 neon-glow"
                  >
                    Check Answer
                  </Button>
                )}
              </div>
            )}

            {/* --- PRONUNCIATION --- */}
            {currentSkill === "pronunciation" && (
              <div className="w-full flex flex-col items-center text-center animate-in fade-in duration-300">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground tracking-wide">
                  {currentWord.word}
                </h2>
                <p className="text-muted-foreground mb-8 md:mb-10 text-sm md:text-base">
                  Speak the word clearly
                </p>

                {isSpeechSupported ? (
                  <div className="flex flex-col items-center gap-6">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={!!feedback || isTranscribing}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                        isListening
                          ? "bg-destructive animate-pulse text-white shadow-destructive/50"
                          : feedback || isTranscribing
                            ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                            : "bg-primary text-primary-foreground hover:scale-110 shadow-primary/30 neon-glow"
                      }`}
                    >
                      {isListening ? (
                        <MicOff size={28} className="md:w-8 md:h-8" />
                      ) : (
                        <Mic size={28} className="md:w-8 md:h-8" />
                      )}
                    </button>
                    <p className="h-6 text-sm font-bold text-primary">
                      {isListening
                        ? "Listening..."
                        : isTranscribing
                          ? "Transcribing..."
                          : "Tap microphone to speak"}
                    </p>

                    {isTranscribing && (
                      <div className="mt-4 flex flex-col items-center animate-in fade-in">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    )}

                    {lastSpoken &&
                      !feedback &&
                      !isListening &&
                      !isTranscribing && (
                        <div className="mt-4 flex flex-col items-center animate-in fade-in">
                          <p className="text-muted-foreground text-sm">
                            You said:
                          </p>
                          <p className="text-xl font-bold text-destructive mt-1">
                            "{lastSpoken}"
                          </p>
                          {attempts >= 1 && (
                            <p className="text-accent text-sm mt-2 font-bold bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                              Incorrect. Let's try again!
                            </p>
                          )}
                        </div>
                      )}

                    {feedback && lastSpoken && (
                      <div className="mt-4 flex flex-col items-center animate-in fade-in">
                        <p className="text-muted-foreground text-sm">
                          You said:
                        </p>
                        <p
                          className={`text-xl font-bold mt-1 ${feedback === "correct" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                        >
                          "{lastSpoken}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium">
                    Speech recognition is not supported in this browser.
                  </div>
                )}
              </div>
            )}

            {/* Feedback Overlay */}
            {feedback && (
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-background/90 backdrop-blur-md border-t border-border/50 flex items-center justify-between animate-in slide-in-from-bottom-full duration-300 rounded-b-3xl">
                <div className="flex items-center gap-3">
                  {feedback === "correct" ? (
                    <CheckCircle
                      size={28}
                      className="text-green-600 dark:text-green-400 md:w-8 md:h-8"
                    />
                  ) : (
                    <XCircle
                      size={28}
                      className="text-destructive md:w-8 md:h-8"
                    />
                  )}
                  <div className="text-left">
                    <p
                      className={`font-bold text-base md:text-lg ${feedback === "correct" ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                    >
                      {feedback === "correct" ? "Excellent!" : "Incorrect"}
                    </p>
                    {feedback === "incorrect" && (
                      <p className="text-xs md:text-sm text-foreground font-medium mt-0.5">
                        Correct:{" "}
                        <span className="font-bold">
                          {currentSkill === "reading"
                            ? currentWord.translation
                            : currentWord.word}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  className={`px-6 rounded-full font-bold text-sm md:text-base transition-all ${feedback === "correct" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-muted hover:bg-muted-foreground/20 text-foreground"}`}
                >
                  Continue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

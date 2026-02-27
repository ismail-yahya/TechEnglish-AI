import { useEffect, useState } from "react";
import { vocabularyAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, Plus, Play, ChevronDown } from "lucide-react";
import type { Vocabulary, VocabularyStats } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Icons ---
const SpeakerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 5 6 9H2v6h4l5 4V5z" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SkillBadge = ({ label, level }: { label: string; level: number }) => (
  <div
    className={`flex items-center justify-between p-2 rounded-xl border backdrop-blur-sm ${
      level >= 3
        ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
        : "bg-background/40 border-border/50 text-foreground"
    }`}
  >
    <span className="text-xs font-bold">{label}</span>
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i <= level ? "bg-accent" : "bg-muted"}`}
        ></div>
      ))}
    </div>
  </div>
);

export default function VocabularyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"learning" | "known">("learning");
  const [learning, setLearning] = useState<Vocabulary[]>([]);
  const [known, setKnown] = useState<Vocabulary[]>([]);
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [learningRes, knownRes, statsRes] = await Promise.all([
        vocabularyAPI.getLearning(),
        vocabularyAPI.getKnown(),
        vocabularyAPI.getStats(),
      ]);
      setLearning(learningRes.data);
      setKnown(knownRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load vocabulary:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manual Add Logic
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddWord = async () => {
    if (!newWord || !newTranslation) return;
    setAdding(true);
    try {
      await vocabularyAPI.addWord({
        word: newWord,
        translation: newTranslation,
        masteryStatus: activeTab === "known" ? "known" : "learning",
      });
      setNewWord("");
      setNewTranslation("");
      setShowAddModal(false);
      await loadData();
    } catch (err) {
      console.error("Failed to add word:", err);
    } finally {
      setAdding(false);
    }
  };

  const currentList = activeTab === "learning" ? learning : known;
  const filtered = currentList.filter(
    (w) =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      w.translation.toLowerCase().includes(search.toLowerCase()),
  );

  const totalWords = (stats?.learning || 0) + (stats?.known || 0);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-24 slide-up max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Vocabulary</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 w-full sm:w-[200px] glass bg-background/50 border-border/50 h-10"
              />
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="neon-glow font-semibold"
            >
              <Plus size={18} className="mr-1.5" />
              Add Word
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <Card className="glass-panel border-border/50 mb-6 py-2">
          <CardContent className="p-4">
            <div className="flex justify-between mb-3 px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                {totalWords} Total Words
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  <span className="text-xs font-bold text-primary">
                    {stats?.known || 0} Known
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                  <span className="text-xs font-bold text-accent-foreground">
                    {stats?.learning || 0} Learning
                  </span>
                </div>
              </div>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
              <div
                className="h-full bg-accent"
                style={{
                  width: `${((stats?.learning || 0) / (totalWords || 1)) * 100}%`,
                }}
              ></div>
              <div
                className="h-full bg-primary"
                style={{
                  width: `${((stats?.known || 0) / (totalWords || 1)) * 100}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Switcher */}
        <div className="flex p-1.5 rounded-2xl glass-panel border border-border/50 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab("known")}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "known"
                ? "bg-primary text-primary-foreground shadow-md neon-glow"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Known
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === "learning"
                ? "bg-accent text-accent-foreground shadow-md neon-glow"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Learning
          </button>
        </div>

        {/* Word List */}
        <div className="flex flex-col gap-4">
          {filtered.map((word) => (
            <div
              key={word.id}
              className="glass-card overflow-hidden transition-all duration-300 hover:border-primary/40 group relative"
            >
              {/* Header Content */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === word.id ? null : word.id)
                }
              >
                <div className="flex items-center gap-4">
                  <button
                    className="p-3 bg-primary/10 text-primary rounded-full transition-colors hover:bg-primary/20 hover:scale-110 active:scale-95 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      const u = new SpeechSynthesisUtterance(word.word);
                      u.lang = "en-US";
                      window.speechSynthesis.speak(u);
                    }}
                  >
                    <SpeakerIcon />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold tracking-wide group-hover:text-primary transition-colors">
                      {word.word}
                    </h3>
                    {/* Progress Dots/Bar */}
                    {activeTab === "learning" && (
                      <div className="mt-2 w-24 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-accent"
                          style={{
                            width: `${word.mastery_level || 0}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    className={`text-muted-foreground transition-transform duration-300 ${expandedId === word.id ? "rotate-180" : ""}`}
                  >
                    <ChevronDown size={24} />
                  </button>
                </div>
              </div>

              {/* Collapsed translation hint */}
              {expandedId !== word.id && (
                <div className="px-6 pb-5 text-right flex justify-end">
                  <span className="text-lg font-bold text-muted-foreground font-serif rtl">
                    {word.translation}
                  </span>
                </div>
              )}

              {/* Expanded Content */}
              {expandedId === word.id && (
                <div className="px-5 pb-6 animate-in fade-in slide-in-from-top-4 duration-300 border-t border-border/30 pt-4">
                  <div className="p-4 bg-background/40 backdrop-blur-sm rounded-2xl border border-border/50 mb-5 text-right shadow-inner">
                    <span className="text-2xl font-bold font-serif text-foreground rtl">
                      {word.translation}
                    </span>
                  </div>

                  <div className="flex gap-4">
                    {activeTab === "learning" && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm font-bold uppercase tracking-wider">
                          Mastery Level ({word.mastery_level || 0}%)
                        </div>

                        {/* Mastery Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "📖 Reading", val: word.skill_reading },
                            {
                              label: "🎧 Listening",
                              val: word.skill_listening,
                            },
                            { label: "✍️ Writing", val: word.skill_writing },
                            { label: "🗣️ Speaking", val: word.skill_speaking },
                          ].map((skill) => (
                            <SkillBadge
                              key={skill.label}
                              label={skill.label}
                              level={skill.val || 0}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {activeTab === "known" && (
                      <div className="text-muted-foreground text-sm p-4 bg-muted/20 rounded-xl border border-border/30 w-full text-center">
                        This word has been mastered and added to your known
                        list.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center p-12 glass-card">
              <span className="opacity-50">No words found.</span>
            </div>
          )}
        </div>
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in p-4">
          <Card className="glass-panel w-full max-w-md slide-in-from-bottom-4 animate-in duration-300 border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Add New Word</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Word
                  </label>
                  <Input
                    className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary text-lg"
                    placeholder="e.g. Algorithm"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2 mb-8">
                  <label className="text-sm font-medium text-muted-foreground">
                    Translation
                  </label>
                  <Input
                    className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary font-serif rtl text-lg"
                    placeholder="e.g. خوارزمية"
                    value={newTranslation}
                    onChange={(e) => setNewTranslation(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddWord}
                    disabled={!newWord || !newTranslation || adding}
                    className="px-6 neon-glow"
                  >
                    {adding && (
                      <Loader2 size={16} className="animate-spin mr-2" />
                    )}
                    {adding ? "Adding..." : "Add Word"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Button */}
      {currentList.length > 0 && activeTab === "learning" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] w-full max-w-[calc(100%-2rem)] sm:max-w-[400px]">
          <Button
            size="lg"
            onClick={() => navigate("/practice")}
            className="w-full h-16 rounded-2xl font-bold text-xl shadow-2xl glass-panel bg-primary/90 text-primary-foreground hover:bg-primary border border-primary/50 neon-glow transition-all hover:scale-[1.02]"
          >
            <Play fill="currentColor" className="w-6 h-6 mr-3" />
            Practice Now
          </Button>
        </div>
      )}
    </>
  );
}

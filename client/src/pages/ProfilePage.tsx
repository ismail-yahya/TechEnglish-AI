import { useState, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import { Save, User, BookOpen, Code, Settings, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LEVELS = [
  {
    id: "A0",
    label: "Absolute Beginner (A0)",
    desc: "I know very little or no English.",
  },
  {
    id: "A1",
    label: "Elementary (A1)",
    desc: "I can understand basic phrases and tech terms.",
  },
  {
    id: "A2",
    label: "Pre-Intermediate (A2)",
    desc: "I can read simple documentation and write basic emails.",
  },
  {
    id: "B1",
    label: "Intermediate (B1)",
    desc: "I can discuss technical topics but sometimes struggle.",
  },
  {
    id: "B2",
    label: "Upper Intermediate (B2)",
    desc: "I am fluent but want to refine my technical vocabulary.",
  },
];

const DOMAINS = [
  "Frontend Development",
  "Backend Development",
  "DevOps & Cloud",
  "Data Science & AI",
  "Cybersecurity",
  "Mobile Development",
  "System Design",
  "Product Management",
  "Machine Learning and deep learning",
  "Blockchain and Web3",
  "Game Development",
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState("");
  const [currentLevel, setCurrentLevel] = useState("A1");
  const [chosenDomains, setChosenDomains] = useState<string[]>([]);
  const [speechEnginePreference, setSpeechEnginePreference] = useState<
    "web" | "assemblyai"
  >("web");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCurrentLevel(user.currentLevel || "A1");
      setChosenDomains(user.chosenDomains || []);
      setSpeechEnginePreference(user.speechEnginePreference || "web");
    }
  }, [user]);

  const toggleDomain = (domain: string) => {
    setChosenDomains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await updateProfile({
        name,
        currentLevel,
        chosenDomains,
        speechEnginePreference,
      });
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto py-8 px-4">
      <header className="mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground">
            Customize your learning experience and personal details.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        {/* Personal Info */}
        <Card className="glass-panel border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-foreground">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <User size={20} />
              </div>
              Personal Information
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted/50 border-border/50 cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* English Level */}
        <Card className="glass-panel border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-foreground">
              <div className="p-2 bg-secondary/20 rounded-lg text-secondary-foreground dark:text-secondary">
                <BookOpen size={20} />
              </div>
              English Proficiency Level
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setCurrentLevel(lvl.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    currentLevel === lvl.id
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                      : "border-border/50 bg-background/30 hover:bg-muted"
                  }`}
                >
                  <div
                    className={`font-semibold mb-1 ${
                      currentLevel === lvl.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {lvl.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {lvl.desc}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Domains */}
        <Card className="glass-panel border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-foreground">
              <div className="p-2 bg-accent/20 rounded-lg text-accent-foreground dark:text-accent">
                <Code size={20} />
              </div>
              Interest Domains
            </h2>

            <p className="text-muted-foreground mb-6 text-sm">
              Select the technical fields you want to learn about.
            </p>

            <div className="flex flex-wrap gap-3">
              {DOMAINS.map((domain) => {
                const isSelected = chosenDomains.includes(domain);
                return (
                  <Button
                    key={domain}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    onClick={() => toggleDomain(domain)}
                    className={`rounded-full transition-all ${
                      isSelected
                        ? "bg-accent/20 border-accent text-accent-foreground hover:bg-accent/30 shadow-[0_0_10px_rgba(var(--accent),0.2)]"
                        : "bg-background/30 border-border/50 hover:bg-muted"
                    }`}
                  >
                    {domain}
                  </Button>
                );
              })}
            </div>
            {chosenDomains.length === 0 && (
              <p className="text-destructive text-sm mt-3 font-medium">
                Please select at least one domain.
              </p>
            )}
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="glass-panel border-border/50">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-foreground">
              <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                <Settings size={20} />
              </div>
              App Preferences
            </h2>

            <div className="space-y-4">
              <label className="text-sm font-medium text-muted-foreground">
                Speech Recognition Engine
              </label>
              <p className="text-muted-foreground text-sm mb-4">
                Choose which engine to use for pronunciation practice. Web API
                is faster but browser-dependent. AssemblyAI uses cloud
                processing for higher accuracy.
              </p>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background/50 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={speechEnginePreference}
                onChange={(e) =>
                  setSpeechEnginePreference(
                    e.target.value as "web" | "assemblyai",
                  )
                }
              >
                <option value="web" className="bg-background">
                  Web Speech API (Fast & Local)
                </option>
                <option value="assemblyai" className="bg-background">
                  AssemblyAI (Cloud & Accurate)
                </option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex-1 min-h-[1.5rem]">
            {message && (
              <span
                className={`font-medium animate-in fade-in ${
                  message.includes("Failed")
                    ? "text-destructive"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {message}
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || chosenDomains.length === 0}
            size="lg"
            className="neon-glow ml-auto"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                Save Changes
                <Save size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

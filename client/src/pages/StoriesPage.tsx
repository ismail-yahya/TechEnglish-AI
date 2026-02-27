import { useEffect, useState } from "react";
import { storiesAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Plus, BookOpen, Search, Loader2 } from "lucide-react";
import type { Story } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const DOMAINS = [
  "General Tech",
  "Backend Development",
  "Frontend Development",
  "AI & Machine Learning",
  "DevOps & Cloud",
  "Mobile Development",
  "Data Engineering",
  "Security",
];

export default function StoriesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("General Tech");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const res = await storiesAPI.getAll();
      setStories(res.data);
    } catch (err) {
      console.error("Failed to load stories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await storiesAPI.generate(selectedDomain);
      navigate(`/stories/${res.data.id}`);
    } catch (err) {
      console.error("Failed to generate story:", err);
      setGenerating(false);
    }
  };

  const filteredStories = stories.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.domain.toLowerCase().includes(search.toLowerCase()),
  );

  const availableDomains =
    user?.currentLevel === "A0" ? ["General Tech"] : DOMAINS;

  if (loading) {
    return (
      <div
        className="loading-screen flex items-center justify-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="slide-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Stories</h1>
          <p className="text-muted-foreground">
            {stories.length} stories · Level {user?.currentLevel}
          </p>
        </div>
        <Button onClick={() => setShowGenerate(true)} className="neon-glow">
          <Plus size={18} className="mr-2" /> Generate New Story
        </Button>
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <Card className="glass-panel animate-in fade-in slide-in-from-top-4 mb-6 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Generate a New Story
            </h3>
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-sm font-medium text-foreground">
                Technical Domain
              </label>
              <div className="flex flex-wrap gap-2">
                {availableDomains.map((d) => (
                  <Button
                    key={d}
                    variant={d === selectedDomain ? "default" : "secondary"}
                    size="sm"
                    className={
                      d === selectedDomain
                        ? "neon-glow transition-all"
                        : "transition-all"
                    }
                    onClick={() => setSelectedDomain(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className={generating ? "" : "neon-glow"}
              >
                {generating ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />{" "}
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen size={18} className="mr-2" /> Generate Story
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowGenerate(false)}
                disabled={generating}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      {stories.length > 0 && (
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search stories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 glass bg-background/50 border-border/50 focus-visible:ring-primary"
          />
        </div>
      )}

      {/* Stories Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <Card
              key={story.id}
              className="glass-card cursor-pointer hover:neon-glow hover:border-primary/50 transition-all text-left flex flex-col"
              onClick={() => navigate(`/stories/${story.id}`)}
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {story.title}
                  </h3>
                  <Badge
                    variant={story.completed ? "default" : "secondary"}
                    className="shrink-0 mt-1"
                  >
                    {story.completed ? "Done" : "Reading"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                  {story.content}
                </p>
                <div className="flex flex-wrap gap-2 items-center mt-auto pt-2">
                  <Badge
                    variant="outline"
                    className="border-accent text-accent-foreground bg-accent/10"
                  >
                    {story.domain}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-primary text-primary bg-primary/10"
                  >
                    {story.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(story.dateCreated).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card text-center p-12">
          <CardContent className="pt-6">
            <BookOpen
              size={48}
              className="mx-auto mb-4 text-muted-foreground opacity-50"
            />
            <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first AI-powered technical story!
            </p>
            <Button onClick={() => setShowGenerate(true)} className="neon-glow">
              <Plus size={18} className="mr-2" /> Generate Story
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

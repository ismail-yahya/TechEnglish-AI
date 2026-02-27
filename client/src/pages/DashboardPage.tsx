import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { storiesAPI, vocabularyAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { BookOpen, Brain, Plus, Sparkles } from "lucide-react";
import type { Story, VocabularyStats } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<VocabularyStats | null>(null);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vocabRes, storiesRes] = await Promise.all([
          vocabularyAPI.getStats(),
          storiesAPI.getAll(),
        ]);
        setStats(vocabRes.data);
        setRecentStories(storiesRes.data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{ minHeight: "auto", padding: "4rem 0" }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="slide-up">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          Level{" "}
          <Badge variant="default" className="ml-1 neon-glow">
            {user?.currentLevel || "A0"}
          </Badge>
          {" · "}Keep learning to reach the next level!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Words Mastered
              </span>
              <span className="text-3xl font-extrabold text-primary">
                {stats?.known || 0}
              </span>
              <Progress
                value={Math.min(((stats?.known || 0) / 1000) * 100, 100)}
                className="h-2 mt-2 bg-muted neon-glow"
              />
              <span className="text-xs text-muted-foreground mt-1">
                {stats?.wordsToNextLevel || 1000} to next level
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Learning
              </span>
              <span className="text-3xl font-extrabold text-primary">
                {stats?.learning || 0}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Words in progress
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Stories Read
              </span>
              <span className="text-3xl font-extrabold text-primary">
                {recentStories.length}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Total stories
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card
          className="glass-card cursor-pointer hover:border-primary/50 transition-all hover:neon-glow"
          onClick={() => navigate("/stories")}
        >
          <CardContent className="flex items-center gap-4 pt-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <BookOpen size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Read Stories</h3>
              <p className="text-sm text-muted-foreground">
                Generate and read interactive tech stories
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card cursor-pointer hover:border-accent/50 transition-all hover:neon-glow"
          onClick={() => navigate("/vocabulary")}
        >
          <CardContent className="flex items-center gap-4 pt-6 text-left">
            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <Brain size={24} className="text-accent-foreground" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">Practice Vocabulary</h3>
              <p className="text-sm text-muted-foreground">
                Master words with 3 skill exercises
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Stories */}
      {recentStories.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Stories</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/stories")}
            >
              View all →
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {recentStories.map((story) => (
              <Card
                key={story.id}
                className="glass-card cursor-pointer hover:neon-glow transition-all"
                onClick={() => navigate(`/stories/${story.id}`)}
              >
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h4 className="font-semibold">{story.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {story.domain} ·{" "}
                      {new Date(story.dateCreated).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={story.completed ? "default" : "secondary"}>
                    {story.completed ? "Completed" : "In Progress"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentStories.length === 0 && (
        <Card className="glass-card text-center p-12">
          <CardContent className="pt-6">
            <Sparkles size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Start Your Journey</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Generate your first AI-powered technical English story and begin
              building your vocabulary.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/stories")}
              className="neon-glow"
            >
              <Plus size={20} className="mr-2" />
              Create Your First Story
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

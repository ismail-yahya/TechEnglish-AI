import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { storiesAPI } from "../lib/api";
import {
  ArrowLeft,
  Volume2,
  MessageSquare,
  CheckCircle,
  Send,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Story, QuizQuestion, ChatMessage } from "../types";
import { ClickableText } from "../components/ClickableText";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function StoryReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"reading" | "quiz" | "chat">("reading");

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Translation visibility state (moved to top level)
  const [visibleTranslations, setVisibleTranslations] = useState<
    Record<number, boolean>
  >({});

  // Cache for fetched translations so we don't query repeatedly
  const [fetchedTranslations, setFetchedTranslations] = useState<
    Record<number, string>
  >({});

  const [translationLoading, setTranslationLoading] = useState<
    Record<number, boolean>
  >({});

  const toggleTranslation = async (index: number, text: string) => {
    setVisibleTranslations((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    // If opening and we haven't fetched yet
    if (!visibleTranslations[index] && !fetchedTranslations[index]) {
      setTranslationLoading((prev) => ({ ...prev, [index]: true }));
      try {
        const res = await storiesAPI.translate(text);
        setFetchedTranslations((prev) => ({
          ...prev,
          [index]: res.data.translation,
        }));
      } catch (err) {
        console.error("Translation failed", err);
        setFetchedTranslations((prev) => ({
          ...prev,
          [index]: "Translation not available.",
        }));
      } finally {
        setTranslationLoading((prev) => ({ ...prev, [index]: false }));
      }
    }
  };

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    const loadStory = async () => {
      try {
        const res = await storiesAPI.getById(id!);
        setStory(res.data);
        if (res.data.chatMessages?.length > 0) {
          setChatMessages(res.data.chatMessages);
        }
      } catch (err) {
        console.error("Failed to load story:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [id]);

  // Text-to-Speech
  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  };

  // Start Quiz
  const handleStartQuiz = () => {
    if (story?.quiz && story.quiz.length > 0) {
      setQuizQuestions(story.quiz);
      setPhase("quiz");
    } else {
      showNotification("No quiz questions available for this story.", "info");
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    const answers = quizQuestions.map((q, i) => ({
      question_index: i,
      question: q.question,
      userAnswer: quizAnswers[i] || "",
      correctAnswer: q.correctAnswer,
      isCorrect: quizAnswers[i] === q.correctAnswer,
    }));

    try {
      await storiesAPI.submitQuiz(id!, answers);
      setQuizSubmitted(true);
    } catch (err) {
      console.error("Failed to submit quiz:", err);
    }
  };

  // Send Chat
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { message: msg, sender: "user" }]);
    setChatLoading(true);

    try {
      const res = await storiesAPI.sendChat(id!, msg);
      setChatMessages((prev) => [
        ...prev,
        { message: res.data.message, sender: "ai" },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { message: "Sorry, something went wrong.", sender: "ai" },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

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

  if (!story) {
    return (
      <Card className="glass-card text-center p-12">
        <h3 className="text-2xl font-semibold">Story not found</h3>
      </Card>
    );
  }

  // Render story text with clickable words
  const renderStoryText = () => {
    // If we have structured sentences (new format)
    if (story.sentences && story.sentences.length > 0) {
      return story.sentences.map((sentenceObj, si) => (
        <div
          key={si}
          className="mb-4 pb-2 border-b border-border/50 transition-colors hover:bg-muted/10 rounded-lg p-2"
        >
          <div className="flex items-start">
            <div className="flex-1 leading-relaxed text-lg">
              <ClickableText
                text={sentenceObj.text}
                level={story.level}
                domain={story.domain}
                onTranslationAction={(_w, msg, t) => showNotification(msg, t)}
              />
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleSpeak(sentenceObj.text)}
                title="Listen"
              >
                <Volume2 size={16} />
              </Button>
              <Button
                variant={visibleTranslations[si] ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 ${visibleTranslations[si] ? "neon-glow" : "text-muted-foreground"}`}
                onClick={() => toggleTranslation(si, sentenceObj.text)}
                title="Show Translation"
                disabled={translationLoading[si]}
              >
                {translationLoading[si] ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : visibleTranslations[si] ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </Button>
            </div>
          </div>

          {visibleTranslations[si] && (
            <div
              className="animate-in fade-in slide-in-from-top-2 mt-2 text-muted-foreground italic text-right rtl"
              style={{ minHeight: "1.5rem" }}
            >
              {fetchedTranslations[si] || ""}
            </div>
          )}
        </div>
      ));
    }

    // Fallback for old stories
    const sentences = story.content.match(/[^.,]+[.,]?/g) || [story.content];

    return sentences.map((sentence: string, si: number) => {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) return null;

      return (
        <div
          key={si}
          className="mb-4 pb-2 border-b border-border/50 transition-colors hover:bg-muted/10 rounded-lg p-2"
        >
          <div className="flex items-start leading-relaxed text-lg">
            <div className="flex-1">
              <ClickableText
                text={trimmedSentence}
                level={story.level}
                domain={story.domain}
                onTranslationAction={(_w, msg, t) => showNotification(msg, t)}
              />
            </div>
            <div className="flex gap-1 shrink-0 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={() => handleSpeak(trimmedSentence)}
                title="Listen"
              >
                <Volume2 size={16} />
              </Button>
              <Button
                variant={visibleTranslations[si] ? "default" : "ghost"}
                size="icon"
                className={`h-8 w-8 ${visibleTranslations[si] ? "neon-glow" : "text-muted-foreground"}`}
                onClick={() => toggleTranslation(si, trimmedSentence)}
                title="Show Translation"
                disabled={translationLoading[si]}
              >
                {translationLoading[si] ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "👁️"
                )}
              </Button>
            </div>
          </div>

          {visibleTranslations[si] && (
            <div
              className="animate-in fade-in slide-in-from-top-2 mt-2 text-muted-foreground italic text-right rtl"
              style={{ minHeight: "1.5rem" }}
            >
              {fetchedTranslations[si] || ""}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => navigate("/stories")}
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{story.title}</h1>
          <div className="flex gap-2 mt-1">
            <Badge variant="default" className="neon-glow">
              {story.level}
            </Badge>
            <Badge
              variant="outline"
              className="border-accent text-accent-foreground"
            >
              {story.domain}
            </Badge>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0 hidden sm:flex"
          onClick={() => handleSpeak(story.content)}
        >
          <Volume2 size={16} className="mr-2" /> Listen All
        </Button>
      </div>

      {/* Phase tabs */}
      <div className="flex gap-2 mb-6 bg-muted/30 p-1 rounded-xl backdrop-blur-sm border border-border/50 max-w-fit shadow-sm">
        <Button
          variant={phase === "reading" ? "default" : "ghost"}
          size="sm"
          className={`transition-all ${phase === "reading" ? "neon-glow" : ""}`}
          onClick={() => setPhase("reading")}
        >
          📖 Reading
        </Button>
        <Button
          variant={phase === "quiz" ? "default" : "ghost"}
          size="sm"
          className={`transition-all ${phase === "quiz" ? "neon-glow" : ""}`}
          onClick={() => (phase !== "quiz" ? handleStartQuiz() : null)}
        >
          📝 Quiz
        </Button>
        <Button
          variant={phase === "chat" ? "default" : "ghost"}
          size="sm"
          className={`transition-all ${phase === "chat" ? "neon-glow" : ""}`}
          onClick={() => setPhase("chat")}
        >
          💬 AI Chat
        </Button>
      </div>

      {/* Reading Phase */}
      {phase === "reading" && (
        <Card className="glass-card relative">
          <CardContent className="pt-6">{renderStoryText()}</CardContent>
        </Card>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-in slide-in-from-bottom-5 z-[100] flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg backdrop-blur-md text-white"
          style={{
            background:
              notification.type === "error"
                ? "rgba(239, 68, 68, 0.9)"
                : notification.type === "info"
                  ? "rgba(15, 82, 186, 0.9)"
                  : "rgba(16, 185, 129, 0.9)",
          }}
        >
          {notification.type === "success" && <CheckCircle size={18} />}
          {notification.message}
        </div>
      )}

      {/* Quiz Phase */}
      {phase === "quiz" && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            {quizQuestions.length === 0 ? (
              <div className="text-center p-12 flex flex-col items-center">
                <Loader2 size={32} className="animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating quiz...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {quizQuestions.map((q, qi) => (
                  <div key={qi}>
                    <p className="font-semibold text-lg mb-4">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="flex flex-col gap-3">
                      {q.options.map((opt: string) => {
                        let btnVariant:
                          | "default"
                          | "outline"
                          | "secondary"
                          | "destructive"
                          | "ghost" = "outline";
                        let additionalClasses =
                          "justify-start h-auto py-3 px-4 text-left transition-all";

                        if (quizSubmitted) {
                          if (opt === q.correctAnswer) {
                            btnVariant = "default"; // Wait, "default" might be blue. We want green.
                            additionalClasses +=
                              " bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                          } else if (quizAnswers[qi] === opt) {
                            additionalClasses +=
                              " bg-destructive/20 border-destructive text-destructive pointer-events-none";
                          } else {
                            additionalClasses +=
                              " opacity-50 pointer-events-none";
                          }
                        } else {
                          if (quizAnswers[qi] === opt) {
                            btnVariant = "default";
                            additionalClasses += " neon-glow";
                          } else {
                            btnVariant = "secondary";
                            additionalClasses +=
                              " hover:bg-muted hover:border-border";
                          }
                        }

                        return (
                          <Button
                            key={opt}
                            variant={btnVariant}
                            className={additionalClasses}
                            onClick={() => {
                              if (!quizSubmitted) {
                                setQuizAnswers((prev) => ({
                                  ...prev,
                                  [qi]: opt,
                                }));
                              }
                            }}
                            disabled={quizSubmitted}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted && (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={
                      Object.keys(quizAnswers).length < quizQuestions.length
                    }
                    className="mt-4 neon-glow"
                    size="lg"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Submit Answers
                  </Button>
                )}

                {quizSubmitted && (
                  <Card className="glass-panel text-center mt-6 border-primary/20 bg-primary/5">
                    <CardContent className="pt-6 flex flex-col items-center">
                      <h3 className="text-2xl font-bold mb-6">
                        Score:{" "}
                        <span className="text-primary mx-2 underline decoration-accent decoration-4 underline-offset-4">
                          {
                            quizQuestions.filter(
                              (q, i) => quizAnswers[i] === q.correctAnswer,
                            ).length
                          }
                        </span>{" "}
                        / {quizQuestions.length}
                      </h3>
                      <Button
                        onClick={() => setPhase("chat")}
                        className="neon-glow"
                      >
                        <MessageSquare size={18} className="mr-2" /> Continue to
                        AI Chat
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chat Phase */}
      {phase === "chat" && (
        <Card className="glass-card flex flex-col h-[600px] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {chatMessages.length === 0 && !chatLoading && (
              <div className="text-center p-8 text-muted-foreground m-auto max-w-md">
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6 neon-glow">
                  <MessageSquare size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Start the conversation!
                </h3>
                <p>
                  Ask questions about the story, request clarifications, or
                  practice using the new vocabulary.
                </p>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-5 py-4 rounded-2xl leading-relaxed shadow-sm ${msg.sender === "user" ? "self-end bg-primary text-primary-foreground rounded-br-sm text-base" : "self-start bg-secondary/30 backdrop-blur-md rounded-bl-sm border border-border/50 text-[15px]"}`}
              >
                {msg.sender === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                ) : (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none 
                    [&>p]:mb-3 last:[&>p]:mb-0 
                    [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h1]:text-foreground [&>h1]:mt-4 first:[&>h1]:mt-0
                    [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:text-foreground [&>h2]:mt-4 first:[&>h2]:mt-0
                    [&>h3]:text-base [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-foreground [&>h3]:mt-3 first:[&>h3]:mt-0
                    [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ul>li]:mb-1 [&>ul>li]:marker:text-primary
                    [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>ol>li]:mb-1 [&>ol>li]:marker:text-primary
                    [&_strong]:text-foreground [&_strong]:font-bold
                    [&_code]:bg-background/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-primary [&_code]:font-mono [&_code]:text-xs shadow-sm
                    [&_pre]:bg-background/90 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-3 border border-border/50 [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:text-foreground [&_pre>code]:shadow-none
                    [&_a]:text-primary [&_a]:underline hover:[&_a]:text-primary/80 transition-colors
                    [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:py-1 [&>blockquote]:bg-primary/5 [&>blockquote]:rounded-r-lg [&>blockquote]:italic [&>blockquote]:text-muted-foreground [&>blockquote]:mb-3"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.message}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="self-start px-5 py-3 rounded-2xl bg-secondary/30 backdrop-blur-md rounded-bl-sm border border-border/50 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  Thinking...
                </span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border/50 bg-background/30 backdrop-blur-md">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !chatLoading && handleSendChat()
                }
                disabled={chatLoading}
                className="flex-1 bg-background/50 border-border/50 focus-visible:ring-primary h-12"
              />
              <Button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="h-12 w-12 shrink-0 p-0 neon-glow"
              >
                <Send size={20} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

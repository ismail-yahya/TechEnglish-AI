import React, { useState, useEffect } from "react";
import { storiesAPI, vocabularyAPI } from "../lib/api";
import { Plus, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClickableTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  level?: string;
  domain?: string;
  onTranslationAction?: (
    word: string,
    message: string,
    type: "success" | "error" | "info",
  ) => void;
}

export function ClickableText({
  text,
  className = "",
  style,
  level = "A1",
  domain = "General",
  onTranslationAction,
}: ClickableTextProps) {
  const [tooltip, setTooltip] = useState<{
    index: number;
    word: string;
    translation: string;
    style: React.CSSProperties;
  } | null>(null);
  const [translatingWord, setTranslatingWord] = useState(false);

  useEffect(() => {
    const handleCloseTooltip = () => {
      setTooltip(null);
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".tooltip-container")) {
        return;
      }
      setTooltip(null);
    };

    // Listen for custom event to close other tooltips
    window.addEventListener("close-tooltips", handleCloseTooltip);
    document.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("close-tooltips", handleCloseTooltip);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const handleWordClick = async (
    word: string,
    index: number,
    e: React.MouseEvent<HTMLSpanElement>,
  ) => {
    e.stopPropagation();

    // Emit event to close all other open tooltips
    window.dispatchEvent(new Event("close-tooltips"));

    const cleanWord = word.replace(/[^a-zA-Z'-]/g, "");
    if (!cleanWord || cleanWord.length < 2) return;

    const spanElement = e.currentTarget;

    // Use a tiny timeout so the close event runs first across all components
    setTimeout(async () => {
      setTranslatingWord(true);

      const rect = spanElement.getBoundingClientRect();
      const tooltipWidth = 240; // Approx max-width
      const tooltipHeight = 140; // Approx height

      const style: React.CSSProperties = { zIndex: 9999, minWidth: "200px" };

      // Vertical
      if (
        rect.bottom + tooltipHeight > window.innerHeight &&
        rect.top - tooltipHeight - 8 > 0
      ) {
        style.bottom = "100%";
        style.marginBottom = "8px";
      } else {
        style.top = "100%";
        style.marginTop = "8px";
      }

      // Horizontal
      const screenCenterX = rect.left + rect.width / 2;
      if (screenCenterX - tooltipWidth / 2 < 10) {
        style.left = "0";
      } else if (screenCenterX + tooltipWidth / 2 > window.innerWidth - 10) {
        style.right = "0";
      } else {
        style.left = "50%";
        style.transform = "translateX(-50%)";
      }

      setTooltip({
        index,
        word: cleanWord,
        translation: "Translating...",
        style,
      });

      try {
        const res = await storiesAPI.translate(cleanWord);
        setTooltip((prev) =>
          prev?.index === index
            ? {
                ...prev,
                translation: res.data.translation,
              }
            : prev,
        );
      } catch {
        setTooltip((prev) =>
          prev?.index === index
            ? {
                ...prev,
                translation: "Translation failed",
              }
            : prev,
        );
      } finally {
        setTranslatingWord(false);
      }
    }, 10);
  };

  const notify = (msg: string, type: "success" | "error" | "info") => {
    if (onTranslationAction)
      onTranslationAction(tooltip?.word || "", msg, type);
  };

  const handleSaveWord = async (
    status: "learning" | "known",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (
      !tooltip ||
      tooltip.translation === "Loading..." ||
      tooltip.translation === "Translating..." ||
      tooltip.translation === "Error" ||
      tooltip.translation === "Translation failed"
    )
      return;

    setTranslatingWord(true);
    try {
      await vocabularyAPI.addWord({
        word: tooltip.word,
        translation: tooltip.translation,
        level,
        domain,
        masteryStatus: status,
      });
      notify(
        `Added "${tooltip.word}" to ${status === "learning" ? "Learning" : "Known"}!`,
        "success",
      );
      setTooltip(null);
    } catch (err: unknown) {
      console.error("Failed to add word", err);
      const apiError = err as { response?: { data?: { error?: string } } };
      if (
        apiError.response?.data?.error === "Word already in your vocabulary"
      ) {
        notify(`"${tooltip.word}" is already in your list.`, "info");
      } else {
        notify("Failed to add word", "error");
      }
    } finally {
      setTranslatingWord(false);
    }
  };

  // Split text by whitespace, preserving punctuation attached to words for display
  const words = text.split(/\s+/);

  return (
    <>
      <div
        className={className}
        style={{ ...style, lineHeight: 1.8, position: "relative" }}
        onClick={() => !translatingWord && setTooltip(null)}
      >
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span
              className="clickable-word hover:bg-primary/20 hover:text-primary dark:hover:text-primary-foreground cursor-pointer transition-colors rounded px-1"
              style={{ position: "relative" }}
              onClick={(e) => handleWordClick(word, i, e)}
            >
              {word}
              {tooltip?.index === i && (
                <div
                  className="tooltip tooltip-container animate-in fade-in zoom-in duration-200 glass-panel"
                  style={{
                    position: "absolute",
                    ...tooltip.style,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      textAlign: "center",
                    }}
                  >
                    {tooltip.word}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    {tooltip.translation}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => handleSaveWord("learning", e)}
                      disabled={
                        translatingWord || tooltip.translation.includes("...")
                      }
                    >
                      {translatingWord ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}{" "}
                      Learning
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSaveWord("known", e)}
                      disabled={
                        translatingWord || tooltip.translation.includes("...")
                      }
                    >
                      <CheckCircle size={14} /> Known
                    </Button>
                  </div>
                </div>
              )}
            </span>{" "}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}

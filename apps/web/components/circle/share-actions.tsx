"use client";

import { Twitter, Copy, Check } from "lucide-react";
import { IconButton } from "@repo/ui/icon-button";
import { useState, useCallback } from "react";

interface ShareActionsProps {
  score: number | null;
}

export function ShareActions({ score }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I got ${score ?? 0}% precision in Stroke! Can you beat me? ⭕️\n\nTry it here: ${typeof window !== "undefined" ? window.location.href : ""}`;

  const handleTwitterShare = useCallback(() => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [shareText]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, [shareText]);

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground mb-2">Share your score via</p>
      <div className="flex items-center gap-4">
        <IconButton
          icon={Twitter}
          variant="text"
          onClick={handleTwitterShare}
          title="Share on Twitter"
        />
        <IconButton
          icon={copied ? Check : Copy}
          variant="text"
          onClick={handleCopyLink}
          title="Copy to clipboard"
        />
      </div>
    </div>
  );
}

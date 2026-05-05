"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { MessageRole } from "@/types/chat-simulation.md.ts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  role: MessageRole;
  content: string | React.ReactNode;
  isNew?: boolean;
}

export function ChatBubble({ role, content, isNew = true }: ChatBubbleProps) {
  const isAi = role === "ai";

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "flex w-full gap-3 mb-4",
        isAi ? "flex-row" : "flex-row-reverse"
      )}
    >
      <Avatar className="w-8 h-8 border border-outline-variant/20 shadow-sm shrink-0">
        <AvatarFallback className={cn(
          "text-on-surface-variant",
          isAi ? "bg-secondary-fixed/20" : "bg-primary-fixed/20"
        )}>
          {isAi ? <Bot size={16} /> : <User size={16} />}
        </AvatarFallback>
      </Avatar>


      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-md border",
          isAi
            ? "bg-surface-container-high/60 border-outline-variant/30 text-on-surface rounded-tl-none"
            : "bg-secondary-fixed/20 border-secondary-fixed/30 text-on-surface rounded-tr-none"
        )}
      >
        {typeof content === "string" ? (
          <p>{content}</p>
        ) : (
          content
        )}
      </div>
    </motion.div>
  );
}

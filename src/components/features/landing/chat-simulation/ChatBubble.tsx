"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";
import { MessageRole } from "@/types/chat-simulation.md";

interface ChatBubbleProps {
  role: MessageRole;
  content: string | React.ReactNode;
  time?: string;
  isNew?: boolean;
}

export function ChatBubble({ role, content, time, isNew = true }: ChatBubbleProps) {
  const isOutgoing = role === "user";

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-2",
        isOutgoing ? "justify-end pl-10" : "justify-start pr-10",
      )}
    >
      <div
        className={cn(
          "relative max-w-[85%] rounded-[7.5px] px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]",
          isOutgoing
            ? "bg-[#d9fdd3] rounded-tr-none"
            : "bg-white rounded-tl-none",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0 block",
            isOutgoing ? "-right-2" : "-left-2",
          )}
        >
          <svg viewBox="0 0 8 13" width="8" height="13" className="block">
            <path
              fill={isOutgoing ? "#d9fdd3" : "#ffffff"}
              d={
                isOutgoing
                  ? "M5.188,1H0v11.193l6.467-8.625C7.526,2.156,6.958,1,5.188,1z"
                  : "M2.812,1H8v11.193L1.533,3.568C0.474,2.156,1.042,1,2.812,1z"
              }
            />
          </svg>
        </span>

        <div className="text-[14.2px] leading-[19px] text-[#111b21] [&_a]:text-[#027eb5] [&_a]:underline">

          {typeof content === "string" ? <p>{content}</p> : content}
        </div>

        <div className="mt-0.5 flex items-center justify-end gap-1">
          <span className="text-[11px] leading-none text-[#667781]">{time}</span>
          {isOutgoing ? (
            <CheckCheck className="size-4 text-[#53bdeb]" strokeWidth={2.25} />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

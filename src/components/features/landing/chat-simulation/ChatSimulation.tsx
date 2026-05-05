"use client";

import { useChatSimulation } from "@/hooks/use-chat-simulation";
import { ChatBubble } from "./ChatBubble";
import { SimulationStep } from "@/types/chat-simulation.md.ts";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";

const STEPS: SimulationStep[] = [
  {
    role: "user",
    content: "Halo, saya mau tanya tentang fitur Chatly.",
    delay: 800,
  },
  {
    role: "ai",
    content: "Halo! Saya agen AI Chatly. Ada yang bisa saya bantu terkait produk kami?",
    delay: 1200,
  },
  {
    role: "user",
    content: "Apakah AI ini bisa menangani komplain pelanggan otomatis?",
    delay: 1000,
  },
  {
    role: "ai",
    content: "Tentu! Saya bisa menangani pertanyaan umum, keluhan, hingga membantu proses checkout secara mandiri.",
    delay: 1500,
  },
  {
    role: "user",
    content: "Menarik. Saya mau coba paket Pro-nya.",
    delay: 1000,
  },
  {
    role: "ai",
    content: (
      <div className="flex flex-col gap-2">
        <p>Pilihan cerdas! Anda bisa melakukan pembayaran melalui Xendit di tautan berikut:</p>
        <div className="mt-2 p-3 bg-on-surface/5 rounded-lg border border-outline-variant/20 flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-secondary-fixed truncate">https://checkout.xendit.co/v2/chatly-pro-plan</span>
          <div className="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold rounded-full uppercase tracking-tighter">
            Pay Now
          </div>
        </div>
      </div>
    ),
    delay: 2000,
  },
  {
    role: "ai",
    content: "Pembayaran terverifikasi! 🎉 Akun Anda telah ditingkatkan ke paket Pro. Selamat menggunakan Chatly!",
    delay: 2500,
  },
  {
    role: "user",
    content: "Terima kasih banyak! Sangat cepat.",
    delay: 1000,
  },
  {
    role: "ai",
    content: "Sama-sama! Senang bisa membantu. Have a great day!",
    delay: 1200,
  },
];

export function ChatSimulation() {
  const { messages, isTyping } = useChatSimulation(STEPS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-surface-container-low/20 backdrop-blur-2xl rounded-[2rem] border border-outline-variant/15 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-secondary-fixed/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary-fixed/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(164,215,48,0.6)]" />
          <span className="text-[11px] font-mono text-outline uppercase tracking-[0.2em] font-bold">Live Interaction</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
          <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
          <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-2 scrollbar-hide flex flex-col gap-1"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 bg-surface-container-high/40 backdrop-blur-md border border-outline-variant/20 px-4 py-3 rounded-2xl rounded-tl-none w-fit mb-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.8, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-1.5 bg-secondary-fixed rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 pt-5 border-t border-outline-variant/10">
        <div className="relative group/input">
          <div className="absolute inset-0 bg-secondary-fixed/5 rounded-full blur-md opacity-0 group-hover/input:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-12 rounded-full bg-surface-container-high/30 border border-outline-variant/20 px-5 flex items-center transition-all group-hover/input:border-outline-variant/40 group-hover/input:bg-surface-container-high/50">
              <span className="text-outline/50 text-[13px] font-medium tracking-tight">Mengetik pesan...</span>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-[#bff44c] shadow-[0_4px_12px_rgba(191,244,76,0.3)] flex items-center justify-center text-[#141f00] cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}


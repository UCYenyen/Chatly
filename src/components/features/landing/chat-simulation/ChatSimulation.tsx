"use client";

import { useChatSimulation } from "@/hooks/use-chat-simulation";
import { ChatBubble } from "./ChatBubble";
import { SimulationStep } from "@/types/chat-simulation.md";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import {
  ArrowLeft,
  Bot,
  Camera,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Smile,
  Video,
} from "lucide-react";

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
        <span className="truncate font-mono text-[#027eb5]">https://checkout.xendit.co/v2/chatly-pro-plan</span>
      </div>
    ),
    delay: 2000,
  },
  {
    role: "ai",
    content: "Pembayaran Berhasil \n\n Terima kasih, pembayaran sebesar Rp.749.000 untuk Paket Chatly PRO telah kami terima.!",
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

const CHAT_DOODLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='0.035' stroke-width='1.5'%3E%3Ccircle cx='18' cy='20' r='6'/%3E%3Cpath d='M54 12c5 4 5 10 0 14'/%3E%3Crect x='60' y='54' width='11' height='11' rx='2.5'/%3E%3Cpath d='M12 64h13'/%3E%3Cpath d='M40 46l5 5 5-5'/%3E%3C/g%3E%3C/svg%3E\")";

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatSimulation() {
  const { messages, isTyping } = useChatSimulation(STEPS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden border rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-3 bg-[#075e54] px-3 py-2.5 text-white">
        <ArrowLeft className="size-5 shrink-0 opacity-90" strokeWidth={2.25} />
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#128c7e]">
          <Bot className="size-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold leading-tight">Chatly AI</span>
          <span className="truncate text-[12px] leading-tight text-white/80">online</span>
        </div>
        <Video className="size-5 shrink-0 opacity-90" strokeWidth={2} />
        <Phone className="size-4.5 shrink-0 opacity-90" strokeWidth={2} />
        <MoreVertical className="size-5 shrink-0 opacity-90" strokeWidth={2} />
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex flex-1 flex-col overflow-y-auto px-3 py-3"
        style={{ backgroundColor: "#efeae2", backgroundImage: CHAT_DOODLE }}
      >
        <div className="mx-auto mb-3 rounded-md bg-[#ffffff]/90 px-3 py-1 text-center text-[12px] text-[#54656f] shadow-sm">
          Hari ini
        </div>

        <div className="mx-auto mb-3 flex items-center gap-1.5 rounded-md bg-[#fcf4cb] px-3 py-1.5 text-center text-[12px] text-[#54656f] shadow-sm">
          <span>🔒</span>
          <span>Pesan dilindungi enkripsi end-to-end.</span>
        </div>

        <AnimatePresence mode="popLayout" initial={false}>
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              time={"3.00"}
            />
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative mb-2 flex w-fit items-center gap-1 rounded-[7.5px] rounded-tl-none bg-white px-3 py-2.5 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
            >
              <span aria-hidden className="absolute -left-2 top-0 block">
                <svg viewBox="0 0 8 13" width="8" height="13" className="block">
                  <path
                    fill="#ffffff"
                    d="M2.812,1H8v11.193L1.533,3.568C0.474,2.156,1.042,1,2.812,1z"
                  />
                </svg>
              </span>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                  className="size-2 rounded-full bg-[#9aa0a6]"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-end gap-2 bg-[#f0f2f5] px-2.5 py-2">
        <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
          <Smile className="size-5 shrink-0 text-[#54656f]" strokeWidth={2} />
          <span className="flex-1 truncate text-[15px] text-[#8696a0]">Ketik pesan</span>
          <Paperclip className="size-5 shrink-0 -rotate-45 text-[#54656f]" strokeWidth={2} />
          <Camera className="size-5 shrink-0 text-[#54656f]" strokeWidth={2} />
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-sm"
        >
          <Mic className="size-5" strokeWidth={2} />
        </motion.div>
      </div>
    </div>
  );
}

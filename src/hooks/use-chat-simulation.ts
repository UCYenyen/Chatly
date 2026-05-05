import { useState, useEffect, useCallback } from "react";
import { ChatMessage, SimulationStep } from "@/types/chat-simulation.md";

export function useChatSimulation(steps: SimulationStep[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const reset = useCallback(() => {
    setMessages([]);
    setCurrentStepIndex(0);
    setIsTyping(false);
  }, []);

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      const restartTimeout = setTimeout(() => {
        reset();
      }, 5000);
      return () => clearTimeout(restartTimeout);
    }

    const step = steps[currentStepIndex];
    
    const typingTimeout = setTimeout(() => {
      setIsTyping(true);
      
      const messageTimeout = setTimeout(() => {
        const newMessage: ChatMessage = {
          id: Math.random().toString(36).substring(7),
          role: step.role,
          content: step.content,
          timestamp: new Date(),
          status: "sent",
        };
        
        setMessages((prev) => [...prev, newMessage]);
        setIsTyping(false);
        setCurrentStepIndex((prev) => prev + 1);
      }, step.delay);

      return () => clearTimeout(messageTimeout);
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, [currentStepIndex, steps, reset]);

  return { messages, isTyping, reset };
}

"use client";

import { ChatRequestOptions } from "ai";
import { SendHorizonal } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useProModal } from "@/hooks/use-pro-modal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface ChatFormProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
  isLoading: boolean;
}

const MESSAGE_XP_COST = 2;
const POLLING_INTERVAL = 5000; // Poll every 5 seconds

export const ChatForm = ({
  input,
  handleInputChange,
  onSubmit,
  isLoading,
}: ChatFormProps) => {
  const proModal = useProModal();
  const { toast } = useToast();
  const [userXP, setUserXP] = useState<number | null>(null);

  const fetchUserXP = async () => {
    try {
      const response = await fetch("/api/user-progress");
      const data = await response.json();
      setUserXP(data.availableTokens);
    } catch (error) {
      console.error("Error fetching user XP:", error);
    }
  };

  useEffect(() => {
    fetchUserXP(); // Initial fetch
    const interval = setInterval(fetchUserXP, POLLING_INTERVAL);
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleSubmitWithXPCheck = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userXP || userXP < MESSAGE_XP_COST) {
      toast({
        description: `Insufficient XP. Need ${MESSAGE_XP_COST} XP to send a message.`,
        variant: "destructive",
      });
      proModal.onOpen();
      return;
    }

    await onSubmit(e);
    // Immediate fetch after message sent
    fetchUserXP();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (!userXP || userXP < MESSAGE_XP_COST) {
      e.preventDefault();
      proModal.onOpen();
    }
  };

  return (
    <form onSubmit={handleSubmitWithXPCheck} className="border-t border-primary/10 py-4 flex items-center gap-x-2">
      <Input
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
        placeholder={!userXP || userXP < MESSAGE_XP_COST ? "Need 2 XP to send a message" : "Type a message"}
        className="rounded-lg bg-primary/10"
      />
      <Button 
        type="button"
        disabled={isLoading}
        variant={!userXP || userXP < MESSAGE_XP_COST ? "premium" : "ghost"}
        onClick={handleButtonClick}
      >
        <SendHorizonal className="w-6 h-6" />
      </Button>
    </form>
  );
};
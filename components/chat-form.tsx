"use client";

import { ChatRequestOptions } from "ai";
import { SendHorizonal } from "lucide-react";
import { ChangeEvent, FormEvent } from "react";
import { useChatLimit } from "@/store/use-chat-limit";
import { useProModal } from "@/hooks/use-pro-modal";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatFormProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>, chatRequestOptions?: ChatRequestOptions | undefined) => void;
  isLoading: boolean;
}

export const ChatForm = ({
  input,
  handleInputChange,
  onSubmit,
  isLoading,
}: ChatFormProps) => {
  const { remaining } = useChatLimit();
  const proModal = useProModal();
  
  const isLimitReached = remaining === 0;

  const handleSubmitWithLimit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLimitReached) {
      proModal.onOpen();
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmitWithLimit} className="border-t border-primary/10 py-4 flex items-center gap-x-2">
      <Input
        disabled={isLoading || isLimitReached}
        value={input}
        onChange={handleInputChange}
        placeholder={isLimitReached ? "Message limit reached - Upgrade to continue" : "Type a message"}
        className="rounded-lg bg-primary/10"
      />
      <Button 
        type="button"
        disabled={isLoading || (!input.trim() && !isLimitReached)} 
        variant={isLimitReached ? "premium" : "ghost"}
        onClick={(e) => {
          e.preventDefault();
          if (isLimitReached) {
            proModal.onOpen();
          } else if (input.trim()) {
            handleSubmitWithLimit(e as any);
          }
        }}
      >
        <SendHorizonal className="w-6 h-6" />
      </Button>
    </form>
  );
}
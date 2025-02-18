"use client";

import { useEffect, useState } from "react";
import * as Progress from '@radix-ui/react-progress';
import { Infinity, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatLimit } from "@/store/use-chat-limit";

interface ChatLimitProps {
  userId: string;
  isPro?: boolean;
}

export const ChatLimit = ({ userId, isPro }: ChatLimitProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { remaining, limit, used, reset, setLimitData } = useChatLimit();

  const fetchLimitData = async () => {
    try {
      const response = await fetch("/api/limit");
      const data = await response.json();
      setLimitData({
        ...data,
        reset: data.reset ? new Date(data.reset) : null
      });
    } catch (error) {
      console.error("Error fetching limit:", error);
    }
  };

  useEffect(() => {
    fetchLimitData();
    const interval = setInterval(fetchLimitData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (remaining === null || limit === null) {
    return null;
  }

  // For unlimited tier
  if (limit === null) {
    return (
      <div className="flex items-center gap-x-2 text-emerald-500">
        <Infinity className="h-5 w-5" />
        <span className="text-sm font-medium">∞</span>
      </div>
    );
  }

  const percentage = (used! / limit) * 100;
  const isZero = remaining === 0;
  const resetTime = reset instanceof Date 
    ? reset.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : null;

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-x-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <MessageCircle className={cn(
          "h-5 w-5",
          isZero ? "text-destructive" : "text-emerald-500",
          isZero && "animate-pulse"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isZero ? "text-destructive" : "text-emerald-500"
        )}>
          {remaining}
        </span>
      </div>

      {isExpanded && (
        <div 
          className="absolute md:right-0 right-auto -left-24 top-12 w-72 p-4 rounded-md shadow-lg bg-secondary border z-50"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Daily Limit</span>
              <span>{used} / {limit}</span>
            </div>
            
            <Progress.Root 
              className="relative overflow-hidden bg-secondary/30 h-2 w-full rounded-full"
            >
              <Progress.Indicator
                className={cn(
                  "h-full transition-all duration-500 ease-in-out",
                  isZero ? "bg-destructive" : "bg-emerald-500",
                )}
                style={{ width: `${percentage}%` }}
              />
            </Progress.Root>
            
            {resetTime && (
              <p className="text-xs text-muted-foreground text-right">
                Resets at {resetTime}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 
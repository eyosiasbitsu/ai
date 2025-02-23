"use client";

import { useEffect, useState } from "react";
import * as Progress from '@radix-ui/react-progress';
import { Trophy, Zap, ChevronRight, Star } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import React from "react";

interface ChatLimitProps {
  userId: string;
  onXpChange?: (newXp: number) => void;
}

interface UserProgress {
  totalSpent: number;
  availableTokens: number;
}

const XP_PER_LEVEL = 160; // Fixed XP difference between levels

// Calculate level based on total XP spent
const calculateLevel = (totalSpent: number): number => {
  return Math.floor(totalSpent / XP_PER_LEVEL);
};

// Calculate XP needed for next level
const getThresholdForLevel = (level: number): number => {
  return level * XP_PER_LEVEL;
};

export const ChatLimit = ({ userId, onXpChange }: ChatLimitProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const { user } = useUser();

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/user-progress");
      const data = await response.json();
      setProgress({
        totalSpent: data.totalSpent || 0,
        availableTokens: data.availableTokens || 0
      });
      onXpChange?.(data.availableTokens);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  if (!progress) return null;

  const totalXP = progress.totalSpent;
  const currentLevel = calculateLevel(totalXP);
  const nextLevel = currentLevel + 1;
  
  const currentLevelThreshold = getThresholdForLevel(currentLevel);
  const nextLevelThreshold = getThresholdForLevel(nextLevel);
  const xpNeededForNextLevel = nextLevelThreshold - totalXP;
  
  // Calculate percentage within current level
  const percentage = Math.min(
    ((totalXP - currentLevelThreshold) / XP_PER_LEVEL) * 100,
    100
  );

  const levelInfoText = `Need ${xpNeededForNextLevel} more XP to reach Level ${nextLevel}`;

  const LevelDisplay = ({ showNextLevel = false }) => (
    <div className="flex items-center gap-x-3">
      <div className="flex items-center gap-x-2">
        <Trophy className="h-5 w-5 text-emerald-500" />
        <span className="text-base font-medium text-emerald-500">
          Level {currentLevel}
        </span>
      </div>

      <div className="text-base text-muted-foreground font-medium">
        {progress.totalSpent} XP
      </div>

      {showNextLevel && (
        <div className="flex items-center gap-x-2">
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
          <Trophy className="h-5 w-5 text-emerald-500" />
          <span className="text-base text-muted-foreground">Level {nextLevel}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Desktop view */}
      <div 
        className="hidden md:flex items-center cursor-pointer px-2"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <LevelDisplay showNextLevel={true} />
      </div>

      {/* Mobile view */}
      <div 
        className="md:hidden flex items-center gap-x-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Trophy className="h-5 w-5 text-emerald-500" />
        <span className="text-base font-medium text-emerald-500">Level {currentLevel}</span>
      </div>

      {isExpanded && (
        <div 
          className="absolute md:right-0 right-auto -left-24 top-12 w-80 p-5 rounded-xl shadow-lg bg-secondary/95 border backdrop-blur-sm z-50"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="space-y-5">
            {/* Level Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Progress to Level {nextLevel}</span>
                <span className="text-emerald-500 font-semibold">{progress.totalSpent} / {nextLevelThreshold} XP</span>
              </div>
              
              {/* Progress Bar */}
              <div className="relative w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {/* XP Needed */}
              <p className="text-xs text-muted-foreground">
                {xpNeededForNextLevel > 0 
                  ? `${xpNeededForNextLevel} XP needed for next level`
                  : "Ready to level up!"
                }
              </p>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-secondary/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-x-2">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Available XP</span>
                </div>
                <p className="text-sm font-semibold">{progress.availableTokens}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-x-2">
                  <Star className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">Current Level</span>
                </div>
                <p className="text-sm font-semibold">Level {currentLevel}</p>
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-3 text-sm text-muted-foreground border-t pt-3">
              <p className="font-semibold text-primary">How it works:</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Use your available XP for AI features
                </li>
                <li className="flex items-center gap-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Each message/action costs XP
                </li>
                <li className="flex items-center gap-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Buy more XP to spend and level up faster
                </li>
              </ul>
              <p className="text-xs font-medium text-emerald-500 pt-2">
                {levelInfoText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Create a context to share XP updates across components
export const XpContext = React.createContext<{
  updateXp: (spent: number) => void;
}>({
  updateXp: () => {},
});

// Usage in chat component:
export const useChatXp = () => {
  const context = React.useContext(XpContext);
  return context.updateXp;
}; 
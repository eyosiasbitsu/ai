"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Rocket,
  Star,
  Trophy,
  Bot,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface SubscribeClientProps {
  userId: string;
}

const AI_PERSONA_COST = 100;
const VOTE_COST = 25;
const XP_PER_LEVEL = 160;
const XP_Submit_Features = 50;

const calculateLevel = (totalSpent: number): number => {
  return Math.floor(totalSpent / XP_PER_LEVEL);
};

const options = {
  xp100: {
    name: "Starter Pack",
    xp: 100,
    price: 5,
    features: [
      "+100 XP (≈ 50 messages)",
      `Increase ${Math.floor(100 / XP_PER_LEVEL)} Level`,
      `Create ${Math.floor(
        100 / AI_PERSONA_COST
      )} AI Persona (${AI_PERSONA_COST} XP)`,
      `Send ${Math.floor(100 / VOTE_COST)} Votes (${VOTE_COST} XP)`,
      `Submit ${Math.floor(
        100 / XP_Submit_Features
      )} Features (${XP_Submit_Features} XP)`,
    ],
    icon: Zap,
    color: "blue",
    levelUp: Math.floor(100 / XP_PER_LEVEL),
    botLimit: Math.floor(100 / AI_PERSONA_COST),
    votesLimit: Math.floor(100 / VOTE_COST),
    submitLimit: Math.floor(100 / XP_Submit_Features),
  },
  xp500: {
    name: "Power Pack",
    xp: 500,
    price: 20,
    features: [
      "+500 XP (≈ 250 messages)",
      `Increase ${Math.floor(500 / XP_PER_LEVEL)} Levels`,
      `Create ${Math.floor(
        500 / AI_PERSONA_COST
      )} AI Personas (${AI_PERSONA_COST} XP)`,
      `Send ${Math.floor(500 / VOTE_COST)} Votes (${VOTE_COST} XP)`,
      `Submit ${Math.floor(
        500 / XP_Submit_Features
      )} Features (${XP_Submit_Features} XP)`,
    ],
    icon: Rocket,
    color: "purple",
    levelUp: Math.floor(500 / XP_PER_LEVEL),
    botLimit: Math.floor(500 / AI_PERSONA_COST),
    votesLimit: Math.floor(500 / VOTE_COST),
    submitLimit: Math.floor(500 / XP_Submit_Features),
  },
  xp2000: {
    name: "Ultimate Pack",
    xp: 2000,
    price: 60,
    features: [
      "+2000 XP (≈ 1000 messages)",
      `Increase ${Math.floor(2000 / XP_PER_LEVEL)} Levels`,
      `Create ${Math.floor(
        2000 / AI_PERSONA_COST
      )} AI Personas (${AI_PERSONA_COST} XP)`,
      `Send ${Math.floor(2000 / VOTE_COST)} Votes (${VOTE_COST} XP)`,
      `Submit ${Math.floor(
        2000 / XP_Submit_Features
      )} Features (${XP_Submit_Features} XP)`,
    ],
    icon: Star,
    color: "amber",
    levelUp: Math.floor(2000 / XP_PER_LEVEL),
    botLimit: Math.floor(2000 / AI_PERSONA_COST),
    votesLimit: Math.floor(2000 / VOTE_COST),
    submitLimit: Math.floor(2000 / XP_Submit_Features),
  },
};

export default function SubscribeClient({
  userId,
}: SubscribeClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<
    "xp100" | "xp500" | "xp2000"
  >("xp100");
  const { toast } = useToast();

  const onSubscribe = async () => {
    try {
      if (!userId || userId === "") {
      return  router.push("/sign-in")
      
      }
      setLoading(true);

      const response = await axios.post("/api/stripe", {
        option: selectedOption,
        xpAmount: options[selectedOption].xp,
        priceAmount: options[selectedOption].price * 100,
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.log(error)
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <style jsx>{`
        :root {
          --border-color: #e2e8f0;
          --bg-color: #ffffff;
          --text-color: #1a202c;
          --highlight-color: #3182ce;
        }

        [data-theme="dark"] {
          --border-color: #4a5568;
          --bg-color: #2d3748;
          --text-color: #e2e8f0;
          --highlight-color: #63b3ed;
        }

        .theme-container {
          background-color: var(--bg-color);
          color: var(--text-color);
        }

        .theme-border {
          border-color: var(--border-color);
        }

        .theme-highlight {
          color: var(--highlight-color);
        }
      `}</style>

      <div className="theme-container text-center mb-12">
        <div className="flex justify-center items-center flex-col gap-y-4 pb-2">
          <div className="flex items-center gap-x-2 font-bold text-2xl">
            Level Up Your AI Experience
            <Trophy className="h-8 w-8 theme-highlight animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {Object.entries(options).map(([key, option]) => {
          const Icon = option.icon;
          const isSelected = selectedOption === key;
          return (
            <div
              key={key}
              onClick={() => setSelectedOption(key as keyof typeof options)}
              className={`
                relative overflow-hidden group
                p-6 rounded-xl cursor-pointer transition-all
                border-2 theme-border hover:shadow-xl
                ${
                  isSelected
                    ? `bg-${option.color}-500/10 dark:bg-${option.color}-500/20 ring-2 ring-${option.color}-500 ring-offset-2`
                    : "hover:border-zinc-300 dark:hover:border-zinc-700"
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <Check className={`h-6 w-6 theme-highlight`} />
                </div>
              )}

              {/* Sparkle effects */}
              <div className="absolute -top-10 -right-10 h-20 w-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-xl transform group-hover:scale-150 transition-transform" />

              <div className="relative">
                {/* Header */}
                <div className="flex flex-col items-center mb-4">
                  <div
                    className={`p-3 rounded-full bg-${
                      option.color
                    }-500/20 mb-3 ${isSelected ? "animate-bounce" : ""}`}
                  >
                    <Icon className={`h-8 w-8 theme-highlight`} />
                  </div>
                  <h3 className="text-xl font-bold">{option.name}</h3>
                  <div className="flex items-baseline gap-x-2 mt-2">
                    <span className="text-3xl font-bold">${option.price}</span>
                    <span className="text-zinc-500">one-time</span>
                  </div>
                </div>

                {/* Benefits Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-x-2">
                    <Zap className={`h-4 w-4 theme-highlight`} />
                    <span className="text-base font-semibold">
                      {option.xp} XP
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <Trophy className={`h-4 w-4 theme-highlight`} />
                    <span className="text-sm">
                      Increase {option.levelUp}{" "}
                      {option.levelUp === 1 ? "Level" : "Levels"}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <Bot className={`h-4 w-4 theme-highlight`} />
                    <span className="text-sm">
                      Create {option.botLimit} AI Personas
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({AI_PERSONA_COST} XP)
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <ThumbsUp className={`h-4 w-4 theme-highlight`} />
                    <span className="text-sm">
                      Send {option.votesLimit} Votes
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({VOTE_COST} XP)
                    </span>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <Sparkles className={`h-4 w-4 theme-highlight`} />
                    <span className="text-sm">
                      Submit {option.submitLimit} Features
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({XP_Submit_Features} XP)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 text-center">
        <Button
          onClick={onSubscribe}
          disabled={loading}
          size="lg"
          variant="premium"
          className="w-full md:w-auto md:min-w-[200px]"
        >
          Purchase {options[selectedOption].name}
        </Button>
      </div>
    </div>
  );
}

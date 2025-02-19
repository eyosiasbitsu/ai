"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProModal } from "@/hooks/use-pro-modal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'starter'|'pro'|'ultimate'>('starter');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const prices = {
    starter: 999,
    pro: 2999,
    ultimate: 4999
  };

  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/stripe", {
        unitAmount: prices[selectedPlan]
      });

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">
            Choose Your Plan
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock the full potential of AI Companions
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Starter Plan */}
          <div 
            onClick={() => setSelectedPlan('starter')}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md 
              ${selectedPlan === 'starter' 
                ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/20' 
                : 'border-gray-200 dark:border-gray-800 hover:border-sky-500/50 dark:hover:border-sky-500/50'
              }`}
          >
            <div className="flex flex-col items-center mb-4">
              <h3 className="font-semibold text-lg text-foreground">Starter Plan</h3>
              <Button 
                variant={selectedPlan === 'starter' ? "premium" : "outline"}
                className="w-full mt-2 pointer-events-none"
              >
                $9.99/mo
              </Button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✨ Access to all prebuilt bots</p>
              {/* 50 messages no bots */}
              <p>✨ 50 chat messages per day</p>
              <p>✨ 1 personal bot</p>
            </div>
          </div>

          {/* Pro Plan */}
          <div 
            onClick={() => setSelectedPlan('pro')}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md 
              ${selectedPlan === 'pro' 
                ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/20' 
                : 'border-gray-200 dark:border-gray-800 hover:border-sky-500/50 dark:hover:border-sky-500/50'
              }`}
          >
            <div className="flex flex-col items-center mb-4">
              <h3 className="font-semibold text-lg text-foreground">Pro Plan</h3>
              <Button 
                variant={selectedPlan === 'pro' ? "premium" : "outline"}
                className="w-full mt-2 pointer-events-none"
              >
                $29.99/mo
              </Button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🔥 Everything in Starter, plus:</p>  
              {/* 100 mesages 5 bots */}
              <p>🔥 100 chat messages per day</p>
              <p>🔥 10 personal bots</p>
            </div>
          </div>

          {/* Ultimate Plan */}
          <div 
            onClick={() => setSelectedPlan('ultimate')}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md 
              ${selectedPlan === 'ultimate' 
                ? 'border-sky-500 bg-sky-500/10 dark:bg-sky-500/20' 
                : 'border-gray-200 dark:border-gray-800 hover:border-sky-500/50 dark:hover:border-sky-500/50'
              }`}
          >
            <div className="flex flex-col items-center mb-4">
              <h3 className="font-semibold text-lg text-foreground">Ultimate Plan</h3>
              <Button 
                variant={selectedPlan === 'ultimate' ? "premium" : "outline"}
                className="w-full mt-2 pointer-events-none"
              >
                $49.99/mo
              </Button>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>⚡ Everything in Pro, plus:</p>
              <p>⚡ Unlimited chat messages</p>
              <p>⚡ Unlimited personal botst</p>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-background pt-4">
          <Separator className="mb-4" />
          <Button 
            onClick={onSubscribe} 
            disabled={loading} 
            variant="premium" 
            className="w-full"
          >
            Subscribe to {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useProModal } from "@/hooks/use-pro-modal";

export const SubscriptionButton = ({
  isPro = false
}: {
  isPro: boolean;
}) => {

  const proModal = useProModal();


  return (
    <Button size="sm" variant={isPro ? "default" : "premium"}  onClick={proModal.onOpen} >
      {isPro ? "Manage Subscription" : "Upgrade"}
      {!isPro && <Sparkles className="w-4 h-4 ml-2 fill-white" />}
    </Button>
  )
};

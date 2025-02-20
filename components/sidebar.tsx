"use client";

import { Home, Plus, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useProModal } from "@/hooks/use-pro-modal";

interface SidebarProps {
  userId: string;
}

interface UserUsage {
  availableTokens: number;
}

const XP_REQUIRED_FOR_CREATION = 100;

export const Sidebar = ({
  userId
}: SidebarProps) => {
  const proModal = useProModal();
  const router = useRouter();
  const pathname = usePathname();
  const [userUsage, setUserUsage] = useState<any>(null);

  useEffect(() => {
    const fetchUserUsage = async () => {
      try {
        const response = await fetch("/api/user-progress");
        const data = await response.json();
        console.log(data);
        setUserUsage(data);
      } catch (error) {
        console.error("Error fetching user usage:", error);
      }
    };

    fetchUserUsage();
  }, []);

  const onNavigate = async (url: string, requiredXP: number = 0) => {
    // Only check availableTokens for navigation
    console.log(userUsage);
    if (requiredXP === 0 || (userUsage && userUsage.availableTokens >= requiredXP)) {
      await router.push(url);
      return;
    }else{

      proModal.onOpen();
    }
    
  }

  const routes = [
    {
      icon: Home,
      href: '/',
      label: "Home",
      requiredXP: 0,
    },
    {
      icon: Plus,
      href: '/companion/new',
      label: "Create",
      requiredXP: XP_REQUIRED_FOR_CREATION,
    },
    {
      icon: Users,
      href: '/community',
      label: "Community",
      requiredXP: 0,
    },
  ];

  return (
    <div className="space-y-4 flex flex-col h-full text-primary bg-secondary">
      <div className="p-3 flex-1 flex justify-center">
        <div className="space-y-2">
          {routes.map((route) => (
            <div
              onClick={() => onNavigate(route.href, route.requiredXP)}
              key={route.href}
              className={cn(
                "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href && "bg-primary/10 text-primary",
                route.requiredXP > 0 && (!userUsage || userUsage.availableTokens < route.requiredXP) && "opacity-75"
              )}
            >
              <div className="flex flex-col gap-y-2 items-center flex-1">
                <route.icon className="h-5 w-5" />
                {route.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

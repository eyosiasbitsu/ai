"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { CompanionForm } from "./components/companion-form";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
};

const CompanionIdPage = ({
  params
}: CompanionIdPageProps) => {
  const { userId } = useAuth();
  const router = useRouter();
  const [companion, setCompanion] = useState(null);
  const [categories, setCategories] = useState([]);
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    if (!userId && !isAdmin) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      const response = await fetch(`/api/companion/${params.companionId}`);
      const data = await response.json();
      setCompanion(data.companion);
      setCategories(data.categories);
    };

    fetchData();
  }, [userId, isAdmin, params.companionId, router]);

  if (!companion) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-[#27272A] rounded-xl p-8 shadow-xl border border-slate-200 dark:border-zinc-700 backdrop-blur-sm">
          <CompanionForm initialData={companion} categories={categories} />
        </div>
      </div>
    </div>
  );
}
 
export default CompanionIdPage;

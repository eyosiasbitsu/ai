import { redirect } from "next/navigation";
import { auth, redirectToSignIn } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

import { CompanionForm } from "./components/companion-form";

interface CompanionIdPageProps {
  params: {
    companionId: string;
  };
};

const CompanionIdPage = async ({
  params
}: CompanionIdPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const companion = await prismadb.companion.findUnique({
    where: {
      id: params.companionId,
      userId,
    }
  });

  const categories = await prismadb.category.findMany();

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

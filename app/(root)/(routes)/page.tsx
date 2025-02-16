import prismadb from "@/lib/prismadb"
import { Categories } from "@/components/categories"
import { Companions } from "@/components/companions"
import { SearchInput } from "@/components/search-input"
import { auth, redirectToSignIn } from "@clerk/nextjs";

interface RootPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
};

const RootPage = async ({
  searchParams
}: RootPageProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const data = await prismadb.companion.findMany({
    where: {
      AND: [
        {
          categoryId: searchParams.categoryId || undefined,
          name: searchParams.name ? {
            contains: searchParams.name,
            mode: 'insensitive',
          } : undefined,
        },
        {
          OR: [
            { private: false },  // Show all public companions
            { AND: [            // Show private companions only if they belong to the user
              { private: true },
              { userId: userId }
            ]}
          ]
        }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      _count: {
        select: {
          messages: true,
        }
      }
    },
  });

  const categories = await prismadb.category.findMany();

  return (
    <div className="h-full p-4 space-y-2">
      <SearchInput />
      <Categories data={categories} />
      <Companions userId={userId} data={data} />
    </div>
  )
}

export default RootPage
